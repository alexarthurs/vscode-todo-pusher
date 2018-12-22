"use strict";

import * as vscode from "vscode";

import { jiraSetupCmd } from './jira/jiraSetup';
import { createJiraTokenCmd } from './jira/createJiraToken';
import { createJiraIssueCmd } from "./jira/createJiraIssue";

import { createTrelloCardCmd } from './trello/createTrelloCard';
import { getTrelloTokenCmd } from './trello/getTrelloToken';
import { setTrelloTokenCmd } from './trello/setTrelloToken';

export function activate(context: vscode.ExtensionContext) {
	const disposableCommands = [ 
		vscode.commands.registerCommand("todo-pusher.jiraSetup", jiraSetupCmd),
		vscode.commands.registerCommand("todo-pusher.createJiraToken", createJiraTokenCmd),
		vscode.commands.registerCommand("todo-pusher.createJiraIssue", createJiraIssueCmd),
		vscode.commands.registerCommand("todo-pusher.createTrelloCard", createTrelloCardCmd),
		vscode.commands.registerCommand("todo-pusher.getTrelloToken", getTrelloTokenCmd),
		vscode.commands.registerCommand("todo-pusher.setTrelloToken", setTrelloTokenCmd)
	];

	disposableCommands.forEach((disposable) => context.subscriptions.push(disposable));
}

export function deactivate() {}