const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");
const request = require("sync-request");

//var urlRegEx = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi
const urlRegEx = /https?:\/\/(www\.)?[-a-zA-Z0-9@:;%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:;%_\+.~#?&//=]*)/gi;

// Return a list of files of the specified fileTypes in the provided dir,
// with the file path relative to the given dir
// dir: path of the directory you want to search the files for
// fileTypes: array of file types you are search files, ex: ['.txt', '.jpg']
function getFilesFromDir(dir, fileTypes) {
  var filesToReturn = [];

  stats = fs.statSync(dir);

  // Is it a directory?
  if (stats.isDirectory()) {
      // Yes it is
      function walkDir(currentPath) {
        var files = fs.readdirSync(currentPath);
        for (var i in files) {
          var curFile = path.join(currentPath, files[i]);
          if (
            fs.statSync(curFile).isFile() &&
            fileTypes.indexOf(path.extname(curFile)) != -1
          ) {
            filesToReturn.push(curFile.replace(dir, ""));
          } else if (fs.statSync(curFile).isDirectory()) {
            walkDir(curFile);
          }
        }
      }
      walkDir(dir);
  }

  if (stats.isFile()) {
    filesToReturn.push(dir);
  }
  return filesToReturn;
}

function replaceInFiles(dir) {
  //print the txt files in the current directory
  var files = getFilesFromDir(dir, [".md"]);

  files.map(file => {
    console.log(file);
    var content = fs.readFileSync(file, "utf8");

    // poorman choice to protect existing urls...
    var newContent = content
      .replace(/\(http/gi, str => "(http")
      .replace(/"http/gi, str => '"http')

      .replace(urlRegEx, str => {
        var URL = str.replace(/\&shy;/gi, "");
        console.log("URL", URL);

        var res = request("GET", URL);

        var $ = cheerio.load(res.getBody());
        var title = $("title").text();
        console.log(str, title);

        return "[" + title + "](" + URL + ")";
      })

      // restore the old urls
      .replace(/\(http/gi, str => "(http")
      .replace(/"http/gi, str => '"http');

    fs.writeFileSync(file, newContent);
  });
}

// print process.argv
process.argv.forEach(function (val, index, array) {
  console.log(index + ': ' + val);
});

if (process.argv.length > 2) {
  replaceInFiles(process.argv[2]);
} else {
  console.warn("please pass in a directory ($ node index.js ./pages/tools)")
}
