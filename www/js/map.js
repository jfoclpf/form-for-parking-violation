/***********************************************************************/
/* When the user clicks on the Map section on the left panel, the user
   should see a map of all complaints previously submitted by all users
   These complaints are anonymously stored in the database             */

/* eslint camelcase: off */
/* global app, device, cordova, $, performance, L, DEBUG */

app.map = (function (thisModule) {
  const requestHistoricUrl = app.main.urls.databaseServer.requestHistoric
  const requestImageUrl = app.main.urls.databaseServer.requestImage

  var map
  var allDbEntries // all entries fetched from database
  var dbEntries // entries filtered according to user selection

  // to measure performance
  var tLoadMapInit
  var tLoadMapEnd

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

  // does not show map until the DB entries are loaded
  function tryToShowMap (selectOption) {
    if (!allDbEntries) {
      setTimeout(() => {
        if (allDbEntries) {
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
    // to check the time it takes to load map
    tLoadMapInit = performance.now()
    tLoadMapEnd = null

    // get filtered array of db entries according to selected Option (filter)
    dbEntries = []
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

    // get coordinates for the map center
    var currentLocation = app.localization.getCoordinates() // current position of user
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
      center: [latitude, longitude],
      zoom: 8,
      maxBounds: L.latLngBounds(L.latLng(43.882057, -11.030141), L.latLng(35.942436, -4.104133)),
      zoomControl: false
    }

    // initialize Leaflet
    if (map) {
      map.off()
      map.remove()
    }
    map = L.map('map', mapOptions)

    // add the OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      minZoom: 6,
      subdomains: ['a', 'b', 'c']
    }).addTo(map)

    setInterval(function () {
      map.invalidateSize()
    }, 500)

    // Add the markers and infowindows to the map
    const isCurrentUserAnAdmin = app.functions.isCurrentUserAnAdmin()
    const dbEntriesLength = dbEntries.length
    const mapIcon = L.icon({ iconUrl: cordova.file.applicationDirectory + 'www/img/map_icon.png' })

    var markerArray = []
    for (let i = 0; i < dbEntriesLength; i++) {
      const el = dbEntries[i]

      const marker = L.marker(
        [el.data_coord_latit, el.data_coord_long],
        { icon: mapIcon }
      )

      let htmlInfoContent =
        '<div style="width:200px">' +
          `<b>Veículo</b>: ${el.carro_marca} ${el.carro_modelo} <span style="white-space: nowrap;">[${el.carro_matricula}]</span><br>` +
          `<b>Local</b>: ${el.data_local} n. ${el.data_num_porta}, ${el.data_concelho}<br>` +
          `<b>Data</b>: ${(new Date(el.data_data)).toLocaleDateString('pt-PT')} às ${el.data_hora.slice(0, 5)}<br>` +
          `<b>Infração</b>: ${app.penalties.getShortDescription(el.base_legal)}<br>` +
          `<b>Autoridade</b>: ${el.autoridade}<br><br>`

      for (var photoIndex = 1; photoIndex <= 4; photoIndex++) {
        if (el['foto' + photoIndex]) {
          const photoUrl = requestImageUrl + '/' + el['foto' + photoIndex]
          htmlInfoContent += `<img width="200" src="${photoUrl}"><br>`
        }
      }

      htmlInfoContent += '</div>'

      // an admin is able to mark an entry in the db as deleted
      if (isCurrentUserAnAdmin) {
        htmlInfoContent += '<hr><b>Opções de administrador:</b><br><br>' +
          `<button type="button" class="btn btn-primary btn-sm m-1" onclick="app.map.setEntryAsDeletedInDatabase(${i})"><i class="fa fa-trash"></i></button>`
      }

      marker.bindPopup(htmlInfoContent)
      markerArray.push(marker)
    }

    var group = L.featureGroup(markerArray).addTo(map)
    map.fitBounds(group.getBounds())

    // when map is loaded
    map.whenReady(function () {
      if (!tLoadMapEnd) {
        tLoadMapEnd = performance.now()
        console.log('Loading map took ' + Math.round(tLoadMapEnd - tLoadMapInit) + ' milliseconds')
      }
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
    // because there's parameter uuid, it gets all entries with PROD=1
    $.ajax({
      url: requestHistoricUrl,
      type: 'GET',
      crossDomain: true,
      success: function (data) {
        if (data && data.length) {
          console.log('Data for map obtained from database with success. Returned: ', data)
          allDbEntries = data
        } else {
          console.error('There was an error getting the data, data fetched but is empty')
        }
      },
      error: function (error) {
        console.error('There was an error getting all the entries')
        console.error(error)
      }
    })
  }

  function setEntryAsDeletedInDatabase (i) {
    if (app.functions.isCurrentUserAnAdmin()) {
      app.dbServerLink.setEntryAsDeletedInDatabase(dbEntries[i], (err) => {
        if (!err) {
          window.alert('Entrada marcada como apagada')
        } else {
          window.alert('Erro a tentar marcar entrada como apagada\n\n' + JSON.stringify(err, {}, 2))
        }
      })
    }
  }

  thisModule.init = init
  thisModule.tryToShowMap = tryToShowMap
  thisModule.setEntryAsDeletedInDatabase = setEntryAsDeletedInDatabase

  return thisModule
})(app.map || {})
