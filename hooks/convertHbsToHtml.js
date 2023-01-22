/* NodeJS script that uses handlebars to process the .hbs files */

// node/npm includes
const fs = require('fs')
const path = require('path')
const xml2js = require('xml2js')
const Handlebars = require('handlebars')

const mainIndexHbsFile = 'index.hbs' // with respect to www/ dir
const twoSpaces = '  '

module.exports = function (context) {
  console.log(`${context.hook} : ${path.relative(context.opts.projectRoot, context.scriptLocation)}`)

  const projectRoot = context.opts.projectRoot
  const platforms = context.opts.platforms
  return new Promise((resolve, reject) => {
    const configXmlFullPath = path.join(context.opts.projectRoot, 'config.xml')
    getIndexHtmlFileFromConfigXML(configXmlFullPath, (mainIndexHtmlFile) => {
      console.log(`${twoSpaces}Main index html source file got from config.xml is ${path.join('www', mainIndexHtmlFile)}`)

      for (let i = 0; i < platforms.length; i++) {
        const wwwDistDir = context.opts.paths[i]
        console.log(`${twoSpaces}Processing html files for ${platforms[i]} at ${path.relative(projectRoot, wwwDistDir)}`)
        convertHbsToHtmlSync(wwwDistDir, mainIndexHtmlFile)
      }
      resolve()
    })
  })
}

function convertHbsToHtmlSync (wwwDistDir, mainIndexHtmlFile) {
  const fullPathMainIndexHbsFile = path.join(wwwDistDir, mainIndexHbsFile)

  // Register Partials
  const partialsDir = path.join(wwwDistDir, 'html-partials')
  const filenames = fs.readdirSync(partialsDir)

  filenames.forEach(function (filename) {
    const matches = /^([^.]+).hbs$/.exec(filename)
    if (!matches) {
      return
    }
    const name = matches[1]
    const template = fs.readFileSync(path.join(partialsDir, filename), 'utf8')
    Handlebars.registerPartial(name, template)
    console.log(`${twoSpaces + twoSpaces}Registered partial ${name}.hbs`)
  })

  const source = fs.readFileSync(fullPathMainIndexHbsFile, 'utf8').toString()
  const template = Handlebars.compile(source)
  const output = template()
  fs.writeFileSync(path.join(wwwDistDir, mainIndexHtmlFile), output, 'utf8')
  console.log(`${twoSpaces + twoSpaces}html file ${mainIndexHtmlFile} created`)

  // source handlebars files should be deleted on dist dir
  fs.unlinkSync(fullPathMainIndexHbsFile)
  fs.rmSync(partialsDir, { recursive: true })
  console.log(`${twoSpaces + twoSpaces}handlebars files deleted from dist dir`)
}

// get main index file from config.xml: <content src="index.html"/>
function getIndexHtmlFileFromConfigXML (configXmlFullPath, callback) {
  const parser = new xml2js.Parser()
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
