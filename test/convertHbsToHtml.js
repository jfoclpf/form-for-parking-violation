/* NodeJS script that uses handlebars to process the .hbs files */

// node/npm includes
const fs = require('fs')
const path = require('path')
const xml2js = require('xml2js')
const fse = require('fs-extra')
const Handlebars = require('handlebars')

const mainIndexHbsFile = 'index.hbs' // with respect to www/ dir

const projectRoot = path.join(__dirname, '..')
const configXmlFullPath = path.join(projectRoot, 'config.xml')
const srcDir = path.join(projectRoot, 'www')
const wwwTestDir = path.join(projectRoot, 'test', 'www')

createCleanWWWDirForTest() // copy files from www/* to test/www

getIndexHtmlFileFromConfigXML(configXmlFullPath, (mainIndexHtmlFile) => {
  console.log(`Main index html source file got from config.xml is ${path.join('www', mainIndexHtmlFile)}`)
  console.log(`Processing html files for test at ${path.relative(projectRoot, wwwTestDir)}`)
  convertHbsToHtmlSync(wwwTestDir, mainIndexHtmlFile)
})

// copy files from www/* to test/www
function createCleanWWWDirForTest () {
  try {
    fse.copySync(srcDir, wwwTestDir, { overwrite: true })
    console.log(`Copied content from dir ${path.relative(projectRoot, srcDir)} to dir ${path.relative(projectRoot, wwwTestDir)}`)
  } catch (err) {
    console.error('Error copying. ', err)
    process.exit(1)
  }
}

function convertHbsToHtmlSync (wwwDistDir, mainIndexHtmlFile) {
  var fullPathMainIndexHbsFile = path.join(wwwDistDir, mainIndexHbsFile)

  // Register Partials
  var partialsDir = path.join(wwwDistDir, 'html-partials')
  var filenames = fs.readdirSync(partialsDir)

  filenames.forEach(function (filename) {
    var matches = /^([^.]+).hbs$/.exec(filename)
    if (!matches) {
      return
    }
    var name = matches[1]
    var template = fs.readFileSync(path.join(partialsDir, filename), 'utf8')
    Handlebars.registerPartial(name, template)
    console.log(`Registered partial ${name}.hbs`)
  })

  var source = fs.readFileSync(fullPathMainIndexHbsFile, 'utf8').toString()
  var template = Handlebars.compile(source)
  var output = template()
  fs.writeFileSync(path.join(wwwDistDir, mainIndexHtmlFile), output, 'utf8')
  console.log(`html file ${mainIndexHtmlFile} created`)

  // source handlebars files should be deleted on dist dir
  fs.unlinkSync(fullPathMainIndexHbsFile)
  fs.rmdirSync(partialsDir, { recursive: true })
  console.log('handlebars files deleted from dist dir')
}

// get main index file from config.xml: <content src="index.html"/>
function getIndexHtmlFileFromConfigXML (configXmlFullPath, callback) {
  var parser = new xml2js.Parser()
  fs.readFile(configXmlFullPath, function (err, data) {
    if (err) {
      console.error(Error(err))
      process.exit(1)
    }
    parser.parseString(data, function (err, result) {
      if (err) {
        console.error(Error(err))
        process.exit(1)
      }
      callback(result.widget.content[0].$.src)
    })
  })
}
