'use strict';
const fs = require('fs');
const path = require('path');
const i18n = require('i18n');
const cheerio = require('cheerio');
const {
  ipcRenderer,
  session
} = require('electron');

i18n.configure({
  locales: ['en', 'fr'],
  defaultLocale: 'en',
  updateFiles: false,
  objectNotation: true,
  directory: __dirname + '/../locales'
});
// i18n.setLocale('fr');

window.$ = window.jQuery = require('jquery');
window.Bootstrap = require('bootstrap');

// Compose the DOM from separate HTML concerns; each from its own file.
let htmlPath = path.join(__dirname, 'html');
let body = fs.readFileSync(path.join(htmlPath, 'body.html'), 'utf8');
let navbarTop = fs.readFileSync(path.join(htmlPath, 'navbarTop.html'), 'utf8');
let homeContent = fs.readFileSync(path.join(htmlPath, 'homeContent.html'), 'utf8');
let navbarBottom = fs.readFileSync(path.join(htmlPath, 'navbarBottom.html'), 'utf8');
let loginCollapse = fs.readFileSync(path.join(htmlPath, 'loginCollapse.html'), 'utf8');

let O = cheerio.load(body);
O('#navbarTop').append(navbarTop);
O('#homeContent').append(homeContent);
O('#navbarBottom').append(navbarBottom);
O('#loginCollapse').append(loginCollapse);

// Pass the DOM from Cheerio to jQuery.
let dom = O.html();
$('body').html(dom);

// Add event listener to buttons click
$('#nav_reload').click(() => {
  ipcRenderer.send('clickReload');
  $("#urlSession").val(mainProcess.sessionUrl);
});
$('#nav_min').click(() => ipcRenderer.send('clickMin'));
$('#nav_close').click(() => ipcRenderer.send('clickClose'));
$("#loginSession").click(() => ipcRenderer.send('tryLogin'));
$("#logoutSession").click(() => ipcRenderer.send('tryLogout'));
$("#buttonValidateURL").click(() => {
  ipcRenderer.send('updateUrl', "https://" + $("#urlSession").val());
  getUser();
});
$("#goSomewhere").click(() => ipcRenderer.send('test'));

const mainProcess = require('electron').remote.require('./main');
$("#urlSession").val(mainProcess.sessionUrl);
getUser();

function getUser() {
  mainProcess.currentUser((result) => {
    if (result === i18n.__("session.currentStatus.notConfigured")) {
      $("#footerUser").text(result);
    } else if (result === "Anonymous") {
      $("#footerUser").text(i18n.__("session.currentStatus.notLogged"));
      $("#logoutSession").attr("disabled", "disabled");
      $("#loginSession").removeAttr("disabled");
    } else {
      $("#footerUser").text(i18n.__("session.currentStatus.logged") + result);
      $("#loginSession").attr("disabled", "disabled");
      $("#logoutSession").removeAttr("disabled");
    }
  });
}