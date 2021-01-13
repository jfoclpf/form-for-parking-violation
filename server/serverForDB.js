/* server app that receives parking violations from the users
and stores it in the dabatase */

/* eslint prefer-const: "off" */
/* eslint no-var: "off" */
/* eslint no-prototype-builtins: "off" */

const submissionsUrl = '/passeio_livre/serverapp' // to upload anew or update the data of an occurence
const requestHistoricUrl = '/passeio_livre/serverapp_get_historic'
const commonPort = 3035
const imgUploadUrl = '/passeio_livre/serverapp_img_upload'
const imgUploadUrlPort = 3036
const browserPort = 3037

const fs = require('fs')
const path = require('path')
const express = require('express')
const async = require('async')
const bodyParser = require('body-parser')
const cors = require('cors')
const mysql = require('mysql') // module to get info from database
const debug = require('debug')('server:main')
const sqlFormatter = require('sql-formatter')

const DBInfo = JSON.parse(fs.readFileSync('DBcredentials.json', 'utf8'))
debug(DBInfo)

const app = express()

app.use(bodyParser.json())

// to upload anew or update the data of an occurence
app.post(submissionsUrl, function (req, res) {
  // object got from POST
  var serverCommand = req.body.serverCommand || req.body.dbCommand // dbCommand for backward compatibility
  var databaseObj = req.body.databaseObj

  // for backward compatibility, wherein it was req.body === databaseObj
  if (!serverCommand && req.body.hasOwnProperty('foto1')) {
    if (req.body.hasOwnProperty('processada_por_autoridade')) {
      serverCommand = 'setProcessedByAuthorityStatus'
    } else {
      serverCommand = 'submitNewEntryToDB'
    }
  }

  if (!serverCommand || !databaseObj) {
    debug('Bad request')
    res.status(501).send('property serverCommand or databaseObj of reqquest does not exist')
    return // leave now
  }

  debug('\nInserting user data into ' +
                'database table ' + DBInfo.database + '->' + DBInfo.db_tables.denuncias)

  var query
  switch (serverCommand) {
    case 'submitNewEntryToDB': // (new entry in table) builds sql query to insert user data
      databaseObj.table_row_uuid = generateUuid()
      query = 'INSERT INTO ' + DBInfo.db_tables.denuncias + ' ('
      var databaseKeys = Object.keys(databaseObj)
      for (let i = 0; i < databaseKeys.length; i++) {
        query += databaseKeys[i] + (i !== databaseKeys.length - 1 ? ', ' : ')')
      }
      query += ' ' + 'VALUES('
      for (let i = 0; i < databaseKeys.length; i++) {
        query += '\'' + databaseObj[databaseKeys[i]] + '\'' + (i !== databaseKeys.length - 1 ? ', ' : ')')
      }
      break
    case 'setProcessedByAuthorityStatus':
      // (update) when field 'processada_por_autoridade' is present in the request (client) it means just an update of a previous existing entry/line
      query = `UPDATE ${DBInfo.db_tables.denuncias} SET processada_por_autoridade=${databaseObj.processada_por_autoridade} ` +
              `WHERE PROD=${databaseObj.PROD} AND uuid='${databaseObj.uuid}' AND foto1='${databaseObj.foto1}' AND carro_matricula='${databaseObj.carro_matricula}'`
      break
    case 'setEntryAsDeletedInDatabase':
      // (update) when field 'deleted_by_admin' is present in the request (client) it means just an update of a previous existing entry/line
      query = `UPDATE ${DBInfo.db_tables.denuncias} SET deleted_by_admin=${databaseObj.deleted_by_admin} ` +
              `WHERE PROD=${databaseObj.PROD} AND uuid='${databaseObj.uuid}' AND foto1='${databaseObj.foto1}' AND carro_matricula='${databaseObj.carro_matricula}'`
      break
    default:
      debug('Bad request on dbCommand: ' + serverCommand)
      res.status(501).send(`dbCommand ${serverCommand} does not exist`)
      return // leave now
  }

  debug(sqlFormatter.format(query))

  var db = mysql.createConnection(DBInfo)

  async.series([
    function (next) {
      db.connect(function (err) {
        if (err) {
          console.error('error connecting: ' + err.stack)
          res.status(501).send(JSON.stringify(err))
          next(Error(err))
        } else {
          debug('User ' + DBInfo.user + ' connected successfully to database ' + DBInfo.database + ' at ' + DBInfo.host)
          next()
        }
      })
    },
    function (next) {
      db.query(query, function (err, results, fields) {
        if (err) {
          // error handling code goes here
          debug('Error inserting user data into database: ', err)
          res.status(501).send(JSON.stringify(err))
          next(Error(err))
        } else {
          debug('User data successfully added into ' +
                'database table ' + DBInfo.database + '->' + DBInfo.db_tables.denuncias + '\n\n')
          debug('Result from db query is : ', results)
          res.send(results)
          next()
        }
      })
    },
    function (next) {
      db.end(function (err) {
        if (err) {
          next(Error(err))
        } else {
          next()
        }
      })
    }
  ],
  function (err, results) {
    if (err) {
      console.log('There was an error: ')
      console.log(err)
    } else {
      debug('Submission successfully')
    }
  })
})

app.get(requestHistoricUrl, function (req, res) {
  const uuid = req.query.uuid

  debug('\nGetting entries from' +
    'database table ' + DBInfo.database + '->' + DBInfo.db_tables.denuncias)

  var query
  if (uuid) {
    // get the all entries for a specific user (ex: to generate historic for user)
    query = `SELECT * FROM ${DBInfo.db_tables.denuncias} WHERE uuid='${uuid}' AND deleted_by_admin=0 ORDER BY data_data ASC`
  } else {
    // get all production entries for all users except admin (ex: to generate a map of all entries)
    query = `SELECT * FROM ${DBInfo.db_tables.denuncias} WHERE PROD=1 AND uuid!='87332d2a0aa5e634' AND deleted_by_admin=0 ` +
      `ORDER BY ${DBInfo.db_tables.denuncias}.uuid  ASC, ${DBInfo.db_tables.denuncias}.data_data ASC`
  }

  debug(sqlFormatter.format(query))

  var db = mysql.createConnection(DBInfo)

  async.series([
    function (next) {
      db.connect(function (err) {
        if (err) {
          console.error('error connecting: ' + err.stack)
          res.status(501).send(JSON.stringify(err))
          next(Error(err))
        } else {
          debug('User ' + DBInfo.user + ' connected successfully to database ' + DBInfo.database + ' at ' + DBInfo.host)
          next()
        }
      })
    },
    function (next) {
      db.query(query, function (err, results, fields) {
        if (err) {
          // error handling code goes here
          debug('Error inserting user data into database: ', err)
          res.status(501).send(JSON.stringify(err))
          next(Error(err))
        } else {
          debug('Result from db query is : ', results)
          res.send(results)
          next()
        }
      })
    },
    function (next) {
      db.end(function (err) {
        if (err) {
          next(Error(err))
        } else {
          next()
        }
      })
    }
  ],
  function (err, results) {
    if (err) {
      console.log('There was an error: ')
      console.log(err)
    } else {
      debug('Request successfully')
    }
  })
})

/* ############################################################################################## */
/* ############################################################################################## */
// app2 is used for uploading files (images of cars illegaly parked)

const fileUpload = require('express-fileupload')
const debugFileTransfer = require('debug')('server:file-transfer')
const app2 = express()

// enable files upload
app2.use(fileUpload({ createParentPath: true, debug: debugFileTransfer.enabled }))
app2.use(cors())
app2.use(bodyParser.json())
app2.use(bodyParser.urlencoded({ extended: true }))

app2.post(imgUploadUrl, async (req, res) => {
  debugFileTransfer('Getting files')
  try {
    if (!req.files) {
      debugFileTransfer('No files')
      res.status(400).send({
        status: false,
        message: 'No file uploaded'
      })
    } else {
      // Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
      debugFileTransfer('Fetching files:')
      debugFileTransfer(req.files)
      const img = req.files.file
      // Use the mv() method to place the file in upload directory (i.e. "uploads")
      img.mv('./uploadedImages/' + img.name)

      // send response
      res.status(200).send({
        status: true,
        message: 'File is uploaded',
        data: {
          name: img.name,
          mimetype: img.mimetype,
          size: img.size
        }
      })
    }
  } catch (err) {
    debugFileTransfer('Error on requesting files:', err)
    res.status(500).send(err)
  }
})

function generateUuid () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0
    var v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/* ############################################################################################## */
/* ############################################################################################## */

const app3 = express()
app3.use(express.static(path.join(__dirname, '..', '')))

app.listen(commonPort, () => console.log(`Request server listening on port ${commonPort}!`))
app2.listen(imgUploadUrlPort, () => console.log(`File upload server listening on port ${imgUploadUrlPort}!`))
app3.listen(browserPort, () => console.log(`Browser for APP on port ${browserPort}!`))

console.log('Initializing timers to cleanup database')
// directory where the images are stored with respect to present file
const imgDirectory = path.join(__dirname, 'uploadedImages')
require(path.join(__dirname, 'cleanBadPhotos'))(imgDirectory)
require(path.join(__dirname, 'removeDuplicates'))(imgDirectory)
