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
  const mainWin = new BrowserWindow({
    icon: __dirname + '/img/tray.png',
    width: 350,
    height: 550,
    resizable: false,
    minimizable: false,
    show: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    frame: false
  });
  mainWin.setMenu(null);
  mainWin.loadURL(`file://${__dirname}/views/index.html`);
  mainWin.setPosition(width - mainWin.getSize()[0], height - mainWin.getSize()[1]);
  // mainWin.webContents.openDevTools();

  const closeModal = new BrowserWindow({
    parent: mainWin,
    width: 330,
    height: 136,
    resizable: false,
    modal: true,
    show: false,
    frame: false
  });
  closeModal.setMenu(null);
  closeModal.loadURL(`file://${__dirname}/views/closeModal.html`);
  closeModal.setPosition(width - closeModal.getSize()[0] - 11, height - closeModal.getSize()[1] - 11);

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
      closeModal.show();
    }
  }));

  trayIcon.on('click', () => {
    if (!mainWin.isVisible()) {
      mainWin.show();
    } else {
      mainWin.hide();
    }
  });

  trayIcon.on('right-click', (bounds) => {
    trayIcon.popUpContextMenu(contextMenu, {
      x: bounds.x,
      y: bounds.y
    });
  });

  // Declare some event to trigger them later in HTML
  ipcMain.on('clickReload', () => mainWin.loadURL(`file://${__dirname}/views/index.html`));
  ipcMain.on('clickMin', () => mainWin.hide());
  ipcMain.on('clickClose', () => closeModal.show());
  ipcMain.on('cancelModal', () => closeModal.hide());
  ipcMain.on('yesModal', () => app.quit());
});
