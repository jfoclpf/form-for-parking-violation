/* server app that receives parking violations from the users
and stores it in the dabatase */

/* eslint prefer-const: "off" */
/* eslint no-var: "off" */

const submissionsUrl = '/passeio_livre/serverapp'
const requestHistoricUrl = '/passeio_livre/serverapp_get_historic'
const commonPort = 3035
const imgUploadUrl = '/passeio_livre/serverapp_img_upload'
const imgUploadUrlPort = 3036

const fs = require('fs')
const path = require('path')
const express = require('express')
const async = require('async')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const cors = require('cors')
const mysql = require('mysql') // module to get info from database
const debug = require('debug')('app')
const sqlFormatter = require('sql-formatter')

const DBInfo = JSON.parse(fs.readFileSync('DBcredentials.json', 'utf8'))
debug(DBInfo)

const app = express()

app.use(bodyParser.json())

app.post(submissionsUrl, function (req, res) {
  // object got from POST
  const databaseObj = req.body
  debug(databaseObj)
  debug('\nInserting user data into ' +
                'database table ' + DBInfo.database + '->' + DBInfo.db_tables.denuncias)

  // builds sql query to insert user data
  var queryInsert = 'INSERT INTO ' + DBInfo.db_tables.denuncias + ' ('
  var databaseKeys = Object.keys(databaseObj)
  for (let i = 0; i < databaseKeys.length; i++) {
    queryInsert += databaseKeys[i] + (i !== databaseKeys.length - 1 ? ', ' : ')')
  }
  queryInsert += ' ' + 'VALUES('
  for (let i = 0; i < databaseKeys.length; i++) {
    queryInsert += '\'' + databaseObj[databaseKeys[i]] + '\'' + (i !== databaseKeys.length - 1 ? ', ' : ')')
  }
  debug(sqlFormatter.format(queryInsert))

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
      db.query(queryInsert, function (err, results, fields) {
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
    // get the historic for a specific user
    query = `SELECT * FROM ${DBInfo.db_tables.denuncias} WHERE uuid='${uuid}' ORDER BY data_data ASC`
  } else {
    // get all production entries to generate a map
    query = `SELECT * FROM ${DBInfo.db_tables.denuncias} WHERE PROD=1 AND uuid!='87332d2a0aa5e634' ` +
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
const app2 = express()

// enable files upload
app2.use(fileUpload({ createParentPath: true }))
app2.use(cors())
app2.use(bodyParser.json())
app2.use(bodyParser.urlencoded({ extended: true }))

app2.post(imgUploadUrl, async (req, res) => {
  debug('Getting files')
  try {
    if (!req.files) {
      res.send({
        status: false,
        message: 'No file uploaded'
      })
    } else {
      // Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
      debug(req.files)
      const img = req.files.file
      // Use the mv() method to place the file in upload directory (i.e. "uploads")
      img.mv('./uploadedImages/' + img.name)

      // send response
      res.send({
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
    res.status(500).send(err)
  }
})

app.listen(commonPort, () => console.log(`Request server listening on port ${commonPort}!`))
app2.listen(imgUploadUrlPort, () => console.log(`File upload server listening on port ${imgUploadUrlPort}!`))

console.log('Initializing timers to cleanup database')
// directory where the images are stored with respect to present file
const imgDirectory = path.join(__dirname, 'uploadedImages')
require(path.join(__dirname, 'cleanBadPhotos'))(imgDirectory)
require(path.join(__dirname, 'removeDuplicates'))(imgDirectory)
