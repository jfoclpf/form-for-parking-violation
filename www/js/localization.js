//  LOCALIZATION/GPS/Contacts

/* global app, $, google, GOOGLE_MAPS_API_KEYS */

/* eslint-disable no-unused-vars */
/* this function is global because of gmaps api */
function onGoogleMapsApiLoaded () {
  // get from GPS Address information
  app.localization.getGeolocation()
  app.map.initGoogleMapLoaded()
}
/* eslint-enable no-unused-vars */

app.localization = (function (thisModule) {
  var isGoogleMapsApiLoaded = false
  var Latitude, Longitude

  function loadMapsApi () {
    if (!navigator.onLine || isGoogleMapsApiLoaded) {
      return
    }
    // GOOGLE_MAPS_API_KEYS is an JS Array defined in www/js/credentials.js. Each Array element is a KEY
    // to get a Google maps Key visit https://console.cloud.google.com/apis/credentials

    // get randomly a KEY from the array
    var googleMapsKey = GOOGLE_MAPS_API_KEYS[Math.floor(Math.random() * GOOGLE_MAPS_API_KEYS.length)]
    console.log(googleMapsKey)

    const googleMapsApiJsUrl = 'https://maps.googleapis.com/maps/api/js'
    $.getScript(`${googleMapsApiJsUrl}?key=${googleMapsKey}&callback=onGoogleMapsApiLoaded&language=pt`)

    // this flag should be here otherwise the script might be loaded several times, and Google refuses it
    isGoogleMapsApiLoaded = true
  }

  // botão get address by GPS (Atualizar)
  $('#getCurrentAddresBtn').click(function () {
    getGeolocation()
    app.functions.updateDateAndTime()
  })

  /* Geo location functions */
  function getGeolocation () {
    // detect if has Internet AND if the GoogleMaps API is loaded
    if (navigator.onLine && isGoogleMapsApiLoaded) {
      GPSLoadingOnFields(true) // truns on loading icon on the fields
      var options = { timeout: 30000, enableHighAccuracy: true }
      navigator.geolocation.getCurrentPosition(getPosition, PositionError, options)
    } else {
      PositionError()
    }
  }

  function getPosition (position) {
    var latitude = position.coords.latitude
    Latitude = latitude
    var longitude = position.coords.longitude
    Longitude = longitude
    console.log('latitude, longitude: ', latitude, longitude)
    getAuthoritiesFromGMap(latitude, longitude) // Pass the latitude and longitude to get address.
  }

  // to be used from outside of this module
  function getCoordinates () {
    var coordinates = {
      latitude: Latitude,
      longitude: Longitude
    }
    return coordinates
  }

  function PositionError () {
    $.jAlert({
      title: 'Erro na obtenção do local da ocorrência!',
      theme: 'red',
      content: 'Confirme se tem o GPS ligado e autorizado, e se tem acesso à Internet. Caso contrário pode introduzir manualmente o Concelho, Local (rua, travessa, etc.) e número de porta da ocorrência.'
    })
    GPSLoadingOnFields(false)
  }

  /* Get address by coordinates */
  thisModule.AUTHORITIES = [] // array of possible authorities applicable for that area

  function getAuthoritiesFromGMap (latitude, longitude) {
    var reverseGeocoder = new google.maps.Geocoder()
    var currentPosition = new google.maps.LatLng(latitude, longitude)
    reverseGeocoder.geocode({ latLng: currentPosition }, function (results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        if (results[0]) {
          var addressComponents = results[0].address_components
          getAuthoritiesFromAddress(addressComponents)
        } else {
          PositionError()
        }
      } else {
        PositionError()
      }
    })
  }

  function getAuthoritiesFromAddress (addressComponents) {
    thisModule.AUTHORITIES = []
    var geoNames = [] // array of possible names for the locale, for example ["Lisboa", "Odivelas"]

    if (addressComponents !== undefined) {
      $('#street').val(getAddressComponents(addressComponents, 'route')) // nome da rua/avenida/etc.
      $('#street_number').val(getAddressComponents(addressComponents, 'street_number'))

      // get concelho/municipality according to Google Maps API
      var municipalityFromGmaps = getAddressComponents(addressComponents, 'administrative_area_level_2')
      console.log('municipality from Goolge Maps is ' + municipalityFromGmaps)
      if (municipalityFromGmaps) {
        geoNames.push(municipalityFromGmaps)
      }

      var localityFromGmaps = getAddressComponents(addressComponents, 'locality')
      console.log('locality from Goolge Maps is ' + localityFromGmaps)
      if (localityFromGmaps) {
        geoNames.push(localityFromGmaps)
      }

      var postalCodeFromGmaps = getAddressComponents(addressComponents, 'postal_code')
      console.log('postal_code from Goolge Maps is ' + postalCodeFromGmaps, typeof postalCodeFromGmaps)

      // from the Postal Code got from GPS/Google
      // tries to get locality using the offline Data Base (see file contacts.js)
      var dataFromDB = getDataFromPostalCode(postalCodeFromGmaps)

      var localityFromDB = dataFromDB.locality
      console.log('locality from DB is ' + localityFromDB)
      if (localityFromDB) {
        geoNames.push(localityFromDB)
      }

      var municipalityFromDB = dataFromDB.municipality
      console.log('municipality from DB is ' + municipalityFromDB)
      if (municipalityFromDB) {
        geoNames.push(municipalityFromDB)
      }

      if (localityFromGmaps) {
        $('#locality').val(localityFromGmaps)
      } else if (municipalityFromGmaps) {
        $('#locality').val(municipalityFromGmaps)
      } else if (localityFromDB) {
        $('#locality').val(localityFromDB)
      }

      // if Google Maps has futher information of local name
      var locality2 = getAddressComponents(addressComponents, 'administrative_area_level_3')
      if (locality2 && locality2 !== '') {
        geoNames.push(locality2)
      }
    } else {
      geoNames.push($('#locality').val())
    }

    geoNames = app.functions.cleanArray(geoNames) // removes empty strings
    console.log('geoNames :', geoNames)
    // to check JS apply, see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply
    thisModule.AUTHORITIES.push.apply(thisModule.AUTHORITIES, app.contactsFunctions.getPMcontacts(geoNames))
    thisModule.AUTHORITIES.push.apply(thisModule.AUTHORITIES, app.contactsFunctions.getGNRcontacts(geoNames))
    thisModule.AUTHORITIES.push.apply(thisModule.AUTHORITIES, app.contactsFunctions.getPSPcontacts(geoNames))

    var PSPGeral = {
      authority: 'Polícia',
      authorityShort: 'Polícia de Segurança Pública',
      nome: 'Geral',
      contacto: 'contacto@psp.pt'
    }
    var GNRGeral = {
      authority: 'Guarda Nacional Republicana',
      authorityShort: 'GNR',
      nome: 'Comando Geral',
      contacto: 'gnr@gnr.pt'
    }
    thisModule.AUTHORITIES.push(PSPGeral)
    thisModule.AUTHORITIES.push(GNRGeral)

    console.log('AUTHORITIES :', thisModule.AUTHORITIES)
    populateAuthoritySelect(thisModule.AUTHORITIES)

    GPSLoadingOnFields(false)
  }

  function populateAuthoritySelect (arrayAuthorities) {
    $('#authority').empty() // empty select options
    $.each(arrayAuthorities, function (index, value) {
      $('#authority').append($('<option>', {
        value: index,
        text: value.authorityShort + ' - ' + value.nome
      }))
    })
  }

  // gets "street_number", "route", "locality", "country", "postal_code", "administrative_area_level_2"(concelho)
  function getAddressComponents (components, type) {
    for (var key in components) {
      if (Object.prototype.hasOwnProperty.call(components, key)) {
        if (type === components[key].types[0]) {
          return components[key].long_name
        }
      }
    }
  }

  // GPS/Google Postal Code -> Localities.postalCode -> Localities.municipality ->  Municipalities.code -> Municipalities.name -> PM_Contacts.nome
  function getDataFromPostalCode (postalCode) {
    var toReturn

    // gets first 4 characters
    postalCode = postalCode.substring(0, 4)
    if (postalCode.length !== 4) {
      toReturn = {
        locality: '',
        municipality: ''
      }
      return toReturn
    }

    console.log('getDataFromPostalCode: ' + postalCode, typeof postalCode)

    var key, locality, municipality, municipalityCode

    for (key in app.contacts.Localities) {
      if (app.contacts.Localities[key].postalCode === postalCode) {
        locality = app.contacts.Localities[key].locality
        municipalityCode = app.contacts.Localities[key].municipality
        break
      }
    }

    for (key in app.contacts.Municipalities) {
      if (app.contacts.Municipalities[key].code === municipalityCode) {
        municipality = app.contacts.Municipalities[key].name
        break
      }
    }

    toReturn = {
      locality: $.trim(locality),
      municipality: $.trim(municipality)
    }
    return toReturn
  }

  // removes the loading gif from input fields
  function GPSLoadingOnFields (bool) {
    if (bool) {
      $('#locality').addClass('loading')
      $('#street').addClass('loading')
      $('#street_number').addClass('loading')
    } else {
      $('#street').removeClass('loading')
      $('#street').trigger('input')
      $('#street_number').removeClass('loading')
      $('#street_number').trigger('input')
      $('#locality').removeClass('loading')
      $('#locality').trigger('input')
    }
  }

  // converts latitude, longitude coordinates from Degrees Minutes Second (DMS) to Decimal Degrees (DD)
  // the input string of the DMS is on the format "52/1,0/1,376693/10000"
  function convertDMSStringInfoToDD (gpsString, direction) {
    var i, temp
    var values = []

    var gpsArray = gpsString.split(',')

    for (i = 0; i < gpsArray.length; i++) {
      // if the value is presented in ratio, example "376693/10000"
      temp = gpsArray[i].split('/')
      if (temp[1]) {
        values[i] = parseFloat(temp[0]) / parseFloat(temp[1])
      } else {
        values[i] = parseFloat(gpsArray[i])
      }
    }

    var deg = values[0]
    var min = values[1]
    var sec = values[2]

    var dd = deg + min / 60 + sec / (60 * 60)

    if (direction === 'S' || direction === 'W') {
      dd = dd * -1
    } // Don't do anything for N or E
    return dd
  }

  /* === Public methods to be returned === */
  thisModule.loadMapsApi = loadMapsApi
  thisModule.getGeolocation = getGeolocation
  thisModule.getPosition = getPosition
  thisModule.getCoordinates = getCoordinates
  thisModule.getAuthoritiesFromAddress = getAuthoritiesFromAddress
  thisModule.convertDMSStringInfoToDD = convertDMSStringInfoToDD

  return thisModule
})(app.localization || {})
