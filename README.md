Minimal-Archive
===============

A minimal tool (javascript with no dependencies, php) to display images on a web page.

## Table of Contents

1. Prerequisites
2. Installation
3. Usage
4. Project structure
5. Translation
6. Development
7. Extras (fonts etc.)

## Prerequisites

- `php` >= 7.0

## Installation
1. Upload the contents of `./www` folder to your web space. Make sure the folder is writable.
2. Head to `{your-url}/install`.
3. Enjoy `{your-url}` on any device (+ keyboard navigation).
4. Uninstall using `{your-url}/uninstall`. This will remove the account and the meta file but keep the images.

## Usage
1. Head to `{your-url}/edit` with your email and password.
2. Edit the title and the note.
3. Add, rename or delete a bunch of images.
4. Save or cancel your changes.

## Project structure

```sh
Minimal-Archive/
│
├── src/
│   # sources
│
└── www/
   # This folder is all you need to deploy to your server
   │
   ├── assets/
   ├── images/
   ├── minimalarchive/
   │
   ├── meta.txt
   │   # This file contains all the page info :)
   │
   └── index.php
```

## Translation

The translation file is located in `www/minimalarchive/engine/translations.php`.
It's a simple array where the key is the language code.

## Development

If you plan to edit the javascript, you need to compile it to iife. A simple way to do this would be to use `rollup` via `npx` (if you have `npm` installed, just update to a recent version and you should have nothing to worry about).

```sh
# js files
# the -w option is for watching changes
npx rollup ./src/js/index.js --file www/assets/js/index.js --format iife -w
npx rollup ./src/js/edit.js --file www/assets/js/edit.js --format iife -w

# sass files
# this compiles everything you need
sass --watch src/css:www/assets/css
```

## Extra

Suggested Font: [Arcadia Textbook](https://github.com/SamuelRiversMoore/Arcadia-Textbook)