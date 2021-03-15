//  LOCALIZATION/GPS/Contacts

/* global app, $ */

app.localization = (function (thisModule) {
  var Latitude, Longitude

  function loadMapsApi () {
    if (!navigator.onLine) {
      console.log('Device Navigator not online')
    } else {
      console.log('Device Navigator is online')
      getGeolocation()
    }
  }

  // botão get address by GPS (Atualizar)
  $('#getCurrentAddresBtn').click(function () {
    getGeolocation()
    app.functions.updateDateAndTime()
  })

  /* Geo location functions */
  function getGeolocation () {
    // detect if has Internet AND if the GoogleMaps API is loaded
    if (navigator.onLine) {
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
    getAuthoritiesFromOSM(latitude, longitude) // Pass the latitude and longitude to get address.
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

  function getAuthoritiesFromOSM (latitude, longitude) {
    $.ajax({
      url: app.main.urls.openStreetMaps.nominatimReverse,
      data: {
        lat: latitude,
        lon: longitude,
        format: 'json',
        namedetails: 1,
        'accept-language': 'pt'
      },
      dataType: 'json',
      type: 'GET',
      async: true,
      crossDomain: true
    }).done(function (res) {
      const address = res.address
      console.log(address)
      getAuthoritiesFromAddress(address)
    }).fail(function (err) {
      console.error(err)
      PositionError()
    })
  }

  function getAuthoritiesFromAddress (address) {
    thisModule.AUTHORITIES = []
    var geoNames = [] // array of possible names for the locale, for example ["Lisboa", "Odivelas"]

    if (address) {
      if (address.road) {
        $('#street').val(address.road) // nome da rua/avenida/etc.
      }

      if (address.house_number) {
        $('#street_number').val(address.house_number)
      }

      // get relevant address details to find police authority
      // see: https://nominatim.org/release-docs/latest/api/Output/#addressdetails
      var relevantAddressDetails = [
        'state_district', 'county',
        'municipality', 'city', 'town', 'village',
        'city_district', 'district', 'borough', 'suburb', 'subdivision'
      ]

      for (let i = 0; i < relevantAddressDetails.length; i++) {
        if (address[relevantAddressDetails[i]]) {
          geoNames.push(address[relevantAddressDetails[i]])
        }
      }

      // from the Postal Code got from OMS
      // tries to get locality using the offline Data Base (see file contacts.js)
      var localityFromDB, municipalityFromDB
      if (address.postcode) {
        const dataFromDB = getDataFromPostalCode(address.postcode)

        localityFromDB = dataFromDB.locality
        console.log('locality from DB is ' + localityFromDB)
        if (localityFromDB) {
          geoNames.push(localityFromDB)
        }

        municipalityFromDB = dataFromDB.municipality
        console.log('municipality from DB is ' + municipalityFromDB)
        if (municipalityFromDB) {
          geoNames.push(municipalityFromDB)
        }
      }

      if (address.municipality) {
        $('#locality').val(address.municipality)
      } else if (address.city) {
        $('#locality').val(address.city)
      } else if (address.town) {
        $('#locality').val(address.town)
      } else if (address.suburb) {
        $('#locality').val(address.suburb)
      } else if (municipalityFromDB) {
        $('#locality').val(municipalityFromDB)
      } else if (localityFromDB) {
        $('#locality').val(localityFromDB)
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

  // GPS/Google Postal Code -> Localities.postalCode -> Localities.municipality ->  Municipalities.code -> Municipalities.name -> PM_Contacts.nome
  function getDataFromPostalCode (postalCode) {
    var toReturn

    postalCode = postalCode.substring(0, 4) // gets first 4 characters
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
