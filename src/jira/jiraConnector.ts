import * as vscode from "vscode";
import { Configuration } from "../shared/configuration";
import { Constants } from "../shared/constants";
var jiraClient = require("jira-connector");

export class JiraConnector {
	jiraInstance: any;

	constructor() {
		const config: Configuration | undefined = vscode.workspace.getConfiguration(Constants.APP_NAME);

		if (!config) {
			vscode.window.showInformationMessage("No VS Code configuration found.");
			return;
		}

		let host = config.get("jiraHost") as string;
		let clientToken = config.get("jiraClientToken") as string;
		if (host.length <= 0 || clientToken.length <= 0) {
			vscode.window.showWarningMessage("Please run 'Jira Setup' first");
			return;
		}

		const protocol = "https";
		const portPosition = host.indexOf(":");
		const port = portPosition !== -1 ? host.substring(portPosition + 1) : undefined;
		if (portPosition !== -1) {
			host = host.substring(0, portPosition);
		}

		this.jiraInstance = new jiraClient({
			host,
			port,
			protocol,
			basic_auth: { 
				base64: config.get("jiraClientToken")
			}
		});
	}

	async getProjects(): Promise<IProject[]> {
		return await this.jiraInstance.project.getAllProjects();
	}

	async getIssueMetadata(options: any): Promise<IssueMetadata> {
		return await this.jiraInstance.issue.getCreateMetadata(options);
	}

	async createIssue(options: any): Promise<any> {
		return await this.jiraInstance.issue.createIssue(options);
	}
}
