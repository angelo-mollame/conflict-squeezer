# Conflict Squeezer

This extension simplifies the resolution of Git merge conflicts through the editor.

## Features

The extension adds a "Squeeze Conflicts" command, which scans all the merge conflicts in the current file, and:
- automatically removes the conflict (picking the text and removing the conflict markers) if the two sides of the
conflict are identical
- if the two sides of the conflict are not entirely identical, but contain some lines that are identical at the top or
at the bottom, it simplifies the conflict by moving these common lines out of the conflict

This allows to quickly resolve merge conflicts by editing the two sides until their content is identical, at which point
the "Squeeze Conflicts" command will remove the conflict.

## Usage

1. Edit the two sides of the conflict to make them identical (or to gradually reduce their difference)
2. CTRL + SHIFT + P -> Squeeze Conflicts

![Usage 1](./usage1.gif)

![Usage 2](./usage2.gif)

## Change Log

### 1.0.1

- Added icon

### 0.0.3

- Added support for diff3 format.
- Added support for \r line separator.
- Fixed bugs.