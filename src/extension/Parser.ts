"use strict";

import { Conflict } from "./Conflict";
import { ConflictSection } from "./ConflictSection";
import { Constants } from "./Constants";
import { ISection } from "./ISection";
import { StringUtils, StartsWithResult } from "./StringUtils";
import { TextSection } from "./TextSection";

export class Parser {
    public static getLines(text: string): string[] {
        const lines: string[] = [];
        const textLength: number = text.length;

        let currentCharacters: string[] = [];

        for (let i: number = 0; i < textLength; i++) {
            const character: string = text.charAt(i);

            if (character === "\n") {
                currentCharacters.push(character);
                lines.push(currentCharacters.join(""));
                currentCharacters = [];
            } else {
                if (i > 0 && text.charAt(i - 1) === "\r") {
                    lines.push(currentCharacters.join(""));
                    currentCharacters = [ character ];
                } else {
                    currentCharacters.push(character);
                }
            }
        }

        if (currentCharacters.length > 0) {
            lines.push(currentCharacters.join(""));
        }

        return lines;
    }

    public static parse(text: string): ISection[] {
        const sections: ISection[] = [];
        const lines: string[] = Parser.getLines(text);

        // State 0: outside the conflict
        // State 1: between "<<<<<<< our-branch" and "======="
        // State 2: between "=======" and ">>>>>>> their-branch"
        let state: number = 0;
        let currentConflict: Conflict | undefined = undefined;
        let currentTextLines: string[] = [];

        for (const line of lines) {
            const startsWithMarker1Result: StartsWithResult = StringUtils.startsWith(line, Constants.conflictMarker1);
            const startsWithMarker2Result: StartsWithResult = StringUtils.startsWith(line, Constants.conflictMarker2);
            const startsWithMarker3Result: StartsWithResult = StringUtils.startsWith(line, Constants.conflictMarker3);

            if (startsWithMarker1Result.success) {
                if (state !== 0) {
                    throw new Error("Unexpected conflict marker");
                }

                if (currentTextLines.length > 0) {
                    sections.push(new TextSection(currentTextLines));
                    currentTextLines = [];
                }

                currentConflict = new Conflict();
                currentConflict.setTextAfterMarker1(startsWithMarker1Result.remainingText);
                state = 1;
            } else if (startsWithMarker2Result.success) {
                if (state !== 1) {
                    throw new Error("Unexpected conflict marker");
                }

                currentConflict!.setTextAfterMarker2(startsWithMarker2Result.remainingText);
                state = 2;
            } else if (startsWithMarker3Result.success) {
                if (state !== 2) {
                    throw new Error("Unexpected conflict marker");
                }

                currentConflict!.setTextAfterMarker3(startsWithMarker3Result.remainingText);
                sections.push(new ConflictSection(currentConflict!));
                currentConflict = undefined;
                state = 0;
            } else {
                if (state === 0) {
                    currentTextLines.push(line);
                } else if (state === 1) {
                    currentConflict!.addOurLine(line);
                } else if (state === 2) {
                    currentConflict!.addTheirLine(line);
                } else {
                    throw new Error("Unexpected state");
                }
            }
        }

        if (currentConflict) {
            throw new Error("Conflict still open");
        }

        if (currentTextLines.length > 0) {
            sections.push(new TextSection(currentTextLines));
        }

        return sections;
    }
}