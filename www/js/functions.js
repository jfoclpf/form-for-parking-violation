/* eslint camelcase: off */

/* global app, cordova, $, device, ADMIN_DEVICE_UUIDs, fetch */

app.functions = (function (thisModule) {
  // to run on startup
  // add functions related with respective plugins
  function addFunctionsToPlugins () {
    cordova.plugins.email.adaptDataUrlForAttachment = function (path, index) {
      return `base64:photo${index + 1}.jpg//` + path.split(',').pop()
    }
  }

  // tell if current user is an authorized admin
  function isCurrentUserAnAdmin () {
    return (typeof ADMIN_DEVICE_UUIDs !== 'undefined') && ADMIN_DEVICE_UUIDs.includes(device.uuid)
  }

  // initializes date and time with current date and time of Lisbon from time API
  // if time API is not available, use device internal clock
  function updateDateAndTime () {
    return new Promise((resolve, reject) => {
      const zone = 'Europe/Lisbon'
      fetch('https://worldtimeapi.org/api/timezone/' + zone)
        .then(r => r.json())
        .then(r => {
          // strip out timezone offset from datetime ISO string
          const date = new Date(r.datetime.replace(/[+-]\d\d:\d\d$/, ''))
          console.log(`Time now in ${zone}: ${date.getHours()}:${date.getMinutes()}`)
          $('#date').datepicker('setDate', date)
          const currentTime = pad(date.getHours(), 2) + ':' + pad(date.getMinutes(), 2)
          $('#time').val(currentTime)
        })
        .catch(() => {
          const date = new Date()
          $('#date').datepicker('setDate', date)
          const currentTime = pad(date.getHours(), 2) + ':' + pad(date.getMinutes(), 2)
          $('#time').val(currentTime)
        })
        .finally(() => {
          resolve()
        })
    })
  }

  // limpar a mensagem para o email, remove HTML tags,
  // pois o mailto não aceita HTML tags, apenas texto simples
  function clean_message (message) {
    let temp = message
    temp = temp.replace(/<b\s*\/?>/mg, '')
    temp = temp.replace(/<\/b\s*\/?>/mg, '')
    temp = temp.replace(/<br\s*\/?>/mg, '\n')
    return temp
  }

  // add zeros to numbers, ex: pad(7, 3)="007"
  function pad (num, size) {
    let s = num + ''
    while (s.length < size) s = '0' + s
    return s
  }

  // Will remove all falsy values: undefined, null, 0, false, NaN and "" (empty string)
  function cleanArray (actual) {
    const newArray = []
    for (let i = 0; i < actual.length; i++) {
      if (actual[i]) {
        newArray.push(actual[i])
      }
    }
    return newArray
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

  function isThis_iOS () {
    return device.platform === 'iOS'
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
  thisModule.isThis_iOS = isThis_iOS
  thisModule.adaptURItoAndroid = adaptURItoAndroid
  thisModule.setDebugValues = setDebugValues

  return thisModule
})(app.functions || {})
