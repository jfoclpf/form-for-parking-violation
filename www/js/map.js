/***********************************************************************/
/* When the user clicks on the Map section on the left panel, the user
   should see a map of all complaints previously submitted by all users
   These complaints are anonymously stored in the database             */

/* eslint camelcase: off */
/* global app, device, $, google, DEBUG */

app.map = (function (thisModule) {
  const requestHistoricUrl = 'https://contabo.joaopimentel.com/passeio_livre/serverapp_get_historic'
  const requestImageUrl = 'https://contabo.joaopimentel.com/passeio_livre/image_server/'
  var isGoogleMapsApiLoaded = false

  var allDbEntries

  function init () {
    // to get all entries to show on the map, it does it in the init in the background
    // after opening the app for faster processing when user clicks on map section
    getAllEntries()

    // populate select box to select map view, i.e, filter ocurrences/drops in the map
    var mapOptions = {
      all: 'Todas as ocorrências',
      mine: 'Apenas as minhas denúncias'
    }

    for (const key in mapOptions) {
      $('#map_view_select').append(`<option value="${key}">${mapOptions[key]}</option>`)
    }

    // populates yet with type of penalties: faixa_bus, baixa_bus, etc.
    const penalties = app.penalties.getPenalties()
    for (const key in penalties) {
      $('#map_view_select').append(`<option value="${key}">${penalties[key].select}</option>`)
    }

    $('#map_view_select').on('change', function () {
      tryToShowMap(this.value)
    })
  }

  // this funcion is run when the API is loaded, see file js/localization.js
  function initGoogleMapLoaded () {
    isGoogleMapsApiLoaded = true
  }

  // does not show map until the Google API script and the DB entries are loaded
  // this done on the beginning
  function tryToShowMap (selectOption) {
    if (!isGoogleMapsApiLoaded || !allDbEntries) {
      setTimeout(() => {
        if (isGoogleMapsApiLoaded && allDbEntries) {
          showMap(selectOption)
        } else {
          tryToShowMap(selectOption)
        }
      }, 500)
    } else {
      showMap(selectOption)
    }
  }

  // selectOption can be: 'all', 'mine' or the respective legal basis ('passeios', 'na_passadeira', etc.)
  function showMap (selectOption) {
    // get coordinates for the map center
    var currentLocation = app.localization.getCoordinates() // current posiiton of user
    var latitude, longitude
    if (currentLocation.latitude && currentLocation.longitude && !DEBUG) {
      latitude = currentLocation.latitude
      longitude = currentLocation.longitude
    } else {
      // coordinates of Lisbon
      latitude = 38.736946
      longitude = -9.142685
    }

    const mapOptions = {
      center: { lat: latitude, lng: longitude },
      disableDefaultUI: true,
      streetViewControl: false,
      gestureHandling: 'greedy',
      zoom: 8,
      restriction: {
        latLngBounds: {
          east: -6,
          north: 44,
          south: 34,
          west: -10
        },
        strictBounds: true
      }
    }

    const map = new google.maps.Map(document.getElementById('map'), mapOptions)
    const infowindow = new google.maps.InfoWindow()
    var htmlInfoContent = []

    // get filtered array of db entries according to selected Option (filter)
    var dbEntries = []
    if (!selectOption || selectOption === 'all') {
      dbEntries = allDbEntries
    } else {
      const allDbEntriesLength = allDbEntries.length
      for (let i = 0; i < allDbEntriesLength; i++) {
        const el = allDbEntries[i]

        if (selectOption === 'mine' && el.uuid === device.uuid) {
          dbEntries.push(el)
        } else if (selectOption === el.base_legal) {
          dbEntries.push(el)
        }
      }
    }

    // Add the markers and infowindows to the map
    const dbEntriesLength = dbEntries.length
    for (let i = 0; i < dbEntriesLength; i++) {
      const el = dbEntries[i]

      const marker = new google.maps.Marker({
        position: { lat: el.data_coord_latit, lng: el.data_coord_long },
        map: map,
        title: el.carro_marca + ' ' + el.carro_modelo
      })

      htmlInfoContent[i] = `
        <div style="width:200px">
          ${el.carro_marca} ${el.carro_modelo} na ${el.data_local} n. ${el.data_num_porta}, ${el.data_concelho},
          no dia ${(new Date(el.data_data)).toLocaleDateString('pt-PT')} às ${el.data_hora.slice(0, 5)}<br>
          Matrícula: ${el.carro_matricula}<br>
          Infração: ${app.penalties.getShortDescription(el.base_legal)}<br>
          Autoridade: ${el.autoridade}<br><br>`

      for (var photoIndex = 1; photoIndex <= 4; photoIndex++) {
        if (el['foto' + photoIndex]) {
          const photoUrl = requestImageUrl + el['foto' + photoIndex]
          htmlInfoContent[i] += `<img width="200" src="${photoUrl}"><br>`
        }
      }

      htmlInfoContent[i] += '</div>'

      google.maps.event.addListener(marker, 'click', (function (_marker, _i) {
        return function () {
          infowindow.setContent(htmlInfoContent[_i])
          infowindow.open(map, _marker)
        }
      })(marker, i))
    }

    // when map is loaded
    map.addListener('tilesloaded', function () {
      // adjust height of map_section div, the heigh of map should be the height of content
      // minus the height of header and minus height of a spacer (<hr>)
      var height = window.innerHeight - // screen useful height
        $('#content hr').outerHeight(true) - // spacer between header and lower section
        $('#content .container-fluid.section-head.d-flex.flex-row').outerHeight(true) - // header
        ($('#content').innerWidth() - $('#content').width()) // pading of #content

      $('#map_section').css('height', height + 'px')
    })
  }

  function getAllEntries () {
    $.ajax({
      url: requestHistoricUrl,
      type: 'GET',
      data: { uuid: null }, // because uuid is null, it gets all entries with PROD=1
      crossDomain: true,
      success: function (data) {
        console.log('Data for map obtained from database with success. Returned: ', data)
        allDbEntries = data
      },
      error: function (error) {
        console.error('There was an error getting the data')
        console.error(error)
      }
    })
  }

  thisModule.init = init
  thisModule.tryToShowMap = tryToShowMap
  thisModule.initGoogleMapLoaded = initGoogleMapLoaded

  return thisModule
})(app.map || {})
