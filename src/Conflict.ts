"use strict";

import { Constants } from "./Constants";

export class Conflict {
    private ourBranch: string | undefined = undefined;
    private theirBranch: string | undefined = undefined;

    private ourLines: string[] = [];
    private theirLines: string[] = [];

    public getSqueezedText(): string {
        const minNumberOfLines: number = Math.min(this.ourLines.length, this.theirLines.length);
        const maxNumberOfLines: number = Math.max(this.ourLines.length, this.theirLines.length);

        // Top cursor will contain the number of equal lines from the top.
        // Bottom cursor will contain the number of equal lines from the bottom.
        let topCursor: number = 0;
        let bottomCursor: number = 0;

        while (topCursor < minNumberOfLines) {
            const ourLine: string = this.ourLines[topCursor];
            const theirLine: string = this.theirLines[topCursor];

            if (ourLine === theirLine) {
                topCursor++;
            } else {
                break;
            }
        }

        // We need to subtract topCursor, to ensure that topCursor + bottomCursor <= minNumberOfLines
        while (bottomCursor < minNumberOfLines - topCursor) {
            const ourLine: string = this.ourLines[this.ourLines.length - 1 - bottomCursor];
            const theirLine: string = this.theirLines[this.theirLines.length - 1 - bottomCursor];

            if (ourLine === theirLine) {
                bottomCursor++;
            } else {
                break;
            }
        }

        const equalTopLines: string[] = this.ourLines.slice(0, topCursor);

        const equalBottomLines: string[] = this.ourLines.slice(
            this.ourLines.length - bottomCursor, this.ourLines.length);

        const equalTopText: string = equalTopLines.join(Constants.lineSeparator);
        const equalBottomText: string = equalBottomLines.join(Constants.lineSeparator);

        let parts: string[];

        if (topCursor + bottomCursor === maxNumberOfLines) {
            parts = [equalTopText, equalBottomText];
        } else {
            const ourUnequalLines: string[] = this.ourLines.slice(topCursor, this.ourLines.length - bottomCursor);
            const theirUnequalLines: string[] = this.theirLines.slice(topCursor, this.theirLines.length - bottomCursor);

            parts = [
                equalTopText,
                Constants.conflictMarker1 + this.ourBranch,
                ourUnequalLines.join(Constants.lineSeparator),
                Constants.conflictMarker2,
                theirUnequalLines.join(Constants.lineSeparator),
                Constants.conflictMarker3 + this.theirBranch,
                equalBottomText
            ];
        }

        return parts.filter(part => part.length > 0).join(Constants.lineSeparator);
    }

    public addOurLine(line: string): void {
        this.ourLines.push(line);
    }

    public addTheirLine(line: string): void {
        this.theirLines.push(line);
    }

    public setOurBranch(branch: string): void {
        this.ourBranch = branch;
    }

    public setTheirBranch(branch: string): void {
        this.theirBranch = branch;
    }
}