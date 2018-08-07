'use strict';

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const {
  ipcRenderer
} = require('electron');

window.$ = window.jQuery = require('jquery');
window.Bootstrap = require('bootstrap');

// Compose the DOM from separate HTML concerns; each from its own file.
let htmlPath = path.join(__dirname, 'html');
let body = fs.readFileSync(path.join(htmlPath, 'body.html'), 'utf8');
let navbarTop = fs.readFileSync(path.join(htmlPath, 'navbarTop.html'), 'utf8');
let homeContent = fs.readFileSync(path.join(htmlPath, 'homeContent.html'), 'utf8');
let navbarBottom = fs.readFileSync(path.join(htmlPath, 'navbarBottom.html'), 'utf8');

let O = cheerio.load(body);
O('#navbarTop').append(navbarTop);
O('#homeContent').append(homeContent);
O('#navbarBottom').append(navbarBottom);

// Pass the DOM from Cheerio to jQuery.
let dom = O.html();
$('body').html(dom);

// Add event listener to buttons click
$('#nav_reload').click( () => { ipcRenderer.send('clickReload'); });
$('#nav_min').click( () => { ipcRenderer.send('clickMin'); });
$('#nav_close').click( () => { ipcRenderer.send('clickClose'); });
// $('#cancelModal').click( () => { ipcRenderer.send('cancelModal'); });
// $('#yesModal').click( () => { ipcRenderer.send('yesModal'); });
