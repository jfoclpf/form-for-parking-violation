/* server app that provides the API for the different parking violation stored in the database */
/* api.denuncia-estacionamento.app */
/* we follow JSON: API protocol, see https://jsonapi.org/format/ */

const port = 3037

const fs = require('fs')
const path = require('path')
const express = require('express')
const async = require('async')
const bodyParser = require('body-parser')
const cors = require('cors')
const appRoot = require('app-root-path')
const mysql = require('mysql') // module to get info from database
const debug = require('debug')('server:api')
const sqlFormatter = require('sql-formatter')

// get penalties Ids from file
const penalties = JSON.parse(fs.readFileSync(path.join(appRoot.path, 'www', 'json', 'penalties.json'), 'utf8'))
debug('Loaded penalties: ', penalties)

const penaltiesIds = Object.keys(penalties).filter(penalty => !penalty.startsWith('__'))
debug('Loaded penalties Ids: ', penaltiesIds)

// create mysql connection pool
const DdPoolSetings = JSON.parse(fs.readFileSync('DBcredentials.json', 'utf8'))
DdPoolSetings.connectionLimit = 10 // set connection limit for pool
debug(DdPoolSetings)

const dBpool = mysql.createPool(DdPoolSetings)

const app = express()

app.use(bodyParser.json())
app.use(cors())

app.get('/', function (req, res) {
  res.status(200).send('API online')
})

// standard JSON:API v1.1 reply structure
const meta = {
  author: 'João Pimentel Ferreira',
  url: 'https://api.denuncia-estacionamento.app',
  standard: 'JSON:API v1.1',
  path: ''
}

const reply = {
  meta: { ...meta }, // create a copy of meta
  data: []
}

const errorReply = {
  meta: { ...meta }, // create a copy of meta
  errors: []
}

app.get('/penalties_list', function (req, res) {
  res.type('application/vnd.api+json')

  reply.meta.path = '/penalties_list'
  reply.data = penaltiesIds.map(id => ({
    id,
    type: 'penalty',
    attributes: {
      code: id,
      description: penalties[id].description
        .replace(/^./, char => char.toUpperCase()), // capitalize first letter
      base_legal: 'Violação ' + penalties[id].law_article
    }
  }))

  res.send(reply)
})

// to get penalty data based on penalty id
app.get('/penalties/:penalty', function (req, res) {
  res.type('application/vnd.api+json')

  const penaltyId = req.params.penalty
  debug('Getting penalty with id ' + penaltyId)

  if (!penaltiesIds.includes(penaltyId)) {
    debug('Penalty id ' + penaltyId + ' not found in penalties list')

    errorReply.errors = [
      {
        status: '404',
        title: 'Penalty id ' + penaltyId + ' not found',
        detail: 'The penalty id ' + penaltyId + ' does not exist in the penalties list'
      }
    ]

    res.status(404).send(errorReply)
    return
  }

  reply.meta.path = '/penalties/' + penaltyId

  reply.meta.penalty = {}
  reply.meta.penalty.code = penaltyId
  reply.meta.penalty.description = penalties[penaltyId].description
    .replace(/^./, char => char.toUpperCase()) // capitalize first letter
  reply.meta.penalty.base_legal = 'Violação ' + penalties[penaltyId].law_article

  // considering that DB table "base_legal" field may contain several penalty ids
  // we use LIKE operator to search for the given penalty id
  const columns = ['table_row_uuid', 'data_data', 'data_hora', 'data_coord_latit', 'data_coord_long', 'autoridade']

  const escaped = mysql.escape(`%${penaltyId}%`) // escape to avoid SQL injection and create the %LIKE% pattern

  const fields = columns.map(c => `\`${c}\``).join(', ')
  const query = `SELECT ${fields} FROM ${DdPoolSetings.db_tables.denuncias} WHERE base_legal LIKE ${escaped} ` +
    'AND PROD=1 AND deleted_by_admin=0 AND deleted_by_user=0 AND fotos_sinc_GPS=1 ' +
    'ORDER BY data_data ASC, data_hora ASC'
  debug(sqlFormatter.format(query))

  dBpool.query(query, function (err, results, fields) {
    if (err) {
      debug('Error getting penalty data from database: ', err)
      errorReply.errors = [
        {
          status: '501',
          title: 'DB error getting penalty id ' + penaltyId,
          detail: 'Error getting penalty data from database table'
        }
      ]
      res.status(501).send(errorReply)
    } else {
      debug('Penalty data successfully retrieved from ' +
            'database table ' + DdPoolSetings.database + '->' + DdPoolSetings.db_tables.denuncias + '\n\n')
      debug('Result from db query is : ', results)

      const data = []
      for (const result of results) {
        const tmpData = {}
        tmpData.id = result.table_row_uuid
        tmpData.type = 'penalty_record'

        delete result.base_legal
        delete result.table_row_uuid
        tmpData.attributes = result

        data.push(tmpData)
      }
      reply.data = data

      debug('Replying with: ', reply)
      res.send(reply)
    }
  })
})

// error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  errorReply.meta.path = req.originalUrl
  errorReply.errors = [
    {
      status: '500',
      title: 'Error with API server',
      detail: 'Error processing request: ' + err.message
    }
  ]

  res.status(500).send(errorReply)
})

app.use((req, res) => {
  errorReply.meta.path = req.originalUrl
  errorReply.errors = [
    {
      status: '404',
      title: 'Path not found',
      detail: 'Path not found: ' + req.originalUrl
    }
  ]
  res.status(404).send(errorReply)
})

const server = app.listen(port, () => {
  console.log(`Request server listening on port ${port}!`)
  if (process.send) {
    process.send('ready') // trigger to PM2 that app is ready
  }
})

// gracefully exiting upon CTRL-C or when PM2 stops the process
process.on('SIGINT', gracefulShutdown)
process.on('SIGTERM', gracefulShutdown)
function gracefulShutdown (signal) {
  console.log(`Received signal ${signal}. Closing http servers and db connections`)

  try {
    async.parallel([
      (callback) => {
        server.close(() => {
          console.log('Closed main server')
          callback()
        })
      }, (callback) => {
        if (dBpool && dBpool.state !== 'disconnected') {
          dBpool.end(function (err) {
            if (err) {
              callback(Error(err))
            } else {
              console.log('Closed dBpool connection')
              callback()
            }
          })
        } else { // connection not active
          console.log('No need to close dBpool connection, not connected')
          callback()
        }
      }],
    function (err, results) {
      if (err) {
        console.error('Error on closing dBpool connection', err)
        setTimeout(() => process.exit(1), 500)
      } else {
        console.log('Grecefully exited')
        setTimeout(() => process.exit(0), 500)
      }
    })
  } catch (err) {
    console.error('Error on exiting', err)
    setTimeout(() => process.exit(1), 500)
  }
}
