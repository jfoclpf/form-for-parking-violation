/* server app that receives parking violations from the users
and stores it in the dabatase */

const fs = require('fs')
const express = require('express')
const mysql = require('mysql') // module to get info from database
const debug = require('debug')('app')
const sqlFormatter = require('sql-formatter')

const DBInfo = JSON.parse(fs.readFileSync('DBcredentials.json', 'utf8'))
debug(DBInfo)

const app = express()
const port = 3035

app.post('/passeio_livre/serverapp', function (req, res) {
  // object got from POST
  var databaseObj = req.body.databaseObj

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

app.listen(port, () => console.log(`Listening on port ${port}!`))
