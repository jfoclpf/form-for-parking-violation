/******************************************************************/
/* When the user clicks on the Historic section on the left panel
   the user should see a historic of complaints previously submitted
   These complaints are anonymously stored in the database        */

/* eslint camelcase: off */
/* global app, $, device, cordova */

app.historic = (function (thisModule) {
  const requestHistoricUrl = app.main.urls.databaseServer.requestHistoric
  const requestImageUrl = app.main.urls.databaseServer.requestImage

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
        insertFetchedDataIntoHistoric(data)
      },
      error: function (error) {
        console.error('There was an error getting the historic for the following uuid: ' + uuid)
        console.error(error)
      }
    })
  }

  function requestNumberOfHistoricOccurrences (callback) {
    const uuid = device.uuid

    console.log('Fetching historic with uuid ' + uuid)
    $.ajax({
      url: requestHistoricUrl,
      type: 'GET',
      data: { uuid: uuid },
      crossDomain: true,
      success: function (data) {
        console.log('Historic obtained from database with success. Returned: ', data)
        callback(null, data.length)
      },
      error: function (error) {
        console.error('There was an error getting the historic for the following uuid: ' + uuid)
        console.error(error)
        callback(error)
      }
    })
  }

  function insertFetchedDataIntoHistoric (data) {
    // resets and cleans <div id="historic">
    $('#historic').find('*').off() // removes all event handlers
    $('#historic').empty()

    if (data.length === 0) {
      $('#historic').append('<center>Sem resultados</center>')
      return
    }

    $('#historic').append(`
      <h4>Histórico de ocorrências</h4>
      <span class="note">Pressione nas ocorrências para ver as imagens</span>
    `)

    // since the results are stored as they are submitted, they are ordered by time
    // we want to show on top the most recent ones, i.e., the last on the array
    for (var i = data.length - 1; i >= 0; i--) {
      const el = data[i]
      $('#historic').append(`
        <div class="p-3 border-element historic_element" data-index="${i}">
          <div class="row">
            <div class="col-9">
              ${el.carro_marca} ${el.carro_modelo} na ${el.data_local} n. ${el.data_num_porta}, ${el.data_concelho},
              no dia ${(new Date(el.data_data)).toLocaleDateString('pt-PT')} às ${el.data_hora.slice(0, 5)}
            </div>
            <div class="col">
              <button class="btn btn-primary btn-sm m-1 history-refresh-button" data-index="${i}"><i class="fa fa-refresh"></i></button>
              <button class="btn btn-primary btn-sm m-1 history-check-button" data-index="${i}"><i class="fa fa-check"></i></button>
            </div>
          </div>
          <div>
            Matrícula: ${el.carro_matricula}<br>
            Infração: ${app.penalties.getShortDescription(el.base_legal)}<br>
            Autoridade: ${el.autoridade}
          </div>
        </div>`
      )
    }

    // deals with button to send refresh message
    $('#historic .history-refresh-button').click(function (event) {
      event.stopPropagation()
      const i = parseInt($(this).data('index'))
      $.jAlert({
        theme: 'dark_blue',
        class: 'ja_300px',
        content: 'Deseja enviar um lembrete à autoridade respetiva a propósito desta ocurrência?',
        btns: [
          {
            text: 'Sim',
            theme: 'green',
            class: 'ja_button_with_icon',
            onClick: function () {
              sendReminderEmail(data[i])
            }
          },
          {
            text: 'Não',
            theme: 'green',
            class: 'ja_button_with_icon'
          }
        ]
      })
    })

    // deals with button to set status as processed
    $('#historic .history-check-button').click(function (event) {
      event.stopPropagation()

      const $thisButton = $(this)

      if ($thisButton.hasClass('btn-primary')) {
        $.jAlert({
          theme: 'dark_blue',
          class: 'ja_300px',
          content: 'Deseja colocar esta denúncia como tratada e resolvida?',
          btns: [
            {
              text: 'Sim',
              theme: 'green',
              class: 'ja_button_with_icon',
              onClick: function () {
                $thisButton.siblings('.history-refresh-button').hide()
                $thisButton.removeClass('btn-primary').addClass('btn-success')
              }
            },
            {
              text: 'Não',
              theme: 'green',
              class: 'ja_button_with_icon'
            }
          ]
        })
      } else if ($thisButton.hasClass('btn-success')) {
        $.jAlert({
          theme: 'dark_blue',
          class: 'ja_300px',
          content: 'Deseja remarcar esta denúncia como não tratada e não resolvida?',
          btns: [
            {
              text: 'Sim',
              theme: 'green',
              class: 'ja_button_with_icon',
              onClick: function () {
                $thisButton.siblings('.history-refresh-button').show()
                $thisButton.removeClass('btn-success').addClass('btn-primary')
              }
            },
            {
              text: 'Não',
              theme: 'green',
              class: 'ja_button_with_icon'
            }
          ]
        })
      } else {
        console.error('Error dealing with button', $thisButton)
      }
    })

    // shows or hides photos when the div historic entry is clicked
    $('#historic .historic_element').click(function () {
      const i = parseInt($(this).data('index'))

      if ($(this).find('img').length === 0) { // no image found, adds images
        const $photos = $('<div class="historic_photos"></div>')
        $(this).append($photos)

        // DB has 4 fields for images for the same DB entry: foto1, foto2, foto3 and foto4
        for (var photoIndex = 1; photoIndex <= 4; photoIndex++) {
          if (data[i]['foto' + photoIndex]) { // if that photo index exists in the DB entry
            const fullImgUrl = requestImageUrl + '/' + data[i]['foto' + photoIndex]
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

  function sendReminderEmail (occurrence) {
    // download images from server to cache to attach them in email
    // DB has 4 fields for images for the same DB entry: foto1, foto2, foto3 and foto4
    var photosDeferred = []
    console.log('start sendReminderEmail')
    var downloadFileToDevice = function (photoIndex, fullImgUrl, fileName) {
      // externalCacheDirectory ("file:///storage/emulated/0/Android/data/com.form.parking.violation/cache/") is indeed normally internal memory,
      // see https://www.reddit.com/r/Android/comments/496sn3/lets_clear_up_the_confusion_regarding_storage_in/
      app.functions.downloadFileToDevice(fullImgUrl, fileName, cordova.file.externalCacheDirectory,
        (err, localFileName) => {
          if (err) {
            photosDeferred[photoIndex].resolve(null)
          } else {
            photosDeferred[photoIndex].resolve(localFileName)
          }
        })
    }

    for (var photoIndex = 1; photoIndex <= 4; photoIndex++) {
      if (occurrence['foto' + photoIndex]) { // if that photo index exists in the DB entry
        const fileName = occurrence['foto' + photoIndex]
        const fileExtension = fileName.split('.').pop()
        const fullImgUrl = requestImageUrl + '/' + fileName

        photosDeferred[photoIndex] = $.Deferred()
        downloadFileToDevice(photoIndex, fullImgUrl, `img${photoIndex}.${fileExtension}`)
      }
    }

    $.when(...photosDeferred).done(function (/* arguments array */) {
      var attachments = []
      for (let i = 0; i < arguments.length; i++) {
        if (arguments[i]) {
          attachments.push(arguments[i])
        }
      }
      console.log(JSON.stringify(attachments, 0, 3))

      var emailSubject = `[${occurrence.carro_matricula}] na ${occurrence.data_local}, ${occurrence.data_concelho} - Inquirição sobre estado processual da denúncia de estacionamento anteriormente efetuada`

      cordova.plugins.email.open({
        to: app.contactsFunctions.getEmailByFullName(occurrence.autoridade),
        attachments: attachments, // file paths or base64 data streams
        subject: emailSubject, // subject of the email
        body: app.text.getReminderMessage(occurrence), // email body (for HTML, set isHtml to true)
        isHtml: true // indicats if the body is HTML or plain text
      })
    })
  }

  thisModule.updateHistoric = updateHistoric
  thisModule.requestNumberOfHistoricOccurrences = requestNumberOfHistoricOccurrences

  return thisModule
})(app.historic || {})
