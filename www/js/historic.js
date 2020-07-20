/******************************************************************/
/* When the user clicks on the Historic section on the left panel
   the user should see a historic of complains previously submitted
   These complaints are anonymously stored in the database        */

/* eslint camelcase: off */
/* global app, $, device */

app.historic = (function (thisModule) {
  const requestHistoricUrl = 'https://contabo.joaopimentel.com/passeio_livre/serverapp_get_historic'
  const requestImageUrl = 'https://contabo.joaopimentel.com/passeio_livre/image_server/'

  function updateHistoric () {
    const uuid = device.uuid

    console.log('Fetching historic with uuid ' + uuid)
    $.ajax({
      url: requestHistoricUrl,
      type: 'GET',
      data: { uuid: uuid },
      crossDomain: true,
      success: function (data) {
        console.log('Historic obtained from database with success. Returned: ', data)
        var data1 = removesDuplicates(data)
        insertFetchedDataIntoHistoric(data1)
      },
      error: function (error) {
        console.error('There was an error getting the historic for the following uuid: ' + uuid)
        console.error(error)
      }
    })
  }

  function removesDuplicates (data) {
    if (data.length <= 1) {
      return
    }

    const timeIntervalInMinutes = 10
    // entries submitted around the same time (within the timeIntervalInMinutes),
    // for the same vehicle, having the same type of traffic violation
    // and sent to the same authority are considered to be duplicates

    var i = 1
    while (data[i]) {
      // previous entry
      const previousPlate = data[i - 1].carro_matricula
      const previousDate = getFullDateObjFromDB(data[i - 1])
      const previousAuthority = data[i - 1].autoridade
      const previousViolationType = data[i - 1].base_legal
      // current entry
      const currentPlate = data[i].carro_matricula
      const currentDate = getFullDateObjFromDB(data[i])
      const currentAuthority = data[i].autoridade
      const currentViolationType = data[i].base_legal

      if (Math.abs((currentDate - previousDate) / 1000 / 60) < timeIntervalInMinutes &&
          currentPlate === previousPlate && previousAuthority === currentAuthority &&
          previousViolationType === currentViolationType) { // it is a duplicate
        data.splice(i - 1, 1) // removes index i-1 and reindexes the array, thus no need to i++
      } else {
        i++
      }
    }

    return data
  }

  function getFullDateObjFromDB (dbEntry) {
    var fullDate = new Date(dbEntry.data_data)
    fullDate.setHours(dbEntry.data_hora.slice(0, 2))
    fullDate.setMinutes(dbEntry.data_hora.slice(3, 5))
    return fullDate
  }

  function insertFetchedDataIntoHistoric (data) {
    // resets and cleans <div id="historic">
    $('#historic').find('*').off() // removes all event handlers
    $('#historic').empty()

    $('#historic').append(`
      <h4>Histórico de ocorrências</h4>
      <span class="note">Pressione nas ocorrências para ver as imagens</span>
    `)

    for (var i = 0; i < data.length; i++) {
      const el = data[i]
      $('#historic').append(`
        <div class="row border-element historic_element" data-index="${i}">
          <div class="col-xs-2 col-sm-2 form-group">
            ${el.carro_marca} ${el.carro_modelo} na ${el.data_local} n. ${el.data_num_porta}, ${el.data_concelho},
            no dia ${(new Date(el.data_data)).toLocaleDateString('pt-PT')} às ${el.data_hora.slice(0, 5)}
          </div>
          <div class="col-xs-2 col-sm-2 form-group">
            Matrícula: ${el.carro_matricula}<br>
            Infração: ${app.penalties.getShortDescription(el.base_legal)}<br>
            Autoridade: ${el.autoridade}
          </div>
        </div>`
      )
    }

    // shows or hides photos when the div historic entry is clicked
    $('#historic .historic_element').click(function () {
      const i = parseInt($(this).data('index'))

      if ($(this).find('img').length === 0) { // no image found, adds images
        const $photos = $('<div class="historic_photos"></div>')
        $(this).append($photos)

        // DB has 4 fields for images for the same DB entry: foto1, foto2, foto3 and foto4
        for (var photoIndex = 1; photoIndex <= 4; photoIndex++) {
          if (data[i]['foto' + photoIndex]) { // if that photo index exists in the DB entry
            const fullImgUrl = requestImageUrl + data[i]['foto' + photoIndex]
            // check if the image really exists
            $.get(fullImgUrl).done(() => {
              $photos.append(`<img src="${fullImgUrl}">`)
            })
          }
        }
      } else { // has already images, remove them
        $(this).find('.historic_photos').remove()
      }
    })
  }

  thisModule.updateHistoric = updateHistoric

  return thisModule
})(app.historic || {})
