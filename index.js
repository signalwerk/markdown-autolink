var fs = require('fs');
var path = require('path');
var request = require('request');
var cheerio = require('cheerio');
var request = require('sync-request');

// Return a list of files of the specified fileTypes in the provided dir,
// with the file path relative to the given dir
// dir: path of the directory you want to search the files for
// fileTypes: array of file types you are search files, ex: ['.txt', '.jpg']
function getFilesFromDir(dir, fileTypes) {
  var filesToReturn = [];
  function walkDir(currentPath) {
    var files = fs.readdirSync(currentPath);
    for (var i in files) {
      var curFile = path.join(currentPath, files[i]);
      if (fs.statSync(curFile).isFile() && fileTypes.indexOf(path.extname(curFile)) != -1) {
        filesToReturn.push(curFile.replace(dir, ''));
      } else if (fs.statSync(curFile).isDirectory()) {
       walkDir(curFile);
      }
    }
  };
  walkDir(dir);
  return filesToReturn;
}





//var urlRegEx = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi
var urlRegEx = /https?:\/\/(www\.)?[-a-zA-Z0-9@:;%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:;%_\+.~#?&//=]*)/gi


//print the txt files in the current directory
var files = getFilesFromDir("./pages/tools", [".md"])

files.map((file) => {
  console.log(file)
  var content = fs.readFileSync(file, 'utf8');

  var newContent = content.replace(/\(http/gi,
    (str) => '(h_____ttp'
  )
  .replace(/"http/gi,
    (str) => '"h_____ttp'
  )

  .replace(urlRegEx, (str) => {

      var URL = str.replace(/\&shy;/gi, "");
      console.log('URL', URL)

        var res = request('GET', URL);

        var $ = cheerio.load(res.getBody());
        var title = $("title").text();
        console.log(str, title);


      return "[" + title + "](" + URL + ")"
    }
  )
  .replace(/\(h_____ttp/gi,
    (str) => '(http'
  )
  .replace(/"h_____ttp/gi,
    (str) => '"http'
  )


  fs.writeFileSync(file, newContent);




});








// getFilesFromDir("./pages", [".md"]).map(console.log);
