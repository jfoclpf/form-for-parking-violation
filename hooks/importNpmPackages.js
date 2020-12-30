const fse = require('fs-extra')
const path = require('path')

const twoSpaces = '  ' // for log indentation

var projectRoot

module.exports = function (context) {
  console.log(`${context.hook} : ${path.relative(context.opts.projectRoot, context.scriptLocation)}`)

  projectRoot = context.opts.projectRoot
  console.log(twoSpaces + 'Project root directory: ' + projectRoot)
  copyFile('jquery', path.join('dist', 'jquery.min.js'), path.join('www', 'js', 'res', 'jquery.min.js'))

  copyFile('bootstrap', path.join('dist', 'js', 'bootstrap.min.js'), path.join('www', 'js', 'res', 'bootstrap.min.js'))
  copyFile('bootstrap', path.join('dist', 'css', 'bootstrap.min.css'), path.join('www', 'css', 'res', 'bootstrap.min.css'))

  copyFile('jAlert', path.join('dist', 'jAlert.min.js'), path.join('www', 'js', 'res', 'jAlert.min.js'))
  copyFile('jAlert', path.join('dist', 'jAlert.css'), path.join('www', 'css', 'res', 'jAlert.css'))
}

function copyFile (npmPackage, // oficial name of the npm package from which the file is to be copied from
  fileRelativePath, // file path with respect to the main directory of the npm package (node_modules/<package>/)
  destFilePath) { // file's path to where it is copied, relative to the project bin/ directory
  // trick to get the npm module main directory
  // https://stackoverflow.com/a/49455609/1243247
  const packageDirFullpath = path.dirname(require.resolve(path.join(npmPackage, 'package.json')))
  const fileOriginFullPath = path.join(packageDirFullpath, fileRelativePath)
  const fileDestFullPath = path.join(projectRoot, destFilePath)

  fse.copySync(fileOriginFullPath, fileDestFullPath)

  const consoleMsg = npmPackage + ': ' +
    path.relative(projectRoot, fileOriginFullPath) + ' -> ' +
    path.relative(projectRoot, fileDestFullPath)

  console.log(twoSpaces + consoleMsg)
}
