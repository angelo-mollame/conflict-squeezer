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

        let state: ParserState = ParserState.OutsideConflict;
        let currentConflict: Conflict | undefined = undefined;
        let currentTextLines: string[] = [];

        for (const line of lines) {
            const startsWithMarkerOursResult: StartsWithResult =
                StringUtils.startsWith(line, Constants.conflictMarkerOurs);

            const startsWithMarkerOriginalResult: StartsWithResult =
                StringUtils.startsWith(line, Constants.conflictMarkerOriginal);

            const startsWithMarkerTheirsResult: StartsWithResult =
                StringUtils.startsWith(line, Constants.conflictMarkerTheirs);

            const startsWithMarkerEndResult: StartsWithResult =
                StringUtils.startsWith(line, Constants.conflictMarkerEnd);

            if (startsWithMarkerOursResult.success) {
                if (state !== ParserState.OutsideConflict) {
                    throw new Error("Unexpected conflict marker");
                }

                if (currentTextLines.length > 0) {
                    sections.push(new TextSection(currentTextLines));
                    currentTextLines = [];
                }

                currentConflict = new Conflict();
                currentConflict.setTextAfterMarkerOurs(startsWithMarkerOursResult.remainingText);
                state = ParserState.Ours;
            } else if (startsWithMarkerOriginalResult.success) {
                if (state !== ParserState.Ours) {
                    throw new Error("Unexpected conflict marker");
                }

                currentConflict!.hasOriginal = true;
                currentConflict!.setTextAfterMarkerOriginal(startsWithMarkerOriginalResult.remainingText);
                state = ParserState.Original;
            } else if (startsWithMarkerTheirsResult.success) {
                if (state !== ParserState.Ours && state !== ParserState.Original) {
                    throw new Error("Unexpected conflict marker");
                }

                currentConflict!.setTextAfterMarkerTheirs(startsWithMarkerTheirsResult.remainingText);
                state = ParserState.Theirs;
            } else if (startsWithMarkerEndResult.success) {
                if (state !== ParserState.Theirs) {
                    throw new Error("Unexpected conflict marker");
                }

                currentConflict!.setTextAfterMarkerEnd(startsWithMarkerEndResult.remainingText);
                sections.push(new ConflictSection(currentConflict!));
                currentConflict = undefined;
                state = ParserState.OutsideConflict;
            } else {
                if (state === ParserState.OutsideConflict) {
                    currentTextLines.push(line);
                } else if (state === ParserState.Ours) {
                    currentConflict!.addOurLine(line);
                } else if (state === ParserState.Original) {
                    currentConflict!.addOriginalLine(line);
                } else if (state === ParserState.Theirs) {
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

const enum ParserState {
    OutsideConflict,
    Ours,
    Original,
    Theirs
}