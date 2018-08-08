'use strict';
const path = require('path');
const packager = require('electron-packager');

const options = {
  dir: path.join(__dirname, ".."), // sources directory
  out: __dirname,                  // output directory
  electronVersion: "2.0.6",        // electron version used
  name: "kobolt",                  // name of the app
  executableName: "Kobolt",        // name of executable without ext
  icon: path.join(__dirname, "logo.ico"),
  ignore: [
    "psd/*",
    "temp/*"
  ],                               // ignored folders
  overwrite: true                  // rebuild from scratch every time
};

packager(options).then(appPaths => {
  console.log("Packaging app --> DONE!");
});
