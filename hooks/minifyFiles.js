/* NodeJS script that minifies files stored in pltaforms/ after cordova prepare, and for every added platform
   It minifies all js, css and html files that will be compiled to build apk or aab file.
   This script is asynchronous for every file in any platform, to improve performance.
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

const twoSpaces = '  '

module.exports = function (context) {
  // do not minify in debug mode
  if (context.opts.options.debug) {
    return
  }

  console.log(`${context.hook} : ${path.relative(context.opts.projectRoot, context.scriptLocation)}`)
  var projectRoot = context.opts.projectRoot

  var platforms = []
  for (var i = 0; i < context.opts.platforms.length; i++) {
    const platform = { name: context.opts.platforms[i], path: context.opts.paths[i] }
    platforms.push(platform)
  }

  return new Promise((resolve, reject) => {
    async.each(platforms, function (platform, callback) {
      console.log(`${twoSpaces}Minifying html/css/js files for ${platform.name} at ${path.relative(projectRoot, platform.path)}`)
      processAllFilesForOnePlatform(platform, callback)
    }, function (err) {
      if (err) {
        console.error(Error(err))
        reject(Error(err))
      } else {
        console.log(`${twoSpaces}All files for all platforms have been minified successfully`)
        resolve()
      }
    })
  })
}

function processAllFilesForOnePlatform (platform, mainCallback) {
  async.parallel([
    (localCallback) => {
      processJSfiles(platform, localCallback)
    },
    (localCallback) => {
      processCSSFiles(platform, localCallback)
    },
    (localCallback) => {
      processHTMLfiles(platform, localCallback)
    }],
  function (err, results) {
    if (err) {
      console.error(Error(('\nError minifying file.\n' + err.message)), err)
      mainCallback(new Error(err))
    } else {
      console.log(`${twoSpaces + twoSpaces}All files minified successfully for ${platform.name}`)
      mainCallback()
    }
  }
  )
}

function processJSfiles (platform, callback) {
  const wwwDistDir = platform.path
  var walker = walk.walk(path.join(wwwDistDir, 'js'))

  walker.on('file', function (root, fileStats, next) {
    var filename = path.join(root, fileStats.name)

    // gets file extension
    if (getFileExtension(filename) === 'js' && !filename.includes('.min.js')) {
      var code = fs.readFileSync(filename, 'utf-8')

      var result = UglifyJS.minify(code)

      if (result.error) {
        callback(Error('Error minifying file: ' + path.relative(wwwDistDir, filename) + '.\n' + result.error))
        console.error(result)
        return
      } else {
        console.log(`${twoSpaces + twoSpaces}${platform.name}:${path.relative(wwwDistDir, filename)}`)
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
function processCSSFiles (platform, callback) {
  const wwwDistDir = platform.path
  var walker = walk.walk(path.join(wwwDistDir, 'css')) // dir to walk into

  walker.on('file', function (root, fileStats, next) {
    var filename = path.join(root, fileStats.name)

    if (filename.includes('.css') && !filename.includes('.min.css')) {
      var code = fs.readFileSync(filename, 'utf-8')
      var result = uglifycss.processString(code)

      if (!result) {
        callback(Error('Error minifying file: ' + filename + '.\n'))
        return
      } else {
        console.log(`${twoSpaces + twoSpaces}${platform.name}:${path.relative(wwwDistDir, filename)}`)
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
function processHTMLfiles (platform, callback) {
  const wwwDistDir = platform.path
  var walker = walk.walk(wwwDistDir) // dir to walk into
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
        console.log(`${twoSpaces + twoSpaces}${platform.name}:${path.relative(wwwDistDir, filename)}`)
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
