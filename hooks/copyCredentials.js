const fse = require('fs-extra')
const path = require('path')

const twoSpaces = '  ' // for log indentation

module.exports = function (context) {
  console.log(`${context.hook} : ${path.relative(context.opts.projectRoot, context.scriptLocation)}`)

  var projectRoot = path.resolve(path.dirname(context.scriptLocation), '..')

  var fileOriginFullPath = path.join(projectRoot, 'keys', 'credentials.js')
  var fileDestFullPath = path.join(projectRoot, 'www', 'js', 'credentials.js')

  fse.copySync(fileOriginFullPath, fileDestFullPath)

  const consoleMsg = 'copied ' +
    path.relative(projectRoot, fileOriginFullPath) + ' -> ' +
    path.relative(projectRoot, fileDestFullPath)

  console.log(twoSpaces + consoleMsg)
}
