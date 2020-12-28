/* NodeJS script that minifies files stored from www/ to platforms/android/app/src/main/assets/www
   It minifies all js, css and html files that will be sent to android build.
*/

// node/npm includes
const fs = require('fs')
const path = require('path')
const async = require('async')
const walk = require('walk')

// minification tools
const UglifyJS = require('uglify-es')
const uglifycss = require('uglifycss')
const minifyHTML = require('html-minifier').minify

var wwwDir

module.exports = function (context) {
  var projectRoot = context.opts.projectRoot
  wwwDir = path.join(projectRoot, 'platforms', 'android', 'app', 'src', 'main', 'assets', 'www')

  console.log(context.hook + ': Minifying files at ' + path.relative(projectRoot, wwwDir))

  return new Promise((resolve, reject) => {
    async.parallel([processJSfiles, processCSSFiles, processHTMLfiles],
      function (err, results) {
        if (err) {
          console.log(Error(('\nError minifying file.\n' + err.message)), err)
          reject(new Error(err))
        } else {
          console.log('All files minified successfully')
          resolve()
        }
      }
    )
  })
}

function processJSfiles (callback) {
  var walker = walk.walk(path.join(wwwDir, 'js'))

  walker.on('file', function (root, fileStats, next) {
    var filename = path.join(root, fileStats.name)

    // gets file extension
    if (getFileExtension(filename) === 'js' && !filename.includes('.min.js')) {
      var code = fs.readFileSync(filename, 'utf-8')

      var result = UglifyJS.minify(code)

      if (result.error) {
        callback(Error('Error minifying file: ' + path.relative(wwwDir, filename) + '.\n' + result.error))
        console.log(result)
        return
      } else {
        console.log(path.relative(wwwDir, filename))
        fs.writeFileSync(filename, result.code, 'utf8')
      }
    }
    next()
  })

  walker.on('errors', function (root, nodeStatsArray, next) {
    callback(Error('There was an error with' + nodeStatsArray.name))
  })

  walker.on('end', function () {
    callback()
  })
}

// minifies all css files on the client side, namely on the build/css/ directory,
// i.e., these are CSS files that will be sent from the server to the client
function processCSSFiles (callback) {
  var walker = walk.walk(path.join(wwwDir, 'css')) // dir to walk into

  walker.on('file', function (root, fileStats, next) {
    var filename = path.join(root, fileStats.name)

    if (filename.includes('.css') && !filename.includes('.min.css')) {
      var code = fs.readFileSync(filename, 'utf-8')
      var result = uglifycss.processString(code)

      if (!result) {
        callback(Error('Error minifying file: ' + filename + '.\n'))
        return
      } else {
        console.log(path.relative(wwwDir, filename))
        fs.writeFileSync(filename, result, 'utf8')
      }
    }
    next()
  })

  walker.on('errors', function (root, nodeStatsArray, next) {
    callback(Error('There was an error with' + nodeStatsArray.name))
  })

  walker.on('end', function () {
    callback()
  })
}

// minifies all html handlebars templates .hbs files on the client side,
// namely on the build/views/ directory,
// i.e., these are handlebars .hbs files that will be rendered as HTML files
// and then sent from the server to the client/browser
function processHTMLfiles (callback) {
  var walker = walk.walk(wwwDir) // dir to walk into
  walker.on('file', function (root, fileStats, next) {
    var filename = path.join(root, fileStats.name)

    if (getFileExtension(filename) === 'html') {
      var code = fs.readFileSync(filename, 'utf-8')

      var result = minifyHTML(code, {
        ignoreCustomFragments: [
          /<%[\s\S]*?%>/, // ignore default fragments
          /<\?[\s\S]*?\?>/
        ],
        collapseWhitespace: true, // collapse white space that contributes to text nodes in a document tree
        removeComments: true, // strip HTML comments
        removeOptionalTags: true, // remove optional tags http://perfectionkills.com/experimenting-with-html-minifier/#remove_optional_tags
        caseSensitive: true // treat attributes in case sensitive manner (useful for custom HTML tags)
      })

      if (!result) {
        callback(Error('Error minifying file: ' + filename + '.\n'))
        return
      } else {
        console.log(path.relative(wwwDir, filename))
        fs.writeFileSync(filename, result, 'utf8')
      }
    }
    next()
  })

  walker.on('errors', function (root, nodeStatsArray, next) {
    callback(Error('There was an error with' + nodeStatsArray.name))
  })

  walker.on('end', function () {
    callback()
  })
}

function getFileExtension (fileName) {
  return fileName.split('.').pop()
}
