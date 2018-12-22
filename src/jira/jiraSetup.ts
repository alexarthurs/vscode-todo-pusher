import * as vscode from "vscode";
import { Configuration } from "../shared/configuration";
import { JiraConnector } from "./jiraConnector";
import { Constants } from "../shared/constants";
let jiraApiConfig = <JiraApiConfig>{};
var base64 = require("base-64");

export async function jiraSetupCmd(): Promise<void> {
	const config: Configuration | undefined = vscode.workspace.getConfiguration(Constants.APP_NAME);

	if (!config) {
		vscode.window.showInformationMessage("No VS Code configuration found.");
		return undefined;
	}

	showApiTokenBox()
		.then(token => {
			if (!token || token.trim().length === 0) {
				return Promise.reject("User escaped input box");
			}

			return (jiraApiConfig.token = token as string);
		})
		.then(showUsernameBox)
		.then(username => {
			if (!username || username.trim().length === 0) {
				return Promise.reject("User escaped input box");
			}

			return (jiraApiConfig.username = username as string);
		})
		.then(showHostNameBox)
		.then(jiraHost => {
			if (!jiraHost || jiraHost.trim().length === 0) {
				return Promise.reject("User escaped input box");
			}

			return config.update("jiraHost", jiraHost, vscode.ConfigurationTarget.Global);
		})
		.then(processJiraSetup(config));
}

function processJiraSetup(config: Configuration): ((value: void) => void | Thenable<void>) | undefined {
	return () => {  
		var clientToken = base64.encode(`${jiraApiConfig.username}:${jiraApiConfig.token}`);
		config.update("jiraClientToken", clientToken, vscode.ConfigurationTarget.Global);
		var jira = new JiraConnector();
		jira.getProjects().then(
			projects => {
				vscode.window.showInformationMessage(`Jira has been set up successfully!`);
			},
			err => {
				if (err) {
					let regex = new RegExp("<title>(.*)</title>");
					vscode.window.showErrorMessage(`Jira Error - ${err.match(regex)[1]}`);
					return;
				}
				vscode.window.showErrorMessage(`Invalid Jira setup, please try again...`);
			}
		);
	};
}

function showHostNameBox() {
	return vscode.window.showInputBox({
		ignoreFocusOut: true,
		placeHolder: "Jira Host Name",
		prompt: "eg. dev-test.atlassian.net",
		validateInput: (value: string) => {
			if (!value || value.trim().length === 0) {
				return "Cannot be empty";
			}
			return null;
		}
	});
}

function showUsernameBox() {
	return vscode.window.showInputBox({
		ignoreFocusOut: true,
		placeHolder: "Jira Username",
		prompt: "Your Jira Username (Email)",
		validateInput: (value: string) => {
			if (!value || value.trim().length === 0) {
				return "Cannot be empty";
			}
			return null;
		}
	});
}

function showApiTokenBox() {
	return vscode.window.showInputBox({
		ignoreFocusOut: true,
		placeHolder: "Jira Api Token",
		prompt: "Please use the 'Create Jira Token' command to get a new api token.",
		validateInput: (value: string) => {
			if (!value || value.trim().length === 0) {
				return "Cannot be empty";
			}
			return null;
		}
	});
}
