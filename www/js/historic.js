/******************************************************************/
/* When the user clicks on the Historic section on the left panel
   the user should see a historic of complaints previously submitted
   These complaints are anonymously stored in the database        */

/* eslint camelcase: off */
/* global app, $, device, cordova */

app.historic = (function (thisModule) {
  const requestHistoricUrl = app.main.urls.databaseServer.requestHistoric
  const requestImageUrl = app.main.urls.databaseServer.requestImage

  let historicData

  function updateHistoric () {
    const uuid = device.uuid
    setLoadingIcon()

    console.log('Fetching historic with uuid ' + uuid)
    $.ajax({
      url: requestHistoricUrl,
      type: 'GET',
      data: { uuid },
      crossDomain: true,
      headers: app.dbServerLink.getAjaxHttpHeaderKeys(),
      success: function (data) {
        console.log('Returned: ', data)
        if (data) {
          console.success('Historic obtained from database with success.')
          historicData = data
          insertFetchedDataIntoHistoric()
        }
      },
      error: function (error) {
        console.error('There was an error getting the historic for the following uuid: ' + uuid)
        console.error(error)
        InternetError()
      }
    })
  }

  function requestNumberOfHistoricOccurrences (callback) {
    const uuid = device.uuid

    console.log('Fetching historic with uuid ' + uuid)
    $.ajax({
      url: requestHistoricUrl,
      type: 'GET',
      data: { uuid },
      crossDomain: true,
      headers: app.dbServerLink.getAjaxHttpHeaderKeys(),
      success: function (data) {
        console.log('Returned: ', data)
        if (data) {
          console.success('Historic obtained from database with success.')
          callback(null, data.length)
        } else {
          callback(Error('Empty historic data'))
        }
      },
      error: function (error) {
        console.error('There was an error getting the historic for the following uuid: ' + uuid)
        console.error(error)
        InternetError()
        callback(error)
      }
    })
  }

  function InternetError () {
    $.jAlert({
      title: 'Erro na obtenção do histórico!',
      theme: 'red',
      content: 'Confirme se tem acesso à Internet. Poderá também ser uma anomalia com o servidor desta APP.'
    })
  }

  // empties the historic div and replaces with a loading gif
  function setLoadingIcon () {
    $('#historic').empty().append($('<div></div>').addClass('historic-loading'))
  }

  function insertFetchedDataIntoHistoric () {
    // resets and cleans <div id="historic">
    $('#historic').find('*').off() // removes all event handlers
    $('#historic').empty()

    if (historicData.length === 0) {
      $('#historic').append('<center>Sem resultados</center>')
      return
    }

    $('#historic').append('<ul class="list-group list-group-flush"></ul>')

    // since the results are stored as they are submitted, they are ordered by time
    // we want to show on top the most recent ones, i.e., the last on the array
    for (let i = historicData.length - 1; i >= 0; i--) {
      const el = historicData[i]
      let elHtmlToAppend =
       `<div class="list-group-item historic_element" data-index="${i}">
          <div class="row">
            <div class="col-9">
              ${el.carro_marca} ${el.carro_modelo} <span style="white-space: nowrap;">[${el.carro_matricula}]</span><br>
              ${el.data_local} n. ${el.data_num_porta}, ${el.data_concelho};<br>
              ${(new Date(el.data_data)).toLocaleDateString('pt-PT')} às ${el.data_hora.slice(0, 5)}<br>
              ${app.penalties.getData(el.base_legal, 'shortDescription')}
            </div>
            <div class="col">
              <button aria-label="Reenviar ocorrência" class="btn btn-primary btn-sm m-1 history-refresh-button" data-index="${i}"><i class="fa fa-refresh"></i></button>
              <button aria-label="Marcar ocorrência como tratada" class="btn btn-primary btn-sm m-1 history-check-button" data-index="${i}"><i class="fa fa-check"></i></button>
              <button aria-label="Apagar ocorrência" class="btn btn-danger btn-sm m-1 history-delete-button" data-index="${i}"><i class="fa fa-trash"></i></button>
            </div>
          </div>
          <div class="row">
            <div class="col-12">
              ${el.autoridade}
            </div>
          </div>
          <div class="mt-2">`

      // DB has 4 fields for images for the same DB entry: foto1, foto2, foto3 and foto4
      for (let photoIndex = 1; photoIndex <= 4; photoIndex++) {
        if (historicData[i]['foto' + photoIndex]) { // if that photo index exists in the DB entry
          const fullImgUrl = requestImageUrl + '/' + historicData[i]['foto' + photoIndex]
          elHtmlToAppend += `<img src="${fullImgUrl}">`
        }
      }

      elHtmlToAppend += '</div>'

      $('#historic .list-group').append(elHtmlToAppend)

      if (historicData[i].processada_por_autoridade) {
        $(`#historic button[data-index="${i}"].history-refresh-button`).hide()
        $(`#historic button[data-index="${i}"].history-check-button`).removeClass('btn-primary').addClass('btn-success')
      }
    }

    // deals with button to send refresh message
    $('#historic .history-refresh-button').on('click', function (event) {
      event.stopPropagation()
      const i = parseInt($(this).data('index'))
      $.jAlert({
        theme: 'dark_blue',
        class: 'ja_300px',
        closeBtn: false,
        content: 'Deseja enviar um lembrete à autoridade respetiva a propósito desta denúncia?',
        btns: [
          {
            text: 'Sim',
            theme: 'green',
            class: 'ja_button_with_icon',
            onClick: function () {
              sendReminderEmail(historicData[i])
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

    // deals with button to set status as processed or not processed
    $('#historic .history-check-button').on('click', function (event) {
      event.stopPropagation()

      const $thisButton = $(this)
      const i = parseInt($(this).data('index'))

      if ($thisButton.hasClass('btn-primary')) {
        $.jAlert({
          theme: 'dark_blue',
          class: 'ja_300px',
          closeBtn: false,
          content: 'Deseja colocar esta denúncia como tratada e resolvida?',
          btns: [
            {
              text: 'Sim',
              theme: 'green',
              class: 'ja_button_with_icon',
              onClick: function () {
                $thisButton.siblings('.history-refresh-button').hide()
                $thisButton.removeClass('btn-primary').addClass('btn-success')
                app.dbServerLink.setProcessedByAuthorityStatus(historicData[i], true)
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
          closeBtn: false,
          content: 'Deseja remarcar esta denúncia como não tratada e não resolvida?',
          btns: [
            {
              text: 'Sim',
              theme: 'green',
              class: 'ja_button_with_icon',
              onClick: function () {
                $thisButton.siblings('.history-refresh-button').show()
                $thisButton.removeClass('btn-success').addClass('btn-primary')
                app.dbServerLink.setProcessedByAuthorityStatus(historicData[i], false)
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

    // deals with button to delete entry
    $('#historic .history-delete-button').on('click', function (event) {
      event.stopPropagation()
      const i = parseInt($(this).data('index'))

      $.jAlert({
        theme: 'dark_blue',
        class: 'ja_300px',
        closeBtn: false,
        content: 'Deseja apagar esta denúncia?',
        btns: [
          {
            text: 'Sim',
            theme: 'red',
            class: 'ja_button_with_icon',
            onClick: function () {
              app.dbServerLink.setEntryInDbAsDeleted(historicData[i], 'user', (err) => {
                if (!err) {
                  console.success('Entry deleted by user')
                  updateHistoric()
                } else {
                  console.error('Error trying to delete entry by user\n\n' + JSON.stringify(err, {}, 2))
                }
              })
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
  }

  function sendReminderEmail (occurrence) {
    app.file.getFileContent(cordova.file.applicationDirectory + 'www/css/res/images/loading.gif', 'dataURL',
      (err, dataUrlIcon) => {
        if (err) {
          console.error('Error fetching GIF www/css/res/images/loading.gif', err)
          dataUrlIcon = ''
        }

        const progressAlert = $.jAlert({
          class: 'ja_300px',
          closeBtn: false,
          content: `Carregando as imagens&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<img src="${dataUrlIcon}" />`
        })

        // download images from server to cache to attach them in email
        // DB has 4 fields for images for the same DB entry: foto1, foto2, foto3 and foto4
        const photosDeferred = []
        console.log('start sendReminderEmail')

        const downloadPhoto = function (photoIndex, fullImgUrl) {
          app.file.downloadFileAsDataURL(fullImgUrl)
            .then(dataURL => {
              const adaptedDataUrl = cordova.plugins.email.adaptDataUrlForAttachment(dataURL, photoIndex)
              photosDeferred[photoIndex].resolve(adaptedDataUrl)
            })
            .catch(err => {
              if (err) {
                console.warn(`Could not download ${fullImgUrl}`, err)
              }
              photosDeferred[photoIndex].resolve(null)
            })
        }

        for (let photoIndex = 1; photoIndex <= 4; photoIndex++) {
          if (occurrence['foto' + photoIndex]) { // if that photo index exists in the DB entry
            const fileName = occurrence['foto' + photoIndex]
            const fullImgUrl = requestImageUrl + '/' + fileName

            photosDeferred[photoIndex] = $.Deferred()
            downloadPhoto(photoIndex, fullImgUrl)
          }
        }

        $.when(...photosDeferred).done(function (/* arguments array */) {
          const attachments = []
          for (let i = 0; i < arguments.length; i++) {
            if (arguments[i]) {
              attachments.push(arguments[i])
            }
          }

          const emailSubject = `[${occurrence.carro_matricula}] na ${occurrence.data_local}, ${occurrence.data_concelho} - Inquirição sobre estado processual da denúncia de estacionamento anteriormente efetuada`

          setTimeout(() => {
            progressAlert.closeAlert()
            cordova.plugins.email.open({
              to: app.contactsFunctions.getEmailByFullName(occurrence.autoridade),
              attachments, // file paths or base64 data streams
              subject: emailSubject, // subject of the email
              body: app.text.getReminderMessage(occurrence), // email body (for HTML, set isHtml to true)
              isHtml: true // indicats if the body is HTML or plain text
            })
          }, 3000)
        })
      })
  }

  thisModule.updateHistoric = updateHistoric
  thisModule.requestNumberOfHistoricOccurrences = requestNumberOfHistoricOccurrences

  return thisModule
})(app.historic || {})
