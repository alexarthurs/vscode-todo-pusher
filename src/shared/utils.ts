import * as vscode from "vscode";
import { CommentSyntax } from "../shared/commentSyntax";

export default class Utils {
	static insertToDoText(editor: vscode.TextEditor, title: string, url: string, type: string) {
		let todoComment = "";
		editor
			.edit(edit => {
				let fileType = editor.document.languageId;
				let commentSyntax =
					CommentSyntax.mappings[fileType] === undefined
						? CommentSyntax.default
                        : CommentSyntax.mappings[fileType];
                        
				let toDoPrefix = "TODO:";

				if (commentSyntax.length > 1) {
					todoComment = `${commentSyntax[0]} ${toDoPrefix} ${title} - ${url} ${commentSyntax[1]}`;
				} else {
					todoComment = `${commentSyntax}${toDoPrefix} ${title} - ${url}`;
				}

				if (Utils.shouldInsertNewLine(editor)) {
					todoComment = "\n" + todoComment;
				}

				edit.insert(editor.selection.active, todoComment);
			})
			.then(success => {
				vscode.window.showInformationMessage(`${type} Created!\n${url}`);
			});
	}

	static shouldInsertNewLine(editor: vscode.TextEditor) {
		//current line needs to be blank or else put comment on next line
		let activeLine = editor.document.lineAt(editor.selection.active.line).text;
		return activeLine && activeLine.length > 0;
	}
}
