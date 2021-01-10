/* eslint camelcase: off */

/* global app, cordova, $, device, ADMIN_DEVICE_UUIDs */

app.functions = (function (thisModule) {
  // to run on startup
  // add functions related with respective plugins
  function addFunctionsToPlugins () {
    cordova.plugins.email.adaptFilePathInInternalStorage = function (path) {
      if (isThisAndroid()) {
        // see: https://www.npmjs.com/package/cordova-plugin-email-composer#attach-files-from-the-internal-app-file-system
        return path.replace(cordova.file.applicationStorageDirectory, 'app://')
      } else {
        return path
      }
    }
  }

  // tell if current user is an authorized admin
  function isCurrentUserAnAdmin () {
    return ADMIN_DEVICE_UUIDs && ADMIN_DEVICE_UUIDs.includes(device.uuid)
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

  function setDebugValues () {
    $('#plate').val('00\u2013XX\u201300')
    $('#carmake').val('Opel')
    $('#carmodel').val('Corsa')
    $('#penalties').val('bicicletas')
  }

  /* === Public methods to be returned === */
  thisModule.addFunctionsToPlugins = addFunctionsToPlugins
  thisModule.isCurrentUserAnAdmin = isCurrentUserAnAdmin
  thisModule.clean_message = clean_message
  thisModule.pad = pad
  thisModule.cleanArray = cleanArray
  thisModule.updateDateAndTime = updateDateAndTime
  thisModule.clearCache = clearCache
  thisModule.isThisAndroid = isThisAndroid
  thisModule.adaptURItoAndroid = adaptURItoAndroid
  thisModule.setDebugValues = setDebugValues

  return thisModule
})(app.functions || {})
