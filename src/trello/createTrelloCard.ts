import * as vscode from "vscode";
import { Constants } from "../shared/constants";
import { Configuration } from "../shared/configuration";
import Utils from "../shared/utils";
var path = require("path");
let request = require("request");
let editor: vscode.TextEditor;
let trelloToDo = <TrelloToDo>{};
let token: string;

export function createTrelloCardCmd(): void {
	if (vscode.window.activeTextEditor === undefined || vscode.window.activeTextEditor.document === undefined) {
		vscode.window.showWarningMessage("Must have a file open");
		return;
	} 

	editor = vscode.window.activeTextEditor;

	const config: Configuration | undefined = vscode.workspace.getConfiguration(Constants.APP_NAME);

	if (!config) {
		vscode.window.showInformationMessage("No VS Code configuration found.");
		return;
	}

	if (!config.trelloToken || config.trelloToken.length === 0) {
		vscode.window.showWarningMessage("You need to set a Trello Token before creating a Card. Go to extension page for quick guide.");
	} else {
		token = config.trelloToken as string;
		CreateTrelloCardOperations();
	}
}

function CreateTrelloCardOperations() {
	showBoardsQuickPick()
		.then(boardName => {
			return (trelloToDo.selectedBoard = trelloToDo.boards.find(board => board.name === boardName) as PickerItem);
		})
		.then(showListsQuickPick)
		.then(listName => {
			trelloToDo.selectedList = trelloToDo.lists.find(list => list.name === listName) as PickerItem;
			return trelloToDo;
		})
		.then(showLabelsQuickPick)
		.then(labelNames => {
			let selectedLabelNames: string[] = labelNames as string[];
			trelloToDo.selectedLabels = trelloToDo.labels.filter(label => selectedLabelNames.indexOf(label.name) > -1);
		})
		.then(showTODOTitle)
		.then(title => {
			trelloToDo.title = title as string;
		})
		.then(showTODODescription)
		.then(description => {
			trelloToDo.description = description as string;
			return trelloToDo;
		})
		.then(createTrelloCard);
}

/**
 *  Create Task
 */

async function showBoardsQuickPick() {
	let getBoards = () => {
		return new Promise<Array<string>>((resolve, reject) => {
			let apiCall = "/members/me/boards";
			let apiUrl = `${Constants.TRELLO_BASE_URL}${apiCall}`;

			let options = {
				method: "GET",
				url: apiUrl,
				qs: {
					filter: "open",
					fields: "name,id",
					organization: "false",
					organization_fields: "name,displayName",
					key: Constants.TRELLO_API_KEY,
					token: token
				}
			};

			request(options, (err: any, res: any, body: any) => {
				if (err) {
					vscode.window.showErrorMessage(`Trello Api Error: ${err}`);
					reject();
				}

				if (res.statusCode !== 200) {
					vscode.window.showErrorMessage(`Trello Api Error: ${res.statusMessage}`);
					reject();
				}

				trelloToDo.boards = JSON.parse(body);
				resolve(trelloToDo.boards.map(board => board.name));
			});
		});
	};

	return vscode.window.showQuickPick(getBoards(), {
		placeHolder: "Pick a board"
	});
}

async function showListsQuickPick(board: PickerItem) {
	let getLists = () => {
		return new Promise<Array<string>>((resolve, reject) => {
			let apiCall = `/boards/${board.id}/lists`;
			let apiUrl = `${Constants.TRELLO_BASE_URL}${apiCall}`;

			let options = {
				method: "GET",
				url: apiUrl,
				qs: {
					filter: "open",
					fields: "name,id",
					key: Constants.TRELLO_API_KEY,
					token: token
				}
			};

			request(options, (err: any, res: any, body: any) => {
				if (err) {
					vscode.window.showErrorMessage(`Trello Api Error: ${err}`);
					reject();
				}

				if (res.statusCode !== 200) {
					vscode.window.showErrorMessage(`Trello Api Error: ${res.statusMessage}`);
					reject();
				}

				trelloToDo.lists = JSON.parse(body);
				resolve(trelloToDo.lists.map(list => list.name));
			});
		});
	};

	return vscode.window.showQuickPick(getLists(), {
		placeHolder: "Pick a list"
	});
}

async function showLabelsQuickPick(trelloToDo: TrelloToDo) {
	let getlabels = () => {
		return new Promise<Array<string>>((resolve, reject) => {
			let apiCall = `/boards/${trelloToDo.selectedBoard.id}/labels`;
			let apiUrl = `${Constants.TRELLO_BASE_URL}${apiCall}`;

			let options = {
				method: "GET",
				url: apiUrl,
				qs: {
					filter: "open",
					fields: "name,id,color",
					key: Constants.TRELLO_API_KEY,
					token: token
				}
			};

			request(options, (err: any, res: any, body: any) => {
				if (err) {
					vscode.window.showErrorMessage(`Trello Api Error: ${err}`);
					reject();
				}

				if (res.statusCode !== 200) {
					vscode.window.showErrorMessage(`Trello Api Error: ${res.statusMessage}`);
					reject();
				}

				let labels: Array<any> = JSON.parse(body);
				labels.forEach(label => {
					label.name = label.name ? `${label.name} - ${label.color}` : label.color;
				});
				trelloToDo.labels = labels;

				resolve(trelloToDo.labels.map(label => label.name));
			});
		});
	};

	return vscode.window.showQuickPick(getlabels(), {
		canPickMany: true,
		placeHolder: "Pick a label"
	});
}

function showTODOTitle() {
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

async function createTrelloCard(trelloToDo: TrelloToDo) {
	let apiCall = "/cards";
	let apiUrl = `${Constants.TRELLO_BASE_URL}${apiCall}`;
	let lineNumber = Utils.shouldInsertNewLine(editor) ? editor.selection.active.line + 2 : editor.selection.active.line + 1;
	let trelloCardDesc = `${trelloToDo.description}\n\n*${path.basename(
		editor.document.fileName
	)} at Line ${lineNumber}*`;

	let options = {
		method: "POST",
		url: apiUrl,
		qs: {
			name: trelloToDo.title,
			desc: trelloCardDesc,
			idList: trelloToDo.selectedList.id,
			idLabels: trelloToDo.selectedLabels.map(label => label.id).join(","),
			keepFromSource: "all",
			key: Constants.TRELLO_API_KEY,
			token: token
		}
	};

	request(options, (err: any, res: any, body: any) => {
		if (err) {
			vscode.window.showErrorMessage(`Trello Api Error: ${err}`);
		}

		if (res.statusCode !== 200) {
			vscode.window.showErrorMessage(`Trello Api Error: ${res.statusMessage}`);
		}

		trelloToDo.url = JSON.parse(body).url;
		Utils.insertToDoText(editor, trelloToDo.title, trelloToDo.url, "Trello Card");
	});
}