import * as vscode from "vscode";
import { Configuration } from "../shared/configuration";
import { Constants } from "../shared/constants";

export function setTrelloTokenCmd(): void {
	const config: Configuration | undefined = vscode.workspace.getConfiguration(Constants.APP_NAME);

	if (!config) {
		vscode.window.showInformationMessage("No VS Code configuration found.");
		return undefined;
	}

	vscode.window.showInputBox({
		prompt: "Enter Trello Token (This will be stored in your User Settings)",
		validateInput: (value: string) => {
			if (!value || value.trim().length === 0) {
				return "Cannot be empty";
			}
			return null;
		}
	})
	.then((token) => {
		config.update("trelloToken", token, vscode.ConfigurationTarget.Global);
		vscode.window.showInformationMessage("Trello setup complete! You can now create Trello TODO cards.");
	});
}
