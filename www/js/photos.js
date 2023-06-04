/* eslint camelcase: off */
/* eslint prefer-regex-literals: off */

/* global app, cordova, $, Camera, textocr */

app.photos = (function (thisModule) {
  // get Photo function
  // type depends if the photo is got from camera or the photo library

  const photosForEmailAttachment = [] // array with photos info for email attachment (fileUri in android and base64 in iOS)
  const photosUriOnFileSystem = [] // photos URI always on file system (file uri in android and iOS)
  const photosAsBase64 = []
  // tells if each photo has GPS information or if GPS info from the device
  // coincides with the place the photo was taken
  const photoWithGPS = [] // 'synced' or 'unsynced'

  function getPhoto (imgNmbr, type, callback) {
    console.log('%c ========== GETTING PHOTO ========== ', 'background: yellow; color: blue')

    if (app.functions.isThisAndroid()) {
      const permissions = cordova.plugins.permissions
      permissions.checkPermission(permissions.CAMERA, function (status) {
        if (!status.hasPermission) {
          console.log('No permission to access CAMERA. Requesting...')
          permissions.requestPermission(permissions.CAMERA,
            function (status) {
              if (!status.hasPermission) {
                errorGrantingCameraPermission()
              } else {
                startingCamera(imgNmbr, type, callback)
              }
            }, function () {
              errorGrantingCameraPermission()
            })
        } else {
          startingCamera(imgNmbr, type, callback)
        }
      })
    } else {
      startingCamera(imgNmbr, type, callback)
    }
  }

  function errorGrantingCameraPermission () {
    console.error('Erro na permissão para aceder à Câmera')
    window.alert('Erro na permissão para aceder à Câmera')
  }

  function startingCamera (imgNmbr, type, callback) {
    console.log('Has permission to use CAMERA')
    const options = setCameraOptions(type)

    console.log('starting navigator.camera.getPicture')
    navigator.camera.getPicture(function (result) {
      console.log('cameraSuccess init')
      cameraSuccess(result, imgNmbr, type, callback)
    },
    function cameraError (error) {
      console.error('Não foi possível obter fotografia:', error)
    }, options)
  }

  function cameraSuccess (result, imgNmbr, type, callback) {
    // checks if plugin cordova-plugin-camera-with-exif is available
    // some times this plugin has bugs, but it allows to check GPS coordinates of photo
    let isCameraWithExifInfoAvailable, thisResult, imageUri
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

    photosUriOnFileSystem[imgNmbr] = imageUri

    if (app.functions.isThisAndroid()) {
      // this plugin is just working on android
      console.log('Resizing photo...')
      resizeImage(imageUri, function (resizedImgUri, err) {
        console.log('Photo resized')
        const imgToShowUri = !err ? resizedImgUri : imageUri

        console.log('Getting file content of Photo...')
        app.file.getFileContent(imgToShowUri, 'dataURL', (err, res) => {
          if (err) {
            console.error(err)
          } else {
            console.log('Got File content of Photo')
            displayImage(res, 'myImg_' + imgNmbr)
            photosAsBase64[imgNmbr] = res
            photosForEmailAttachment[imgNmbr] = res
          }
          callback(imgNmbr)
        })
      })
    } else if (app.functions.isThis_iOS()) {
      // ios is a mess with file location, thus for email attachment convert photo to base64
      app.file.getFileContent(imageUri, 'dataURL', (err, res) => {
        if (err) {
          console.error(err)
        } else {
          displayImage(res, 'myImg_' + imgNmbr)
          photosAsBase64[imgNmbr] = res
          photosForEmailAttachment[imgNmbr] = res
        }
        callback(imgNmbr)
      })
    } else {
      console.error('APP just works for Android or iOS')
      window.alert('APP just works for Android or iOS')
    }

    if (type === 'camera') {
      // photo comes from the camera, thus the device GPS already coincides with the photo
      photoWithGPS[imgNmbr] = 'synced'
    } else if (
      isCameraWithExifInfoAvailable &&
      type === 'library' &&
      thisResult.json_metadata &&
      thisResult.json_metadata !== '{}'
    ) {
      // if user selects a photo from the library
      // it gets, when available on the photo the EXIF information
      // the date, time and GPS information, to fill in the form

      // convert json_metadata JSON string to JSON Object
      const metadata = JSON.parse(thisResult.json_metadata)

      console.log('Metadata from photo obtained')
      console.log(metadata)

      // if the selected photo has EXIF date info, assigns photo date and time automatically to form
      let dateToForm

      // gets date and time from EXIF
      if (metadata.datetime) {
        dateToForm = getDateFromString(metadata.datetime)
      } else {
        // when there is no EXIF information, tries to get date and time from file name
        dateToForm = getDateFromFileName(imageUri)
      }

      if (dateToForm) {
        $('#date').datepicker('setDate', dateToForm)
        const currentTime = app.functions.pad(dateToForm.getHours(), 2) + ':' + app.functions.pad(dateToForm.getMinutes(), 2)
        $('#time').val(currentTime)
      }

      // if the photo EXIF info has GPS information
      if (metadata.gpsLatitude && metadata.gpsLatitudeRef &&
               metadata.gpsLongitude && metadata.gpsLongitudeRef) {
        const Lat = app.localization.convertDMSStringInfoToDD(metadata.gpsLatitude, metadata.gpsLatitudeRef)
        const Long = app.localization.convertDMSStringInfoToDD(metadata.gpsLongitude, metadata.gpsLongitudeRef)

        const position = {
          coords: {
            latitude: Lat,
            longitude: Long
          }
        }
        console.log(position)
        app.localization.setCoordinates(position)
        // could extract GPS info from the photo
        photoWithGPS[imgNmbr] = 'synced'
      } else {
        photoWithGPS[imgNmbr] = 'unsynced'
      }
    } else {
      // photo was got from library and it has no GPS info
      photoWithGPS[imgNmbr] = 'unsynced'
    }
  }

  // camera plugin options
  function setCameraOptions (type) {
    let srcType
    if (type === 'camera') {
      srcType = Camera.PictureSourceType.CAMERA
    } else if (type === 'library') {
      srcType = Camera.PictureSourceType.PHOTOLIBRARY
    } else {
      console.log('getPhoto error')
      return
    }

    const options = {
      // Some common settings are 20, 50, and 100
      quality: 40, // do not increase, otherwise the email plugin cannot attach photo due to photo file size
      destinationType: Camera.DestinationType.FILE_URI,
      targetWidth: 1200,
      targetHeight: 1600,
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
    if (textocr && typeof textocr.recText === 'function') {
      textocr.recText(0, imageUri,
        function (recognizedTextObj) {
          console.debug(recognizedTextObj)
          if (!recognizedTextObj.foundText) {
            error('plate not detected')
            return
          }
          // see https://www.npmjs.com/package/cordova-plugin-mobile-ocr#plugin-usage
          const blockTextArray = recognizedTextObj.blocks.blocktext
          const linesArray = recognizedTextObj.lines.linetext

          // four valid plate types: AA-00-00, 00-00-AA, 00-AA-00, AA-00-AA
          // between AA and 00 can be space \s or any type of hyphen (-) en dash (–) and em dash (—)
          // see: https://pt.stackoverflow.com/a/431398/101186
          // see: https://regex101.com/r/SuYjr4/3
          const detectPlate = RegExp(/^\s{0,}.{0,1}(([A-Z]{2}[\s-–—]{0,1}[0-9]{2}[\s-–—]{0,1}[0-9]{2})|([0-9]{2}[\s-–—]{0,1}[0-9]{2}[\s-–—]{0,1}[A-Z]{2})|([0-9]{2}[\s\-–—]{0,1}[A-Z]{2}[\s\-–—]{0,1}[0-9]{2})|([A-Z]{2}[\s-–—]{0,1}[0-9]{2}[\s-–—]{0,1}[A-Z]{2})).{0,1}\s{0,}$/)

          let pattern, plateArray
          for (let i = 0; i < linesArray.length; i++) {
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

          for (let i = 0; i < blockTextArray.length; i++) {
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
        }
      )
    } else {
      error('OCR service/function not available')
    }
  }

  // tries to get date from file name
  // some smartphones set the name of the photo using the date and time
  function getDateFromFileName (fileURI) {
    console.log('getDateFromFileName', fileURI)

    // date yearmonthday
    let n = fileURI.search(/[2][0][0-9][0-9](1[0-2]|0[1-9])([0][1-9]|[1,2][0-9]|3[0,1])/)
    const year = fileURI.substr(n, 4)
    const month = fileURI.substr(n + 4, 2)
    const day = fileURI.substr(n + 6, 2)

    // hourminutes
    const newstring = fileURI.substring(0, n) + fileURI.substring(n + 8)
    n = newstring.search(/[0,1,2][0-9][0-5][0-9]/)
    const hour = newstring.substr(n, 2)
    const minute = newstring.substr(n + 2, 2)

    // checks if photo date (except hour and minutes) is valid
    if (!isValidDate(year, month, day)) {
      return false
    }

    // if valid create date object
    let photoDate = new Date(year, month - 1, day)

    // if hours and minutes are valid, get them also
    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      photoDate = new Date(year, month - 1, day, hour, minute)
    }

    const today = new Date()
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

    const dateStr = dateString.split(' ')[0]
    const timeStr = dateString.split(' ')[1]

    const date = dateStr.split(':')
    const time = timeStr.split(':')

    // checks if date (except hour and minutes) is valid
    if (!isValidDate(date[0], date[1], date[2])) {
      return false
    }

    const dateForm = new Date(date[0], date[1] - 1, date[2], time[0], time[1], time[2])
    console.log(dateForm)

    return dateForm
  }

  // checks if date is valid, ex: 30 of February is invalid
  function isValidDate (year, month, day) {
    const date = new Date(year, month - 1, day)
    return date && (date.getMonth() + 1) === month
  }

  function displayImage (imgUri, id) {
    const elem = document.getElementById(id)
    elem.src = imgUri
    elem.style.display = 'block'
  }

  function removeImage (id, num) {
    const elem = document.getElementById(id)
    elem.src = ''
    elem.style.display = 'none'
    photosForEmailAttachment[num] = null
    photosUriOnFileSystem[num] = null
    photosAsBase64[num] = null
    photoWithGPS[num] = null
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

  function getPhotosForEmailAttachment () {
    // removes empty values from photosForEmailAttachment,
    // concatenating valid indexes, ex: [1, null, 2, null] will be [1, 2]
    return app.functions.cleanArray(photosForEmailAttachment)
  }

  function getPhotosUriOnFileSystem () {
    return app.functions.cleanArray(photosUriOnFileSystem)
  }

  function getPhotosAsBase64 () {
    return app.functions.cleanArray(photosAsBase64)
  }

  function getPhotoWithGPS () {
    return app.functions.cleanArray(photoWithGPS)
  }

  /* === Public methods to be returned === */
  thisModule.getPhoto = getPhoto
  thisModule.removeImage = removeImage
  thisModule.getPhotosForEmailAttachment = getPhotosForEmailAttachment
  thisModule.getPhotosUriOnFileSystem = getPhotosUriOnFileSystem
  thisModule.getPhotosAsBase64 = getPhotosAsBase64
  thisModule.getPhotoWithGPS = getPhotoWithGPS

  return thisModule
})(app.photos || {})
