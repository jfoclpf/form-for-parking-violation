/* eslint camelcase: off */

/* global app, $, device, FileUploadOptions, FileTransfer, DEBUG */

app.functions = (function (thisModule) {
  // detects if the car plate is correctly filled in
  function isCarPlateOK () {
    var plateArray = $('#plate').val().split(/[-–—]/)
    return isArrayAValidPlate(plateArray)
  }

  // check if array is valid, p.e. ['AA','99','DD']
  function isArrayAValidPlate (arrayPlate) {
    var plateString = arrayPlate.join('-')
    // four valid plate types: AA-00-00, 00-00-AA, 00-AA-00, AA-00-AA
    // see: https://pt.stackoverflow.com/a/431398/101186
    var expr = RegExp(/(([A-Z]{2}-[0-9]{2}-[0-9]{2})|([0-9]{2}-[0-9]{2}-[A-Z]{2})|([0-9]{2}-[A-Z]{2}-[0-9]{2})|([A-Z]{2}-[0-9]{2}-[A-Z]{2}))$/)

    return expr.test(plateString)
  }

  // detects if the postal code is correctly filled in
  function isPostalCodeOK () {
    var plate_str = $('#postal_code').val()

    plate_str = $.trim(plate_str)

    if (plate_str.length !== 8) {
      return false
    }

    plate_str = plate_str.replace(/\u2013|\u2014/g, '-') // it replaces all &ndash; (–) and &mdash; (—) symbols with simple dashes (-)

    // regex format for 0000-000 or 0000 000
    // http://stackoverflow.com/questions/2577236/regex-for-zip-code
    if (plate_str.match(/^\d{4}(?:[-\s]\d{3})?$/)) {
      return true
    } else {
      return false
    }
  }

  // get carplate
  function getCarPlate () {
    var plate_str = $('#plate').val()
    plate_str = plate_str.toUpperCase() // force place upcase
    plate_str = plate_str.replace(/\u2013|\u2014/g, '-') // it replaces all &ndash; (–) and &mdash; (—) symbols with simple dashes (-)

    return plate_str
  }

  function getCarMake () {
    return $('#carmake').val()
  }

  function getCarModel () {
    return $('#carmodel').val()
  }

  function getDateYYYY_MM_DD () {
    // returns format YYYY-MM-DD
    return $.datepicker.formatDate("yy'-'mm'-'dd", $('#date').datepicker('getDate'))
  }

  function getTimeHH_MM () {
    return $('#time').val()
  }

  function getFullAddress () {
    const streetNumber = getStreetNumber()
    if (streetNumber) {
      return `${getStreetName()} n. ${streetNumber}, ${getLocality()}`
    } else {
      return `${getStreetName()}, ${getLocality()}`
    }
  }

  function getLocality () {
    return $('#locality').val()
  }

  function getStreetName () {
    return $('#street').val()
  }

  function getStreetNumber () {
    return $('#street_number').val() ? $('#street_number').val() : ''
  }

  function getAuthority () {
    return $('#authority option:selected').text()
  }

  // as the user writes his name, detects if the name is ok
  $('#name').on('input', function () {
    if (!isFullNameOK($(this).val()) && !DEBUG) {
      $(this).css('border-color', 'red')
    } else {
      $(this).css('border-color', '')
    }
  })

  // detects if user has inserted full name
  function isFullNameOK (fullName) {
    // removes all non-alphabetic characters
    var name = fullName.replace(/[^a-zA-Z ]/g, '')
    // removes consecutive spaces in-between
    name = name.replace(/\s\s+/g, ' ')

    // trims leading and trailing spaces
    name = $.trim(name)

    // gets the number of words / names
    var name_array = name.split(' ')
    var number_of_names = name_array.length

    // disconsider small particles which are not a name
    var el
    for (var i in name_array) {
      el = name_array[i]
      if (el === 'dos' || el === 'da' || el === 'do' || el === 'das') {
        number_of_names--
      }
    }

    console.log('Number of relevant names: ', number_of_names)
    // if user inserted only 1 or 2 words, it didn't inserted full name, as demanded
    if ((number_of_names === 1 || number_of_names === 2)) {
      return false
    }

    return true
  }

  // limpar a mensagem para o email, remove HTML tags,
  // pois o mailto não aceita HTML tags, apenas texto simples
  function clean_message (message) {
    var temp = message
    temp = temp.replace(/<b\s*\/?>/mg, '')
    temp = temp.replace(/<\/b\s*\/?>/mg, '')
    temp = temp.replace(/<br\s*\/?>/mg, '\n')
    return temp
  }

  // add zeros to numbers, ex: pad(7, 3)="007"
  function pad (num, size) {
    var s = num + ''
    while (s.length < size) s = '0' + s
    return s
  }

  // Will remove all falsy values: undefined, null, 0, false, NaN and "" (empty string)
  function cleanArray (actual) {
    var newArray = []
    for (var i = 0; i < actual.length; i++) {
      if (actual[i]) {
        newArray.push(actual[i])
      }
    }
    return newArray
  }

  // initializes date and time with current date and time
  function updateDateAndTime () {
    var date = new Date()
    $('#date').datepicker('setDate', date)
    var currentTime = pad(date.getHours(), 2) + ':' + pad(date.getMinutes(), 2)
    $('#time').val(currentTime)
  }

  // 'file://path/to/photo.jpg?123' => 'file://path/to/photo123.jpg'
  // this function is very important cause the getpicture plugin returns a unique tag after ?
  // on the file uri, such that files don't get messed with each other, since the plugin uses the cache
  function adaptFilenameFromUri (uri) {
    if (uri.includes('?')) {
      var code = uri.split('?').slice(-1) // 123
      var fileNoCode = uri.split('?').slice(0, -1).join('?') // file://photo.jpg
      var extenstion = fileNoCode.split('.').slice(-1) // 'jpg'
      var fileNoCodeNoExtension = fileNoCode.split('.').slice(0, -1).join('.') // file://photo
      return fileNoCodeNoExtension + code + '.' + extenstion
    } else {
      return uri
    }
  }

  // ex: from "file:///storage/emulated/0/Android/data/com.form.parking.violation/cache/1525698243664.jpg"
  // output[0] == "file:///storage/emulated/0/Android/data/com.form.parking.violation/cache"
  // output[1] == "1525698243664.jpg"
  function getFilenameFromURL (url) {
    if (!url) {
      return false
    }
    var output = []
    output[1] = url.split('/').pop()
    output[0] = url.substring(0, url.length - output[1].length - 1)
    return output
  }

  // from "https://example.com/folder/file.jpg?param.eter#hash=12.345"
  // output ------> jpg
  function getExtensionFromURL (url) {
    return url.split(/#|\?/)[0].split('.').pop().trim()
  }

  /* use it like this, for example:
  copyFile("file:///storage/emulated/0/Android/data/com.form.parking.violation/cache/IMG-20180505-WA0004.jpg",        "myImg.jpg", LocalFileSystem.TEMPORARY);
  see https://stackoverflow.com/a/50221986/1243247 */
  function _copyFile (baseFileURI, destPathName, fileSystem) {
    console.log('Copying from: ' + baseFileURI)

    if (!baseFileURI) {
      console.error('File to copy empty or null')
      return
    }

    return new Promise(function (resolve, reject) {
      window.resolveLocalFileSystemURL(baseFileURI,
        function (file) {
          window.requestFileSystem(fileSystem, 0,
            function (fileSystem) {
              var documentsPath = fileSystem.root
              console.log(documentsPath)
              file.copyTo(documentsPath, destPathName,
                function (res) {
                  console.log('copying was successful to: ' + res.nativeURL)
                  resolve(res.nativeURL)
                },
                function () {
                  console.log('unsuccessful copying')
                })
            })
        },
        function () {
          console.log('failure! file was not found')
          reject(Error('failure! file was not found'))
        }
      )
    })
  }

  function copyFile (baseFileURI, destPathDir) {
    console.log('Copying : ' + baseFileURI)

    function getFilenameFromURL (url) {
      if (!url) {
        return false
      }
      var output = []
      output[1] = url.split('/').pop()
      output[0] = url.substring(0, url.length - output[1].length - 1)
      return output
    }

    var destPathName = getFilenameFromURL(baseFileURI)[1]

    if (!baseFileURI || !destPathName) {
      console.error('File to copy empty or invalid')
      return
    }

    if (!destPathDir) {
      console.error('Directory to copy empty or null')
      return
    }

    console.log('Copying to: ' + destPathDir + destPathName)

    return new Promise(function (resolve, reject) {
      window.resolveLocalFileSystemURL(baseFileURI,
        function (file) {
          window.resolveLocalFileSystemURL(destPathDir,
            function (destPathDirObj) {
              console.log(destPathDirObj)

              file.copyTo(destPathDirObj, destPathName,
                function (res) {
                  console.log('copying was successful to: ' + res.nativeURL)
                  resolve(res.nativeURL)
                },
                function () {
                  console.log('unsuccessful copying')
                })
            })
        },
        function () {
          console.log('failure! file was not found')
          reject(Error('failure! file was not found'))
        }
      )
    })
  }

  function moveFile (baseFileURI, destPathDir) {
    console.log('Moving : ' + baseFileURI)

    function getFilenameFromURL (url) {
      if (!url) {
        return false
      }
      var output = []
      output[1] = url.split('/').pop()
      output[0] = url.substring(0, url.length - output[1].length - 1)
      return output
    }

    var destPathName = getFilenameFromURL(baseFileURI)[1]

    if (!baseFileURI || !destPathName) {
      console.error('File to move empty or invalid')
      return
    }

    if (!destPathDir) {
      console.error('Directory to move empty or null')
      return
    }

    console.log('Moving to: ' + destPathDir + destPathName)

    return new Promise(function (resolve, reject) {
      window.resolveLocalFileSystemURL(baseFileURI,
        function (file) {
          window.resolveLocalFileSystemURL(destPathDir,
            function (destPathDirObj) {
              console.log(destPathDirObj)

              file.moveTo(destPathDirObj, destPathName,
                function (res) {
                  console.log('moving was successful to: ' + res.nativeURL)
                  resolve(res.nativeURL)
                },
                function () {
                  console.log('unsuccessful moving')
                })
            })
        },
        function () {
          console.log('failure! file was not found')
          reject(Error('failure! file was not found'))
        }
      )
    })
  }

  // example: list of www/audio/ folder in cordova/ionic app.
  // listDir(cordova.file.applicationDirectory + "www/audio/");
  function listDir (path) {
    window.resolveLocalFileSystemURL(path,
      function (fileSystem) {
        var reader = fileSystem.createReader()
        reader.readEntries(
          function (entries) {
            console.log(entries)
          },
          function (err) {
            console.log(err)
          }
        )
      }, function (err) {
        console.log(err)
      }
    )
  }

  function getFileSize (fileUri, callback) {
    var fileSize = null
    window.resolveLocalFileSystemURL(fileUri, function (fileEntry) {
      fileEntry.file(function (fileObj) {
        fileSize = fileObj.size
        callback(fileSize)
      },
      function (err) {
        console.error('fileEntry error:\n', JSON.stringify(err))
        callback(fileSize, Error(err))
      })
    },
    function (err) {
      console.error('resolveLocalFileSystemURL error:\n', JSON.stringify(err))
      callback(fileSize, Error(err))
    })
  }

  function resizeImage (imageUri, callback) {
    // generate filename for resized image
    var uriAdapted = adaptFilenameFromUri(imageUri) // 'file://path/to/photo.jpg?123' => 'file://path/to/photo123.jpg'
    var fileName = getFilenameFromURL(uriAdapted)[1] // 'file://path/to/photo123.jpg' => 'photo123.jpg'
    var fileNameWithoutExtension = fileName.split('.').slice(0, -1).join('.') // 'photo123'
    var extension = getExtensionFromURL(fileName) // 'jpg'
    var fileNameResized = fileNameWithoutExtension + '_resized' + '.' + extension // 'photo123_resized.jpg'
    console.log('fileNameResized:', fileNameResized)

    var resizeOptions = {
      uri: imageUri,
      fileName: fileNameResized,
      quality: 90,
      width: 1200,
      height: 1200,
      base64: false
    }

    window.ImageResizer.resize(resizeOptions,
      function (resizedImageUri) {
        // success on resizing
        console.log('%c Image resized: ', 'color: green; font-weight:bold', resizedImageUri)
        callback(resizedImageUri)
      },
      // failed to resize
      function (err) {
        console.log('%c Failed to resize: ', 'color: red; font-weight:bold')
        callback(imageUri, Error(err))
      })
  }

  function clearCache () {
    // clear cache, important, ex: otherwise the images get messed if loaded again
    window.CacheClear(function (result) {
      console.debug('cache cleared:' + result)
    },
    function (err) {
      console.debug('cache cleared error:' + err)
    })
  }

  function isThisAndroid () {
    return device.platform.toLowerCase() === 'android'
  }

  function adaptURItoAndroid (imgUR) {
    if (!isThisAndroid() || !imgUR) {
      return imgUR
    }

    // the string is of the type "/path/to/dest"
    if (!imgUR.includes('://')) {
      return 'file://' + imgUR
    } else {
      // it does include some protocol blabla://
      // replace by file://
      return 'file://' + imgUR.split('://')[1]
    }
  }

  function submitDataToDB () {
    const uploadImagesUrl = 'https://contabo.joaopimentel.com/passeio_livre/serverapp_img_upload'
    const uploadRequesUrl = 'https://contabo.joaopimentel.com/passeio_livre/serverapp'

    // generates file names array for images
    const randomString = getRandomString(10) // serves to uniquely identify the filenames
    var imgFileNames = []
    app.main.imagesUriCleanArray = cleanArray(app.main.imagesUriArray)
    var numberOfImages = app.main.imagesUriCleanArray.length
    for (let i = 0; i < 4; i++) {
      if (i < numberOfImages) {
        const fileName = `${DEBUG ? 'debug_' : ''}${getCarPlate()}_n${i + 1}_${getDateYYYY_MM_DD()}_${getTimeHH_MM()}_${getLocality()}_${randomString}.jpg`
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
            console.log(res)
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
      carro_matricula: getCarPlate(),
      carro_marca: getCarMake(),
      carro_modelo: getCarModel(),
      data_data: getDateYYYY_MM_DD(),
      data_hora: getTimeHH_MM(),
      data_concelho: getLocality(),
      data_local: getStreetName(),
      data_num_porta: getStreetNumber(),
      data_coord_latit: app.localization.getCoordinates().latitude,
      data_coord_long: app.localization.getCoordinates().longitude,
      base_legal: app.penalties.getSelectedPenaltyCode(),
      autoridade: getAuthority()
    }

    $.ajax({
      url: uploadRequesUrl,
      type: 'POST',
      data: JSON.stringify(databaseObj),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      crossDomain: true,
      success: function (data) {
        console.log('Values inserted into database with success. Returned: ', data)
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

  function setDebugValues () {
    $('#plate').val('00\u2013XX\u201300')
    $('#carmake').val('Opel')
    $('#carmodel').val('Corsa')
    $('#penalties').val('bicicletas')
  }

  /* === Public methods to be returned === */
  thisModule.isCarPlateOK = isCarPlateOK
  thisModule.isArrayAValidPlate = isArrayAValidPlate
  thisModule.isPostalCodeOK = isPostalCodeOK
  thisModule.getCarPlate = getCarPlate
  thisModule.getFullAddress = getFullAddress
  thisModule.isFullNameOK = isFullNameOK
  thisModule.clean_message = clean_message
  thisModule.pad = pad
  thisModule.listDir = listDir
  thisModule.getFilenameFromURL = getFilenameFromURL
  thisModule.copyFile = copyFile
  thisModule._copyFile = _copyFile
  thisModule.moveFile = moveFile
  thisModule.cleanArray = cleanArray
  thisModule.updateDateAndTime = updateDateAndTime
  thisModule.adaptFilenameFromUri = adaptFilenameFromUri
  thisModule.getExtensionFromURL = getExtensionFromURL
  thisModule.getFileSize = getFileSize
  thisModule.resizeImage = resizeImage
  thisModule.clearCache = clearCache
  thisModule.isThisAndroid = isThisAndroid
  thisModule.adaptURItoAndroid = adaptURItoAndroid
  thisModule.submitDataToDB = submitDataToDB
  thisModule.setDebugValues = setDebugValues

  return thisModule
})(app.functions || {})
