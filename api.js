var fs = require("fs");
var path = require("path");
var express = require("express");

// Create app and load cat pix
var app = express.createServer();
var files = fs.readdirSync("./cats").filter(function(path) {
  return path.charAt(0) !== ".";
});

// When hit, randomly send back an image url
app.get("/random", function(req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.send({ src: files[Math.floor(Math.random()*files.length)] });
});

// When hit, send back all images
app.get("/all", function(req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.send(files);
});

// Get a specific cat url image
app.get("/cat/:path", function(req, res) {
  fs.createReadStream(path.resolve("./cache", req.params.path)).pipe(res);
});

// Listen on port 3333
app.listen(3333);
console.log("Starting Cat API on http://localhost:3333");

// Don't bail out, but log out the error
process.on("uncaughtException", function(err) {
  console.error(err);
});
