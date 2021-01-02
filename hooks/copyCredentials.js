/* Copies JS file keys/credentials.js to www/js/ directory.
This is used because the dir keys/ is not git tracked as it contains sensible information */

const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')

const twoSpaces = '  ' // for log indentation

module.exports = function (context) {
  console.log(`${context.hook} : ${path.relative(context.opts.projectRoot, context.scriptLocation)}`)

  var projectRoot = path.resolve(path.dirname(context.scriptLocation), '..')

  var fileOriginFullPath = path.join(projectRoot, 'keys', 'credentials.js')
  var fileDestFullPath = path.join(projectRoot, 'www', 'js', 'credentials.js')

  try {
    if (fs.existsSync(fileOriginFullPath)) { // file exists
      fse.copySync(fileOriginFullPath, fileDestFullPath)

      const consoleMsg = 'copied ' +
        path.relative(projectRoot, fileOriginFullPath) + ' -> ' +
        path.relative(projectRoot, fileDestFullPath)

      console.log(twoSpaces + consoleMsg)
    } else { // file does no exist
      console.log(`${twoSpaces}File ${path.relative(context.opts.projectRoot, fileOriginFullPath)} does not exist, skipping...`)
    }
  } catch (err) {
    console.error(err)
  }
}
