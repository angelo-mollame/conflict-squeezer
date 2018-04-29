"use strict";

import * as assert from 'assert';
import { ConflictSqueezer } from '../extension/ConflictSqueezer';

suite("tests", () => {
    runTestsWithLineSeparator("\r");
    runTestsWithLineSeparator("\n");
    runTestsWithLineSeparator("\r\n");

    test(
        "mixed line separators",
        () => {
            const inputText =
                "aaa" + "\r" +
                "<<<<<<< HEAD" + "\r\n" +
                "bbb" + "\n" +
                "=======" + "\r" +
                "bbb" + "\n" +
                ">>>>>>> master" + "\r" +
                "ccc" + "\r\n";

            const expectedOutputText =
                "aaa" + "\r" +
                "bbb" + "\n" +
                "ccc" + "\r\n";

            testSqueeze(inputText, expectedOutputText);
        });
});

function runTestWithLineSeparator(testName: string, lineSeparator: string, testAction: () => void): void {
    test(`${testName} (${JSON.stringify(lineSeparator)})`, testAction);
}

function runTestsWithLineSeparator(lineSeparator: string): void {
    runTestWithLineSeparator(
        "no conflicts",
        lineSeparator,
        () => {
            const inputText =
                "aaa" + lineSeparator +
                "bbb" + lineSeparator +
                "ccc" + lineSeparator;

            const expectedOutputText =
                "aaa" + lineSeparator +
                "bbb" + lineSeparator +
                "ccc" + lineSeparator;

            testSqueeze(inputText, expectedOutputText);
        });

    runTestWithLineSeparator(
        "conflict removed",
        lineSeparator,
        () => {
            const inputText =
                "aaa" + lineSeparator +
                "<<<<<<< HEAD" + lineSeparator +
                "bbb" + lineSeparator +
                "=======" + lineSeparator +
                "bbb" + lineSeparator +
                ">>>>>>> master" + lineSeparator +
                "ccc" + lineSeparator;

            const expectedOutputText =
                "aaa" + lineSeparator +
                "bbb" + lineSeparator +
                "ccc" + lineSeparator;

            testSqueeze(inputText, expectedOutputText);
        });

    runTestWithLineSeparator(
        "blank-line conflict removed",
        lineSeparator,
        () => {
            const inputText =
                "aaa" + lineSeparator +
                "<<<<<<< HEAD" + lineSeparator +
                "=======" + lineSeparator +
                ">>>>>>> master" + lineSeparator +
                "ccc" + lineSeparator;

            const expectedOutputText =
                "aaa" + lineSeparator +
                "ccc" + lineSeparator;

            testSqueeze(inputText, expectedOutputText);
        });

    runTestWithLineSeparator(
        "common section at the top",
        lineSeparator,
        () => {
            const inputText =
                "aaa" + lineSeparator +
                "<<<<<<< HEAD" + lineSeparator +
                "bbb" + lineSeparator +
                "xxx" + lineSeparator +
                "=======" + lineSeparator +
                "bbb" + lineSeparator +
                "yyy" + lineSeparator +
                ">>>>>>> master" + lineSeparator +
                "ccc" + lineSeparator;

            const expectedOutputText =
                "aaa" + lineSeparator +
                "bbb" + lineSeparator +
                "<<<<<<< HEAD" + lineSeparator +
                "xxx" + lineSeparator +
                "=======" + lineSeparator +
                "yyy" + lineSeparator +
                ">>>>>>> master" + lineSeparator +
                "ccc" + lineSeparator;

            testSqueeze(inputText, expectedOutputText);
        });

    runTestWithLineSeparator(
        "common section at the bottom",
        lineSeparator,
        () => {
            const inputText =
                "aaa" + lineSeparator +
                "<<<<<<< HEAD" + lineSeparator +
                "xxx" + lineSeparator +
                "bbb" + lineSeparator +
                "=======" + lineSeparator +
                "yyy" + lineSeparator +
                "bbb" + lineSeparator +
                ">>>>>>> master" + lineSeparator +
                "ccc" + lineSeparator;

            const expectedOutputText =
                "aaa" + lineSeparator +
                "<<<<<<< HEAD" + lineSeparator +
                "xxx" + lineSeparator +
                "=======" + lineSeparator +
                "yyy" + lineSeparator +
                ">>>>>>> master" + lineSeparator +
                "bbb" + lineSeparator +
                "ccc" + lineSeparator;

            testSqueeze(inputText, expectedOutputText);
        });

    runTestWithLineSeparator(
        "common sections at the top and at the bottom",
        lineSeparator,
        () => {
            const inputText =
                "aaa" + lineSeparator +
                "<<<<<<< HEAD" + lineSeparator +
                "bbb1" + lineSeparator +
                "xxx" + lineSeparator +
                "bbb2" + lineSeparator +
                "=======" + lineSeparator +
                "bbb1" + lineSeparator +
                "yyy" + lineSeparator +
                "bbb2" + lineSeparator +
                ">>>>>>> master" + lineSeparator +
                "ccc" + lineSeparator;

            const expectedOutputText =
                "aaa" + lineSeparator +
                "bbb1" + lineSeparator +
                "<<<<<<< HEAD" + lineSeparator +
                "xxx" + lineSeparator +
                "=======" + lineSeparator +
                "yyy" + lineSeparator +
                ">>>>>>> master" + lineSeparator +
                "bbb2" + lineSeparator +
                "ccc" + lineSeparator;

            testSqueeze(inputText, expectedOutputText);
        });

    runTestWithLineSeparator(
        "no final blank line",
        lineSeparator,
        () => {
            const inputText =
                "aaa" + lineSeparator +
                "<<<<<<< HEAD" + lineSeparator +
                "bbb" + lineSeparator +
                "=======" + lineSeparator +
                "bbb" + lineSeparator +
                ">>>>>>> master" + lineSeparator +
                "ccc";

            const expectedOutputText =
                "aaa" + lineSeparator +
                "bbb" + lineSeparator +
                "ccc";

            testSqueeze(inputText, expectedOutputText);
        });
}

function testSqueeze(inputText: string, expectedOutputText: string): void {
    const actualOutputText: string = ConflictSqueezer.getSqueezedText(inputText);
    assert.equal(actualOutputText, expectedOutputText);
}