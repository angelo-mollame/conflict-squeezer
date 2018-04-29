"use strict";

import * as vscode from "vscode";
import { Parser } from "./Parser";

export class ConflictSqueezer {
    public static getSqueezedText(text: string): string {
        try {
            return Parser.parse(text)
                .map(section => section.getText())
                .filter(text => text.length > 0)
                .join("");
        } catch {
            return text;
        }
    }

    public static squeezeConflicts(): void {
        const editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;

        if (!editor) {
            return;
        }

        const document: vscode.TextDocument = editor.document;
        const text: string = document.getText();
        const newText: string = ConflictSqueezer.getSqueezedText(text);

        if (newText !== text) {
            const fullRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(text.length));

            const edit: vscode.WorkspaceEdit = new vscode.WorkspaceEdit();
            edit.replace(document.uri, fullRange, newText);
            vscode.workspace.applyEdit(edit);
        }
    }
}