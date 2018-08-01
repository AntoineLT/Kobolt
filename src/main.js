'use strict';
const electron = require('electron');
const i18n     = require('i18n');
const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  MenuItem
} = electron;

i18n.configure({
    locales:['en', 'fr'],
    defaultLocale: 'en',
    updateFiles: false,
    objectNotation: true,
    directory: __dirname + '/locales'
});

i18n.setLocale('fr');
console.log(i18n.__("tray.contextMenu.restart"));
