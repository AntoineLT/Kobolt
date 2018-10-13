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
  crashReporter,
  session
} = electron;
const http = require("https");

const db = require(__dirname + "/model/dataStore.js");
db.initData();

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

  const loadingScreen = new BrowserWindow({
    transparent: true,
    width: 150,
    height: 150,
    resizable: false,
    minimizable: false,
    show: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    frame: false
  });
  // loadingScreen.webContents.openDevTools();
  loadingScreen.loadFile(`${__dirname}/views/html/loadingScreen.html`);

  const trayIcon = new Tray(__dirname + '/img/tray.png');
  const mainWin = new BrowserWindow({
    icon: __dirname + '/img/tray.png',
    width: 350,
    height: 550,
    minWidth: 350,
    maxWidth: 350,
    resizable: true,
    minimizable: false,
    show: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    frame: false
  });
  mainWin.on('ready-to-show', () => {
    mainWin.show();
    setTimeout(() => loadingScreen.close(), 250);
  });
  mainWin.setMenu(null);
  mainWin.loadURL(`file://${__dirname}/views/index.html`);
  mainWin.setPosition(width - mainWin.getSize()[0], height - mainWin.getSize()[1]);
  // mainWin.webContents.openDevTools();

  const loginWin = new BrowserWindow({
    icon: __dirname + '/img/tray.png',
    width: 550,
    height: 360,
    resizable: false,
    minimizable: false,
    show: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    frame: false
  });
  loginWin.setMenu(null);
  loginWin.loadURL(db.getUrl());
  loginWin.webContents.on('did-get-redirect-request', () => {
    if (loginWin.isVisible()) loginWin.hide();
  });
  // Remove scrollbars from loginWin web view
  loginWin.webContents.on('dom-ready', (event) => {
    loginWin.webContents.insertCSS('html,body{ overflow: hidden !important; }');
  });
  loginWin.on('hide', () => {
    mainWin.loadURL(`file://${__dirname}/views/index.html`);
  });

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
  // i18n.setLocale('fr');

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
  ipcMain.on('updateUrl', (event, arg) => {
    db.setUrl(arg);
    loginWin.loadURL(db.getUrl());
  });
  ipcMain.on('tryLogin', () => loginWin.show());
  ipcMain.on('tryLogout', () => session.defaultSession.clearStorageData({
    storages: "cookies"
  }, () => {
    mainWin.loadURL(`file://${__dirname}/views/index.html`);
    loginWin.loadURL(db.getUrl());
  }));

  ipcMain.on('test', () => mainWin.webContents.openDevTools());

  exports.sessionUrl = db.getUrl().replace('https://', '');
  exports.currentUser = (callback) => getCurrentUserName(callback);

  // Return the current user logged in
  function getCurrentUserName(callback) {
    // How to call this function
    // getCurrentUserName((result) => {
    //   console.log(result);
    // });

    if (db.getUrl() !== "") {
      let cookie = "";
      session.defaultSession.cookies.get({}, (error, cookies) => {
        // TODO: Improve the way of using cookies for the REST call
        if (cookies.length > 0)
          cookie = cookies[0]["name"] + "=" + cookies[0]["value"];

        // TODO: Improve the way to get the hostname (through regexp?!)
        const options = {
          hostname: db.getUrl().replace('https://', '').replace('/', ''),
          path: '/rest/api/user/current',
          method: 'GET',
          headers: {
            Cookie: cookie,
            'Content-Type': 'application/json'
          }
        };

        let data = [];
        const req = http.request(options, (res) => {
          res.on("data", function(chunk) {
            data.push(chunk);
          });

          res.on('end', () => {
            data = Buffer.concat(data).toString();
            data = JSON.parse(data).displayName;
            callback(data);
          });
        });

        req.on('error', (e) => {
          console.error(e);
        });
        req.end();
      });
    } else {
      callback(i18n.__("session.currentStatus.notConfigured"));
    }
  }
});
