/* eslint camelcase: "off" */
/* global app, device, $, FileUploadOptions, FileTransfer, DEBUG */

app.dbServerLink = (function (thisModule) {
  function submitDataToDB () {
    const uploadImagesUrl = app.main.urls.databaseServer.uploadImages
    const uploadOccurenceUrl = app.main.urls.databaseServer.uploadOccurence

    const carPlate = app.form.getCarPlate()
    const dateYYYY_MM_DD = app.form.getDateYYYY_MM_DD()
    const timeHH_MM = app.form.getTimeHH_MM()
    const locality = app.form.getLocality()

    // generates file names array for images
    const randomString = getRandomString(10) // serves to uniquely identify the filenames
    var imgFileNames = []
    app.main.imagesUriCleanArray = app.functions.cleanArray(app.main.imagesUriArray)
    var numberOfImages = app.main.imagesUriCleanArray.length
    for (let i = 0; i < 4; i++) {
      if (i < numberOfImages) {
        const fileName = `${DEBUG ? 'debug_' : ''}${carPlate}_n${i + 1}_${dateYYYY_MM_DD}_${timeHH_MM}_${locality}_${randomString}.jpg`
        imgFileNames.push(fileName)
      } else {
        imgFileNames.push('')
      }
    }

    // upload all photos
    for (let i = 0; i < numberOfImages; i++) {
      uploadFile(app.main.imagesUriCleanArray[i],
        imgFileNames[i],
        uploadImagesUrl,
        (err, res) => {
          if (err) {
            console.error(err)
          } else {
            console.success(res)
          }
        })
    }

    var databaseObj = {
      PROD: !DEBUG ? 1 : 0,
      uuid: device.uuid,
      foto1: imgFileNames[0],
      foto2: imgFileNames[1],
      foto3: imgFileNames[2],
      foto4: imgFileNames[3],
      carro_matricula: app.form.getCarPlate(),
      carro_marca: app.form.getCarMake(),
      carro_modelo: app.form.getCarModel(),
      data_data: app.form.getDateYYYY_MM_DD(),
      data_hora: app.form.getTimeHH_MM(),
      data_concelho: app.form.getLocality(),
      data_local: app.form.getStreetName(),
      data_num_porta: app.form.getStreetNumber(),
      data_coord_latit: app.localization.getCoordinates().latitude,
      data_coord_long: app.localization.getCoordinates().longitude,
      base_legal: app.penalties.getSelectedPenaltyCode(),
      autoridade: app.form.getAuthority()
    }

    $.ajax({
      url: uploadOccurenceUrl,
      type: 'POST',
      data: JSON.stringify(databaseObj),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      crossDomain: true,
      success: function (data) {
        console.success('Values inserted into database with success.')
        console.log('Returned:', data)
      },
      error: function (error) {
        console.error('There was an error submitting the following object into the database: ', databaseObj)
        console.error(error)
      }
    })
  }

  // used to upload image files to server
  function uploadFile (localPath, fileName, remoteUrl, callback) {
    var win = function (r) {
      console.log('Code = ' + r.responseCode)
      console.log('Response = ' + r.response)
      console.log('Sent = ' + r.bytesSent)
      if (typeof callback === 'function') {
        callback(null, 'File uploaded succesfully')
      }
    }

    var fail = function (error) {
      console.error('An error has occurred: Code = ' + error.code)
      console.error('upload error source ' + error.source)
      console.error('upload error target ' + error.target)
      if (typeof callback === 'function') {
        callback(Error('Failed to upload file ' + localPath))
      }
    }

    var options = new FileUploadOptions()
    options.fileKey = 'file'
    options.fileName = fileName

    var ft = new FileTransfer()
    ft.upload(localPath, encodeURI(remoteUrl), win, fail, options)
  }

  // generate random string
  function getRandomString (length) {
    var result = ''
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    var charactersLength = characters.length
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
  }

  thisModule.submitDataToDB = submitDataToDB

  return thisModule
})(app.dbServerLink || {})
