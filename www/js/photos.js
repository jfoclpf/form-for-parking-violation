/* eslint camelcase: off */

/* global app, $, Camera, textocr */

app.photos = (function (thisModule) {
  // get Photo function
  // type depends if the photo is got from camera or the photo library

  // array with full paths of images shown on form
  var imagesUriArray = []

  function getPhoto (imgNmbr, type, callback) {
    console.log('%c ========== GETTING PHOTO ========== ', 'background: yellow; color: blue')

    var srcType
    if (type === 'camera') {
      srcType = Camera.PictureSourceType.CAMERA
    } else if (type === 'library') {
      srcType = Camera.PictureSourceType.PHOTOLIBRARY
    } else {
      console.log('getPhoto error')
      return
    }

    var options = setCameraOptions(srcType)

    console.log('starting navigator.camera.getPicture')
    navigator.camera.getPicture(function (result) {
      console.log('cameraSuccess init')
      cameraSuccess(result, imgNmbr, type, callback)
    },
    function cameraError (error) {
      console.debug('Não foi possível obter fotografia: ' + error, 'app')
    }, options)
  }

  function cameraSuccess (result, imgNmbr, type, callback) {
    // checks if plugin cordova-plugin-camera-with-exif is available
    // some times this plugin has bugs, but it allows to check GPS coordinates of photo
    var isCameraWithExifInfoAvailable, thisResult, imageUri
    try {
      // convert JSON string to JSON Object
      thisResult = JSON.parse(result)
      imageUri = thisResult.filename
      isCameraWithExifInfoAvailable = true
      console.log('using plugin: cordova-plugin-camera-with-exif')
    } catch (e) {
      imageUri = result
      isCameraWithExifInfoAvailable = false
      console.log('using plugin: cordova-plugin-camera')
    }

    console.log('imageUri a) ' + imageUri)

    // adds "file://" at the begining if missing as requested by Android systems
    // see: https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-file/
    if (app.functions.isThisAndroid()) {
      imageUri = app.functions.adaptURItoAndroid(imageUri)
      console.log('imageUri b) ' + imageUri)
    }

    getOCRcarPlate(imageUri, function (result) {
      console.log('A matrícula é:' + result.join('\u2013'))
      $('#plate').val(result.join('\u2013'))
      $('#plate').trigger('input')
    }, function (err) {
      console.log('erro no OCR: ' + err)
    })

    resizeImage(imageUri, function (resizedImgUri, err) {
      var imgToShowUri = !err ? resizedImgUri : imageUri
      displayImage(imgToShowUri, 'myImg_' + imgNmbr)
      console.log('display image ' + imgNmbr + ' : ' + imgToShowUri)
      imagesUriArray[imgNmbr] = resizedImgUri
      callback(imgNmbr)
    })

    // if user selects a photo from the library
    // it gets, when available on the photo the EXIF information
    // the date, time and GPS information, to fill in the form
    if (isCameraWithExifInfoAvailable && type === 'library' &&
      thisResult.json_metadata && thisResult.json_metadata !== '{}') {
      // convert json_metadata JSON string to JSON Object
      var metadata = JSON.parse(thisResult.json_metadata)

      console.log('Metadata from photo obtained')
      console.log(metadata)

      // if the selected photo has EXIF date info, assigns photo date and time automatically to form
      var dateToForm

      // gets date and time from EXIF
      if (metadata.datetime) {
        dateToForm = getDateFromString(metadata.datetime)
      } else {
        // when there is no EXIF information, tries to get date and time from file name
        dateToForm = getDateFromFileName(imageUri)
      }

      if (dateToForm) {
        $('#date').datepicker('setDate', dateToForm)
        var currentTime = app.functions.pad(dateToForm.getHours(), 2) + ':' + app.functions.pad(dateToForm.getMinutes(), 2)
        $('#time').val(currentTime)
      }

      // if the photo EXIF info has GPS information
      if (metadata.gpsLatitude && metadata.gpsLatitudeRef &&
               metadata.gpsLongitude && metadata.gpsLongitudeRef) {
        var Lat = app.localization.convertDMSStringInfoToDD(metadata.gpsLatitude, metadata.gpsLatitudeRef)
        var Long = app.localization.convertDMSStringInfoToDD(metadata.gpsLongitude, metadata.gpsLongitudeRef)

        var postion = {
          coords: {
            latitude: Lat,
            longitude: Long
          }
        }
        console.log(postion)
        app.localization.getPosition(postion)
      }
    }
  }

  // camera plugin options
  function setCameraOptions (srcType) {
    var options = {
      // Some common settings are 20, 50, and 100
      quality: 50, // do not increase, otherwise the email plugin cannot attach photo due to photo file size
      destinationType: Camera.DestinationType.FILE_URI,
      // In this app, dynamically set the picture source, Camera or photo gallery
      sourceType: srcType,
      encodingType: Camera.EncodingType.JPEG,
      mediaType: Camera.MediaType.PICTURE,
      allowEdit: false,
      correctOrientation: true // Corrects Android orientation quirks
    }
    return options
  }

  function getOCRcarPlate (imageUri, success, error) {
    textocr.recText(0, imageUri,
      function (recognizedTextObj) {
        console.debug(recognizedTextObj)
        if (!recognizedTextObj.foundText) {
          error('plate not detected')
          return
        }
        // see https://www.npmjs.com/package/cordova-plugin-mobile-ocr#plugin-usage
        var blockTextArray = recognizedTextObj.blocks.blocktext
        var linesArray = recognizedTextObj.lines.linetext

        // four valid plate types: AA-00-00, 00-00-AA, 00-AA-00, AA-00-AA
        // between AA and 00 can be space \s or any type of hyphen (-) en dash (–) and em dash (—)
        // see: https://pt.stackoverflow.com/a/431398/101186
        // see: https://regex101.com/r/SuYjr4/3
        var detectPlate = RegExp(/^\s{0,}.{0,1}(([A-Z]{2}[\s-–—]{0,1}[0-9]{2}[\s-–—]{0,1}[0-9]{2})|([0-9]{2}[\s-–—]{0,1}[0-9]{2}[\s-–—]{0,1}[A-Z]{2})|([0-9]{2}[\s\-–—]{0,1}[A-Z]{2}[\s\-–—]{0,1}[0-9]{2})|([A-Z]{2}[\s-–—]{0,1}[0-9]{2}[\s-–—]{0,1}[A-Z]{2})).{0,1}\s{0,}$/)

        var pattern, plateArray
        for (var i = 0; i < linesArray.length; i++) {
          pattern = detectPlate.exec(linesArray[i])
          if (pattern && pattern[0]) {
            // plate may be p00 00–AAk
            plateArray = pattern[0].split(/[\s-–—]/)
            if (plateArray.length === 3) {
              plateArray[0] = plateArray[0].slice(-2)
              plateArray[2] = plateArray[2].slice(0, 2)
              if (app.form.isArrayAValidPlate(plateArray)) {
                success(plateArray)
                return
              }
            }
          }
        }

        for (i = 0; i < blockTextArray.length; i++) {
          pattern = detectPlate.exec(blockTextArray[i])
          if (pattern && pattern[0]) {
            // plate may be p00 00–AAk
            plateArray = pattern[0].split(/[\s-–—]/)
            if (plateArray.length === 3) {
              plateArray[0] = plateArray[0].slice(-2)
              plateArray[2] = plateArray[2].slice(0, 2)
              if (app.form.isArrayAValidPlate(plateArray)) {
                success(plateArray)
                return
              }
            }
          }
        }

        error('plate not detected')
      }, function onFail (message) {
        error('no OCR because: ' + message) // OCR failed
      })
  }

  // tries to get date from file name
  // some smartphones set the name of the photo using the date and time
  function getDateFromFileName (fileURI) {
    console.log('getDateFromFileName', fileURI)

    // date yearmonthday
    var n = fileURI.search(/[2][0][0-9][0-9](1[0-2]|0[1-9])([0][1-9]|[1,2][0-9]|3[0,1])/)
    var year = fileURI.substr(n, 4)
    var month = fileURI.substr(n + 4, 2)
    var day = fileURI.substr(n + 6, 2)

    // hourminutes
    var newstring = fileURI.substring(0, n) + fileURI.substring(n + 8)
    n = newstring.search(/[0,1,2][0-9][0-5][0-9]/)
    var hour = newstring.substr(n, 2)
    var minute = newstring.substr(n + 2, 2)

    // checks if photo date (except hour and minutes) is valid
    if (!isValidDate(year, month, day)) {
      return false
    }

    // if valid create date object
    var photoDate = new Date(year, month - 1, day)

    // if hours and minutes are valid, get them also
    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      photoDate = new Date(year, month - 1, day, hour, minute)
    }

    var today = new Date()
    // compare if photo date is earlier than today
    if (photoDate.getTime() >= today.getTime()) {
      return false
    }

    return photoDate
  }

  function getDateFromString (dateString) {
    // the dateString comes in format "2017:11:12 12:53:55"
    // and one needs to have: new Date('2017', '11' - 1, '12', '12', '53', '55')

    console.log('getDateFromString', dateString)

    var dateStr = dateString.split(' ')[0]
    var timeStr = dateString.split(' ')[1]

    var date = dateStr.split(':')
    var time = timeStr.split(':')

    // checks if date (except hour and minutes) is valid
    if (!isValidDate(date[0], date[1], date[2])) {
      return false
    }

    var dateForm = new Date(date[0], date[1] - 1, date[2], time[0], time[1], time[2])
    console.log(dateForm)

    return dateForm
  }

  // checks if date is valid, ex: 30 of February is invalid
  function isValidDate (year, month, day) {
    var date = new Date(year, month - 1, day)
    return date && (date.getMonth() + 1) === month
  }

  function displayImage (imgUri, id) {
    var elem = document.getElementById(id)
    elem.src = imgUri
    elem.style.display = 'block'
  }

  function removeImage (id, num) {
    var elem = document.getElementById(id)
    elem.src = ''
    elem.style.display = 'none'
    imagesUriArray[num] = null
  }

  function resizeImage (imageUri, callback) {
    app.file.resizeImage(imageUri, function (resizedImageUri, err) {
      if (err) {
        // could not resize image
        callback(imageUri, Error(err))
      }
      // return resized image
      callback(resizedImageUri)
    })
  }

  // removes empty values from imagesUriArray, concatenating valid indexes, ex: [1, null, 2, null] will be [1, 2]
  function getImagesArray () {
    return app.functions.cleanArray(imagesUriArray)
  }

  /* === Public methods to be returned === */
  thisModule.getPhoto = getPhoto
  thisModule.removeImage = removeImage
  thisModule.getImagesArray = getImagesArray

  return thisModule
})(app.photos || {})
