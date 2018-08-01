'use strict';
const electron = require('electron');
const i18n = require('i18n');
const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  MenuItem
} = electron;

i18n.configure({
  locales: ['en', 'fr'],
  defaultLocale: 'en',
  updateFiles: false,
  objectNotation: true,
  directory: __dirname + '/locales'
});

// How to set locale of the app context and use JSON dictionnary
// i18n.setLocale('fr');
// console.log(i18n.__("tray.contextMenu.restart"));

app.on('ready', () => {
  const {
    width,
    height
  } = electron.screen.getPrimaryDisplay().workAreaSize;
  const trayIcon = new Tray('src/img/tray.png');
  const win = new BrowserWindow({
    icon: 'src/img/tray.png',
    width: 300,
    height: 400,
    resizable: false,
    show: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    frame: false
  });

  let contextMenu = new Menu();
  contextMenu.append(new MenuItem({
    type: 'normal',
    label: i18n.__("tray.contextMenu.restart"),
    click: () => {
      app.relaunch();
      app.quit();
    }
  }));
  contextMenu.append(new MenuItem({
    type: 'normal',
    label: i18n.__("tray.contextMenu.close"),
    click: () => {
      app.quit();
    }
  }));

  trayIcon.on('click', () => {
    win.setPosition(width - win.getSize()[0] - 1, height - win.getSize()[1] - 1);
    if (!win.isVisible()) win.show();
    else win.hide();
  });

  trayIcon.on('right-click', (bounds) => {
    trayIcon.popUpContextMenu(contextMenu, {
      x: bounds.x,
      y: bounds.y
    });
  });
});

app.on('window-all-closed', app.quit);
