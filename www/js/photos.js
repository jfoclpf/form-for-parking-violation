/* eslint camelcase: off */

/* global app, $, Camera */

app.photos = (function (thisModule) {
  // get Photo function
  // type depends if the photo is got from camera or the photo library

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

    navigator.camera.getPicture(function cameraSuccess (result) {
      // convert JSON string to JSON Object
      var thisResult = JSON.parse(result)

      var imageUri = thisResult.filename
      console.log('imageUri a) ' + imageUri)

      // removes queries from the URI, i.e., the text after "?"
      // for example 'file://photo.jpg?123' will be 'file://photo.jpg'
      imageUri = app.functions.getPathFromUri(imageUri)
      console.log('imageUri b) ' + imageUri)

      // adds "file://" at the begining if missing as requested by Android systems
      // see: https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-file/
      if (app.functions.isThisAndroid()) {
        imageUri = app.functions.adaptURItoAndroid(imageUri)
        console.log('imageUri c) ' + imageUri)
      }

      resizeImageIfNeeded(imageUri, function (resizedImgUri, err) {
        var imgToShowUri = !err ? resizedImgUri : imageUri
        displayImage(imgToShowUri, 'myImg_' + imgNmbr)
        console.log('display image ' + imgNmbr + ' : ' + imgToShowUri)
        app.main.imagesUriArray[imgNmbr] = resizedImgUri
        callback(imgNmbr)
      })

      // if user selects a photo from the library
      // it gets, when available on the photo the EXIF information
      // the date, time and GPS information, to fill in the form
      if (type === 'library' && thisResult.json_metadata && thisResult.json_metadata !== '{}') {
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
          var Lat = app.localization.ConvertDMSStringInfoToDD(metadata.gpsLatitude, metadata.gpsLatitudeRef)
          var Long = app.localization.ConvertDMSStringInfoToDD(metadata.gpsLongitude, metadata.gpsLongitudeRef)

          var postion = {
            'coords': {
              'latitude': Lat,
              'longitude': Long
            }
          }
          console.log(postion)
          app.localization.GetPosition(postion)
        }
      }
    }, function cameraError (error) {
      console.debug('Não foi possível obter fotografia: ' + error, 'app')
    }, options)
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
    app.main.imagesUriArray[num] = null
  }

  function resizeImageIfNeeded (imageUri, callback) {
    // if image larger than this, resize
    var MAX_IMG_FILE_SIZE = 307200 // 300kb

    app.functions.getFileSize(imageUri, function (fileSize, err) {
      if (!err && fileSize && fileSize < MAX_IMG_FILE_SIZE) {
        // no need to resize image, return image unchanged
        console.log('Image Not resized (file already small): ' + imageUri)
        callback(imageUri)
      } else {
        // resize image (try even if file size is not obtained)
        app.functions.resizeImage(imageUri, function (resizedImageUri, err) {
          if (err) {
            // could not resize image
            callback(imageUri, Error(err))
          }
          // return resized image
          callback(resizedImageUri)
        })
      }
    })
  }

  /* === Public methods to be returned === */
  thisModule.getPhoto = getPhoto
  thisModule.removeImage = removeImage

  return thisModule
})(app.photos || {})
