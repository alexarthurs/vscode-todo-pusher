import * as vscode from "vscode";
import { Configuration } from "../shared/configuration";
import { JiraConnector } from "./jiraConnector";
import { Constants } from "../shared/constants";
import Utils from "../shared/utils";
let editor: vscode.TextEditor;
var path = require("path");
let jira: JiraConnector;
let projectIssueMetadata = <Project>{};
let jiraToDo = <JiraToDo>{};
const config: Configuration | undefined = vscode.workspace.getConfiguration(Constants.APP_NAME);

export function createJiraIssueCmd(): void {
	if (vscode.window.activeTextEditor === undefined || vscode.window.activeTextEditor.document === undefined) {
		vscode.window.showWarningMessage("Must have a file open");
		return;
	}
	
	editor = vscode.window.activeTextEditor;

	if (!config) {
		vscode.window.showInformationMessage("No VS Code configuration found.");
		return undefined;
	}

	jira = new JiraConnector();

	showProjectQuickPick()
		.then(projectName => {
			jiraToDo.selectedProject = jiraToDo.projects.find(project => project.name === projectName) as IProject;

			return showIssueTypeQuickPick(
				getIssueMetadata(jiraToDo.selectedProject.key)
					.then(validateIssueMetadata())
					.then(getProjectIssueTypes())
			);
		})
		.then(issueTypeName => {
			jiraToDo.selectedIssueType = jiraToDo.issueTypes.find(
				issueType => issueType.name === issueTypeName
			) as PickerItem;
			return jiraToDo;
		})
		.then(showTODOSummary)
		.then(summary => {
			jiraToDo.summary = summary as string;
		})
		.then(showTODODescription)
		.then(description => {
			jiraToDo.description = description as string;
			return jiraToDo;
		})
		.then(createJiraIssue);
}

async function showProjectQuickPick() {
	return vscode.window.showQuickPick(getProjects(), {
		placeHolder: "Pick Jira Project"
	});
}

async function getProjects() {
	let projects = (await jira.getProjects().then(
		projects => projects,
		err => {
			if (err.message) {
				vscode.window.showErrorMessage(`${err.message}`);
				return;
			}

			let regex = new RegExp("<title>(.*)</title>");
			vscode.window.showErrorMessage(`Jira Error - ${err.match(regex)[1]}`);
			return;
		}
	)) as IProject[];

	jiraToDo.projects = projects;

	return jiraToDo.projects.map(project => project.name);
}

function getProjectIssueTypes():
	| ((value: Project | undefined) => string[] | PromiseLike<string[] | undefined> | undefined)
	| null
	| undefined {
	return selectedProject => {
		if (selectedProject === undefined) {
			vscode.window.showErrorMessage("There is an unknown issue with the selected project.");
			return;
		}

		let project: Project = selectedProject as Project;

		jiraToDo.issueTypes = project.issuetypes.map((issueType: Issuetype) => {
			return <PickerItem>issueType;
		});

		var issueTypes = jiraToDo.issueTypes.map(issueType => issueType.name);
		return issueTypes as string[];
	};
}

function validateIssueMetadata():
	| ((value: void | IssueMetadata) => Project | PromiseLike<Project | undefined> | undefined)
	| null
	| undefined {
	return issueMetadata => {
		if (!issueMetadata || issueMetadata.projects.length <= 0) {
			vscode.window.showErrorMessage("No project issue metadata found.");
			return;
		}
		projectIssueMetadata = issueMetadata.projects[0] as Project;
		if (projectIssueMetadata.issuetypes.length <= 0) {
			vscode.window.showErrorMessage("No issue types found for project.");
			return;
		}
		return projectIssueMetadata;
	};
}

async function getIssueMetadata(projectKey: string) {
	return await jira.getIssueMetadata({ projectKeys: projectKey, expand: "projects.issuetypes.fields" }).then(
		issueMetadata => {
			return issueMetadata as IssueMetadata;
		},
		err => {
			if (err) {
				if (err.message) {
					vscode.window.showErrorMessage(`${err.message}`);
					return;
				}

				let regex = new RegExp("<title>(.*)</title>");
				vscode.window.showErrorMessage(`Jira Error - ${err.match(regex)[1]}`);
				return;
			}

			vscode.window.showErrorMessage(`Invalid Jira setup, please try again...`);
		}
	);
}

function showIssueTypeQuickPick(issueTypes: any) {
	return vscode.window.showQuickPick(issueTypes as string[], {
		placeHolder: "Pick an Issue Type"
	});
}

function showTODOSummary() {
	return vscode.window.showInputBox({
		prompt: "Enter TODO Title",
		validateInput: (value: string) => {
			if (!value || value.trim().length === 0) {
				return "Cannot be empty";
			}
			return null;
		}
	});
}

function showTODODescription() {
	return vscode.window.showInputBox({
		prompt: "Enter TODO Description",
		validateInput: (value: string) => {
			if (!value || value.trim().length === 0) {
				return "Cannot be empty";
			}
			return null;
		}
	});
}

async function createJiraIssue(jiraToDo: JiraToDo) {
	let lineNumber = Utils.shouldInsertNewLine(editor)
		? editor.selection.active.line + 2
		: editor.selection.active.line + 1;
	let jiraIssueDesc = `${jiraToDo.description}\n\n*${path.basename(editor.document.fileName)} at Line ${lineNumber}*`;

	let createIssue: CreateIssue = {
		fields: {
			description: jiraIssueDesc,
			summary: jiraToDo.summary,
			project: {
				key: jiraToDo.selectedProject.key
			} as Project,
			issuetype: {
				name: jiraToDo.selectedIssueType.name
			} as Issuetype
		}
	};

	jira.createIssue(createIssue).then(
		response => {			
			if (!config) {
				vscode.window.showInformationMessage("No VS Code configuration found.");
				jiraToDo.url = "There was an issue retrieving the Jira Url";
			} else {
				let host = config.get("jiraHost") as string;
				let issueKey = response.key;				
				jiraToDo.url = `https://${host}/projects/${issueKey.split('-')[0]}/issues/${issueKey}`;
			}

			Utils.insertToDoText(editor, jiraToDo.summary, jiraToDo.url, "Jira Issue");
			return;
		},
		err => {
			if (err) {
				if (err.message) {
					vscode.window.showErrorMessage(`${err.message}`);
					return;
				}

				let regex = new RegExp("<title>(.*)</title>");
				vscode.window.showErrorMessage(`Jira Error - ${err.match(regex)[1]}`);
				return;
			}

			vscode.window.showErrorMessage(`Unable to create issue...`);
		}
	);
}
