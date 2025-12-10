//  LOCALIZATION/GPS/Contacts

/* global app, $ */

app.localization = (function (thisModule) {
  let Latitude, Longitude

  function loadMapsApi () {
    if (!navigator.onLine) {
      console.error('Device Navigator not online')
    } else {
      console.log('Device Navigator is online')
      getGeolocation()
    }
  }

  // botão Atualizar
  $('#getCurrentAddresBtn').on('click', function () {
    app.functions.updateDateAndTime()
    getGeolocation()
  })

  /* Geo location functions */
  function getGeolocation () {
    app.form.startSpinner()

    // detect if has Internet AND if the GoogleMaps API is loaded
    if (navigator.onLine) {
      GPSLoadingOnFields(true) // truns on loading icon on the fields
      const options = { timeout: 30000, enableHighAccuracy: true }
      navigator.geolocation.getCurrentPosition(setCoordinates, PositionError, options)
    } else {
      console.error('Device Navigator not online')
      app.form.stopSpinner()
      PositionError()
    }
  }

  function setCoordinates (position) {
    const latitude = position.coords.latitude
    Latitude = latitude
    const longitude = position.coords.longitude
    Longitude = longitude
    console.log('latitude, longitude: ', latitude, longitude)
    getAddressFromGPS(latitude, longitude) // Pass the latitude and longitude to get address.
  }

  // to be used from outside of this module
  function getCoordinates () {
    const coordinates = {
      latitude: Latitude,
      longitude: Longitude
    }
    return coordinates
  }

  function PositionError (error) {
    console.error(`code: ${error.code}; message: ${error.message}`)

    $.jAlert({
      title: 'Erro na obtenção do local da ocorrência!',
      theme: 'red',
      content: 'Confirme se tem o GPS ligado e autorizado, e se tem acesso à Internet. Caso contrário pode introduzir manualmente a Localidade, Concelho, Local (rua, travessa, etc.) e número de porta da ocorrência.'
    })
    GPSLoadingOnFields(false)
  }

  /* Get address by coordinates */
  thisModule.AUTHORITIES = [] // array of possible authorities applicable for that area

  function getAddressFromGPS (latitude, longitude) {
    // makes two parallel async GET requests
    Promise.allSettled([
      $.ajax({
        url: app.main.urls.geoApi.nominatimReverse,
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
      }),
      $.ajax({
        url: app.main.urls.geoApi.ptApi + `/gps/${latitude},${longitude}/base`,
        dataType: 'json',
        type: 'GET',
        async: true,
        crossDomain: true
      })
    ]).then(function (res) {
      // from app.main.urls.geoApi.nominatimReverse
      if (res[0].status !== 'fulfilled') {
        console.error(app.main.urls.geoApi.nominatimReverse + ' returns empty')
        GPSLoadingOnFields(false)
        PositionError()
      } else {
        const addressFromOSM = res[0].value.address
        let addressFromGeoPtApi
        // from app.main.urls.geoApi.ptApi
        if (res[1].status !== 'fulfilled') {
          // this happens when user is not in Portugal
          console.warn(app.main.urls.geoApi.ptApi + ' returns empty')
        } else {
          addressFromGeoPtApi = res[1].value
        }

        console.log('getLocale: ', addressFromOSM, addressFromGeoPtApi)
        getAuthoritiesFromAddress(addressFromOSM, addressFromGeoPtApi)
      }
    }).finally(() => {
      app.form.stopSpinner()
    })
  }

  function getAuthoritiesFromAddress (addressFromOSM, addressFromGeoPtApi) {
    thisModule.AUTHORITIES = []

    // array of possible names for the locale, for example ["Lisboa", "Odivelas"]
    // to be used for searching possible corresponding authorities
    let geoNames = []

    if (addressFromGeoPtApi) {
      if (addressFromGeoPtApi.freguesia) {
        geoNames.push(addressFromGeoPtApi.freguesia)
      }
      if (addressFromGeoPtApi.concelho) {
        geoNames.push(addressFromGeoPtApi.concelho)
      }
      if (addressFromGeoPtApi.distrito) {
        geoNames.push(addressFromGeoPtApi.distrito)
      }
    }

    if (addressFromOSM) {
      if (addressFromOSM.road) {
        $('#street').val(addressFromOSM.road) // nome da rua/avenida/etc.
      }

      if (addressFromOSM.house_number) {
        $('#street_number').val(addressFromOSM.house_number)
      }

      // get relevant address details to find police authority
      // see: https://nominatim.org/release-docs/latest/api/Output/#addressdetails
      const relevantAddressDetails = [
        'state_district', 'county',
        'municipality', 'city', 'town', 'village',
        'city_district', 'district', 'borough', 'suburb', 'subdivision'
      ]

      for (let i = 0; i < relevantAddressDetails.length; i++) {
        if (addressFromOSM[relevantAddressDetails[i]]) {
          geoNames.push(addressFromOSM[relevantAddressDetails[i]])
        }
      }

      // from the Postal Code got from OMS
      // tries to get locality using the offline Data Base (see file contacts.js)
      let localityFromDB, municipalityFromDB
      if (addressFromOSM.postcode) {
        const dataFromDB = getDataFromPostalCode(addressFromOSM.postcode)

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

      // #municipality makes reference to municipality (concelho)
      if (addressFromGeoPtApi && addressFromGeoPtApi.concelho) {
        if (addressFromGeoPtApi.freguesia) {
          $('#locality').val(addressFromGeoPtApi.freguesia)
        } else {
          $('#locality').val(addressFromGeoPtApi.concelho)
        }
        $('#municipality').val(addressFromGeoPtApi.concelho)
      } else if (addressFromOSM.municipality) {
        $('#locality').val(addressFromOSM.municipality)
        $('#municipality').val(addressFromOSM.municipality)
      } else if (municipalityFromDB) {
        if (localityFromDB) {
          $('#locality').val(localityFromDB)
        } else {
          $('#locality').val(municipalityFromDB)
        }
        $('#municipality').val(municipalityFromDB)
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

    const PSPGeral = {
      authority: 'Polícia',
      authorityShort: 'Polícia de Segurança Pública',
      nome: 'Geral',
      contacto: 'contacto@psp.pt'
    }
    const GNRGeral = {
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
      $('#authority').append(
        `<option label="${value.authorityShort + ' - ' + value.nome}" value="${index}">` +
          `${value.authorityShort + ' - ' + value.nome}` +
        '</option>'
      )
      if (app.functions.isThis_iOS()) {
        $('#authority').append('<optgroup label=""></optgroup>')
      }
    })
  }

  // GPS/Google Postal Code -> Localities.postalCode -> Localities.municipality ->  Municipalities.code -> Municipalities.name -> PM_Contacts.nome
  function getDataFromPostalCode (postalCode) {
    let toReturn

    postalCode = postalCode.substring(0, 4) // gets first 4 characters
    if (postalCode.length !== 4) {
      toReturn = {
        locality: '',
        municipality: ''
      }
      return toReturn
    }

    console.log('getDataFromPostalCode: ' + postalCode, typeof postalCode)

    let key, locality, municipality, municipalityCode

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
      $('#municipality').addClass('loading')
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
      $('#municipality').removeClass('loading')
      $('#municipality').trigger('input')
    }
  }

  // converts latitude, longitude coordinates from Degrees Minutes Second (DMS) to Decimal Degrees (DD)
  // the input string of the DMS is on the format "52/1,0/1,376693/10000"
  function convertDMSStringInfoToDD (gpsString, direction) {
    let i, temp
    const values = []

    const gpsArray = gpsString.split(',')

    for (i = 0; i < gpsArray.length; i++) {
      // if the value is presented in ratio, example "376693/10000"
      temp = gpsArray[i].split('/')
      if (temp[1]) {
        values[i] = parseFloat(temp[0]) / parseFloat(temp[1])
      } else {
        values[i] = parseFloat(gpsArray[i])
      }
    }

    const deg = values[0]
    const min = values[1]
    const sec = values[2]

    let dd = deg + min / 60 + sec / (60 * 60)

    if (direction === 'S' || direction === 'W') {
      dd = dd * -1
    } // Don't do anything for N or E
    return dd
  }

  /* === Public methods to be returned === */
  thisModule.loadMapsApi = loadMapsApi
  thisModule.getGeolocation = getGeolocation
  thisModule.setCoordinates = setCoordinates
  thisModule.getCoordinates = getCoordinates
  thisModule.getAuthoritiesFromAddress = getAuthoritiesFromAddress
  thisModule.convertDMSStringInfoToDD = convertDMSStringInfoToDD

  return thisModule
})(app.localization || {})
