"use strict";

import * as vscode from "vscode";
import { ConflictSqueezer } from "./ConflictSqueezer";

export function activate(context: vscode.ExtensionContext) {
    const conflictSqueezer: ConflictSqueezer = new ConflictSqueezer();

    context.subscriptions.push(
        vscode.commands.registerCommand(
            "conflictSqueezer.squeezeConflicts",
            () => conflictSqueezer.squeezeConflicts()));
}