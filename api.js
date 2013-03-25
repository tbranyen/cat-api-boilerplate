var fs = require("fs");
var path = require("path");
var express = require("express");

// Used to estimate number of cats in the photo.
var kittydar = require("kittydar");
var Canvas = require("canvas");

// Create app and load cat pix
var app = express.createServer();

// Process the photos, every time they change.
var start = +new Date;
var files = fs.readdirSync("./cats").filter(function(path) {
  return path.charAt(0) !== ".";
}).map(function(path) {
  var obj = { src: path };

  // Find the # of cats!
  fs.readFile("./cats/" + path, function(err, photo) {
    // Create a new image to load cat data into.
    var img = new Canvas.Image();
    // This is a buffer and not a path, because node-canvas has this feature.
    img.src = new Buffer(photo, "binary");

    // Dimensions.
    var dim = { w: img.width, h: img.height };
    // Attach to returned object.
    obj.dim = dim;

    // Create the new canvas and load the image data into it.
    var canvas = new Canvas(dim.w, dim.h);
    var ctx = canvas.getContext("2d");
    // Set the best quality? Found in kittydar test.
    ctx.patternQuality = "best";

    var est = 0;

    // Fill with `drawImage`.
    try {
      ctx.drawImage(img, 0, 0, dim.w, dim.h, 0, 0, dim.w, dim.h);

      // Estimated number of cats.
      est = kittydar.detectCats(canvas).length;
    } catch (ex) { console.log(ex); }

    // Attach to returned object.
    obj.est = est;
  });

  return obj;
});

app.get("/", function(req, res) {
  res.send({
    "/random": { src: "some_file.jpg" },
    "/all": [{ src: "some_file.jpg" }],
    "/src/:path": "<%file_stream%>"
  });
});

// When hit, randomly send back an image url
app.get("/random", function(req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.send(files[Math.floor(Math.random()*files.length)]);
});

// When hit, send back all images
app.get("/all", function(req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.send({
    meta: {
      total: files.length
    },

    files: files
  });
});

// Get a specific cat url image
app.get("/src/:path", function(req, res) {
  fs.createReadStream(path.resolve("./cats", req.params.path)).pipe(res);
});

// Listen on port 3333
app.listen(3333);
console.log("Starting Cat API on http://localhost:3333");

// Don't bail out, but log out the error
process.on("uncaughtException", function(err) {
  console.error(err);
});
