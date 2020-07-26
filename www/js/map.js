/***********************************************************************/
/* When the user clicks on the Map section on the left panel, the user
   should see a map of all complaints previously submitted by all users
   These complaints are anonymously stored in the database             */

/* eslint camelcase: off */
/* global app, $, google, DEBUG */

app.map = (function (thisModule) {
  const requestHistoricUrl = 'https://contabo.joaopimentel.com/passeio_livre/serverapp_get_historic'
  const requestImageUrl = 'https://contabo.joaopimentel.com/passeio_livre/image_server/'
  var isGoogleMapsApiLoaded = false

  var allDbEntries

  // this funcion is run when the API is loaded, see file js/localization.js
  function initGoogleMapLoaded () {
    isGoogleMapsApiLoaded = true
  }

  // does not show map until the Google API script and the DB entries are loaded
  function tryToShowMap () {
    if (!isGoogleMapsApiLoaded || !allDbEntries) {
      setTimeout(() => {
        if (isGoogleMapsApiLoaded && allDbEntries) {
          showMap()
        } else {
          tryToShowMap()
        }
      }, 500)
    } else {
      showMap()
    }
  }

  function showMap () {
    // adjust height
    $('#map_section').css('height', '100%')

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
      zoom: 8,
      disableDefaultUI: true,
      streetViewControl: false,
      gestureHandling: 'greedy'
    }

    const map = new google.maps.Map(document.getElementById('map'), mapOptions)
    // Add the markers and infowindows to the map
    for (var i = 0; i < allDbEntries.length; i++) {
      const el = allDbEntries[i]
      const marker = new google.maps.Marker({
        position: { lat: el.data_coord_latit, lng: el.data_coord_long },
        map: map,
        title: el.carro_marca + ' ' + el.carro_modelo
      })

      var htmlInfoContent = `
        <div style="width:200px">
          ${el.carro_marca} ${el.carro_modelo} [${el.carro_matricula}]<br>
          Infração: ${app.penalties.getShortDescription(el.base_legal)}<br>
          Autoridade: ${el.autoridade}<br>`

      for (var photoIndex = 1; photoIndex <= 4; photoIndex++) {
        if (el['foto' + photoIndex]) {
          htmlInfoContent += `<img width="200" src="${requestImageUrl + el['foto' + photoIndex]}"><br>`
        }
      }

      htmlInfoContent += '</div>'

      const infowindow = new google.maps.InfoWindow({
        content: htmlInfoContent
      })

      marker.addListener('click', (e) => {
        if (e.cancelable) {
          e.preventDefault()
        }
        infowindow.open(map, marker)
        return true
      })
    }
  }

  function getAllEntries () {
    $.ajax({
      url: requestHistoricUrl,
      type: 'GET',
      data: { uuid: null }, // because uuid is null, it gets all entries with PROD=1
      crossDomain: true,
      success: function (data) {
        console.log('Data for map obtained from database with success. Returned: ', data)
        allDbEntries = app.historic.removesDuplicates(data)
      },
      error: function (error) {
        console.error('There was an error getting the data')
        console.error(error)
      }
    })
  }

  thisModule.tryToShowMap = tryToShowMap
  thisModule.initGoogleMapLoaded = initGoogleMapLoaded
  thisModule.getAllEntries = getAllEntries

  return thisModule
})(app.map || {})
