/* server app that receives parking violations from the users
and stores it in the dabatase */

const submissionsUrl = '/passeio_livre/serverapp'
const submissionsUrlPort = 3035
const imgUploadUrl = '/passeio_livre/serverapp_img_upload'
const imgUploadUrlPort = 3036

const fs = require('fs')
const express = require('express')
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

  db.connect(function (err) {
    if (err) {
      console.error('error connecting: ' + err.stack)
      res.status(501).send(JSON.stringify(err))
      throw err
    }
    debug('User ' + DBInfo.user + ' connected successfully to database ' + DBInfo.database + ' at ' + DBInfo.host)
  })

  db.query(queryInsert, function (err, results, fields) {
    if (err) {
      // error handling code goes here
      debug('Error inserting user data into database: ', err)
      res.status(501).send(JSON.stringify(err))
    } else {
      debug('User data successfully added into ' +
                        'database table ' + DBInfo.database + '->' + DBInfo.db_tables.denuncias + '\n\n')
      debug('Result from db query is : ', results)
      res.send(results)
    }
  })

  db.end()
})

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

app.listen(submissionsUrlPort, () => console.log(`Request server listening on port ${submissionsUrlPort}!`))
app2.listen(imgUploadUrlPort, () => console.log(`File upload server listening on port ${imgUploadUrlPort}!`))
