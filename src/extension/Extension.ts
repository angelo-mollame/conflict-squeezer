"use strict";

import * as vscode from "vscode";
import { ConflictSqueezer } from "./ConflictSqueezer";

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand(
            "conflictSqueezer.squeezeConflicts",
            () => ConflictSqueezer.squeezeConflicts()));
}