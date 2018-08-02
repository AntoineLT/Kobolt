'use strict';
const electron = require('electron');
const i18n = require('i18n');
const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  MenuItem,
  ipcMain,
  crashReporter
} = electron;

i18n.configure({
  locales: ['en', 'fr'],
  defaultLocale: 'en',
  updateFiles: false,
  objectNotation: true,
  directory: __dirname + '/locales'
});

// Crash report in case of bad behaviour
app.setPath('temp', __dirname + '/../temp');
crashReporter.start({
  productName: 'TaskApp',
  companyName: 'xPlatform.rocks',
  submitURL: 'http://localhost:3000/api/app-crashes',
  uploadToServer: false
});

app.on('ready', () => {
  const {
    width,
    height
  } = electron.screen.getPrimaryDisplay().workAreaSize;
  const trayIcon = new Tray(__dirname + '/img/tray.png');
  const win = new BrowserWindow({
    icon: __dirname + '/img/tray.png',
    width: 300,
    height: 500,
    resizable: false,
    minimizable: false,
    show: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    frame: false
  });
  win.setMenu(null);
  win.loadURL(`file://${__dirname}/views/index.html`);


  // Check if there is a hyphen inside app.getLocale() result
  // Delete everything after this hyphen if it exists
  // Then set the i18n locale value with the one without hyphen
  var idx = app.getLocale().indexOf("-");
  (idx !== -1) ? i18n.setLocale(app.getLocale().slice(0, idx)): i18n.setLocale(app.getLocale());

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
    if (!win.isVisible()) {
      win.show();
    } else {
      win.hide();
    }
  });

  trayIcon.on('right-click', (bounds) => {
    trayIcon.popUpContextMenu(contextMenu, {
      x: bounds.x,
      y: bounds.y
    });
  });

  // Declare some event to trigger them later in HTML
  ipcMain.on('clickReload', () => win.loadURL(`file://${__dirname}/views/index.html`));
  ipcMain.on('clickMin', () => win.hide());
  ipcMain.on('clickClose', () => app.quit());
});
