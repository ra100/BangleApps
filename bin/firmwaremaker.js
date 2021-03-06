#!/usr/bin/nodejs
/*
Mashes together a bunch of different apps to make
a single firmware JS file which can be uploaded.
*/

var path = require('path');
var ROOTDIR = path.join(__dirname, '..');
var APPDIR = ROOTDIR+'/apps';
var APPJSON = ROOTDIR+'/apps.json';
var OUTFILE = ROOTDIR+'/firmware.js';
var APPS = [ // IDs of apps to install
  "boot",
  "mclock",
  "setting",
  "astroid",
  "gpstime",
  "compass",
  "sbt",
  "sbat",
  "funrun5",
  "nceuwid",
  "start"
];

var fs = require("fs");
var AppInfo = require(ROOTDIR+"/appinfo.js");
var appjson = JSON.parse(fs.readFileSync(APPJSON).toString());
var appfiles = [];

function fileGetter(url) {
  console.log("Loading "+url)
  /*if (url.endsWith(".js")) {
    var f = url.slice(0,-3);
    console.log("MINIFYING "+f);
    const execSync = require('child_process').execSync;
    code = execSync(`espruino --board BANGLEJS --minify ${f}.js -o ${f}.min.js`);
    console.log(code.toString());
    url = f+".min.js";
  }*/
  return Promise.resolve(fs.readFileSync(url).toString());
}

Promise.all(APPS.map(appid => {
  var app = appjson.find(app=>app.id==appid);
  if (app===undefined) throw new Error(`App ${appid} not found`);
  return AppInfo.getFiles(app, fileGetter).then(files => {
    appfiles = appfiles.concat(files);
  });
})).then(() => {
  //console.log(appfiles);
  var js = "";
  appfiles.forEach((file) => {
    js += file.cmd+"\n";
  });
  fs.writeFileSync(OUTFILE, js);
  console.log("Output written to "+OUTFILE);
});
