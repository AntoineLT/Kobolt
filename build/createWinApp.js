'use strict';
const fs = require('fs-extra');
const srcFolder = __dirname + '/../src'
const appFolder = __dirname + '/../build/windows/resources/app'

// Check if app folder exists before build
if(fs.existsSync(appFolder)) {
  // If it exists we delete it
  fs.removeSync(appFolder);
}
// We recreate the app folder to copy new sources there
fs.mkdirSync(appFolder);
// We copy the modified sources to the app folder
fs.copySync(__dirname + '/../package.json', appFolder+'/package.json');
fs.copySync(srcFolder, appFolder+'/src');

// console.log(__dirname + '/windows');
//
// const electronInstaller = require('electron-winstaller');
// const resultPromise = electronInstaller.createWindowsInstaller({
//     appDirectory: __dirname + '/windows',
//     outputDirectory: __dirname + '/dist/windows',
//     authors: 'AntoineLT',
//     exe: 'Kobolt.exe',
//     iconUrl: './build/logo.ico',
//     setupIcon: './build/logo.ico'
// });
//
// resultPromise.then(() => console.log("It worked!"), (e) => console.log(`No dice: ${e.message}`));
