'use strict';
const path = require('path');
const fs = require('fs-extra');
const homeDir = require('os').homedir();
const dataLocation = path.join(homeDir, '.Kobolt/storage/', 'data.json');

module.exports = {
  // Init the content of dat file for the first launch
  initData: function() {
    let doesNotExist = false;
    if (!fs.existsSync(dataLocation)) doesNotExist = true;

    fs.ensureFileSync(dataLocation);

    if (doesNotExist) {
      const newObj = {
        id: "data1",
        sessionUrl: ""
      }
      fs.writeFileSync(dataLocation, JSON.stringify(newObj));
    }
  },
  // Return all the data into an Array
  getAll: function() {
    return JSON.parse(fs.readFileSync(dataLocation));
  },
  // Return the URL for this session
  getUrl: function() {
    return JSON.parse(fs.readFileSync(dataLocation)).sessionUrl;
  },
  // Set the URL to be used
  setUrl: function(url) {
    let content = JSON.parse(fs.readFileSync(dataLocation));
    content.sessionUrl = url;
    fs.writeFileSync(dataLocation, JSON.stringify(content));
  }
};