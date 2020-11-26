/* eslint camelcase: off */

/* global $, cordova */

var DEBUG = false

/* tries to use built-in browser plugin to authentication;
when false uses OS default browser with a simple url link;
option `true` is not working, check:
https://github.com/apache/cordova-plugin-inappbrowser/issues/498 */
var AUTHENTICATION_WITH_IN_APP_BROWSER = false

console.log('AUTHENTICATION_WITH_IN_APP_BROWSER: ', AUTHENTICATION_WITH_IN_APP_BROWSER)

var app = {}

app.main = (function (thisModule) {
  var wasInit

  thisModule.emailTo = ''
  thisModule.imagesUriArray = []
  thisModule.imagesUriCleanArray = []
  thisModule.variables = {} // global object used for debug
  thisModule.urls = {
    Chave_Movel_Digital: {
      aderir: 'https://www.autenticacao.gov.pt/cmd-pedido-chave',
      a_minha_area: 'https://www.autenticacao.gov.pt/a-chave-movel-digital',
      assinar_pdf: 'https://cmd.autenticacao.gov.pt/Ama.Authentication.Frontend/Processes/DigitalSignature/DigitalSignatureIntro.aspx',
      app: 'https://play.google.com/store/apps/details?id=pt.ama.autenticacaogov&hl=pt'
    }
  }

  $(document).ready(function () {
    console.log('$(document).ready started')
    wasInit = false
    document.addEventListener('deviceready', onDeviceReady, false)

    // hides Personal Data information section
    app.form.showSection('main_form')
    app.sidebar.init()
  })

  function onDeviceReady () {
    console.log('onDeviceReady() started')

    document.addEventListener('online', onOnline, false)
    document.addEventListener('resume', onResume, false)

    window.screen.orientation.lock('portrait')

    // DEBUG = isDebug
    console.log('DEBUG: ', DEBUG)

    if (!DEBUG) {
      console.log = () => {}
      console.warn = () => {}
      console.error = () => {}
    }
    init()
  }

  // if by any strange reason onDeviceReady doesn't trigger, load init() anyway
  setTimeout(function () {
    if (!wasInit) {
      init()
    }
  }, 3000)

  // when the page loads (only on smartphone)
  function init () {
    console.log('init() started')
    wasInit = true

    // for the plugin cordova-plugin-inappbrowser
    window.open = cordova.InAppBrowser.open

    // information stored in variable window.localStorage
    app.form.loadsPersonalInfo()

    // populates HTML select according to the information on penalties.js file
    app.penalties.populatesPenalties()

    app.functions.updateDateAndTime()

    $('input').each(function () {
      if (!DEBUG && $(this).val() === '') {
        $(this).css('border-color', 'red')
      }
    })

    $('#plate').css('border-color', '')
    app.form.setPortuguesePlateInput()

    // this is used to get address on form, and for maps section
    app.localization.loadMapsApi()
    // to get all entries to show on the map, it does it in the background
    // after opening the app for faster processing when user clicks on map section
    app.map.getAllEntries()

    if (DEBUG) {
      app.functions.setDebugValues()
    }
  }

  // ##############################################################################################################
  // ##############################################################################################################

  function onOnline () {
    app.localization.loadMapsApi()
  }

  function onResume () {
    console.log('onResume')
    app.authentication.onAppResume()
    app.localization.loadMapsApi()
  }

  // buttons "Add Image"
  $('#addImg_1, #addImg_2, #addImg_3, #addImg_4').click(function () {
    // get id, for example #remImg_2
    var id = $(this).attr('id')
    console.log('photo id: ' + id)
    // gets the number of the element, by obtaining the last character of the id
    var num = id[id.length - 1]

    var callback = function (imgNmbr) {
      // hides "Adds image" button
      $('#' + 'addImg_' + imgNmbr).html('<i class="fa fa-edit"></i>')
      $('#' + 'remImg_' + imgNmbr).show()
      updateImgContainers()
    }

    $.jAlert({
      theme: 'dark_blue',
      class: 'ja_300px',
      content: '<b>Método de obtenção da foto:</b>',
      btns: [
        {
          text: '<i class="fa fa-camera" aria-hidden="true"></i>',
          theme: 'green',
          class: 'ja_button_with_icon',
          onClick: function () { app.photos.getPhoto(num, 'camera', callback) }
        },
        {
          text: '<i class="fa fa-folder" aria-hidden="true"></i>',
          theme: 'green',
          class: 'ja_button_with_icon',
          onClick: function () { app.photos.getPhoto(num, 'library', callback) }
        }
      ]
    })
  })

  // buttons "Remove Image"
  $('#remImg_1, #remImg_2, #remImg_3, #remImg_4').click(function () {
    // get id, for example #remImg_2
    var id = $(this).attr('id')
    // gets the number of the element, by obtaining the last character of the id
    var num = id[id.length - 1]

    app.photos.removeImage('myImg_' + num, num)
    $(this).hide()

    $('#addImg_' + num).html('<i class="fa fa-plus"></i>')

    updateImgContainers()
  })

  function updateImgContainers () {
    var numberOfContainers = $('#image_selector .img-container').length
    var hasShownButton = false
    for (var i = 0; i < numberOfContainers; i++) {
      console.log(i)
      var $this = $('#image_selector .img-container').eq(i)
      if (!$this.find('img').attr('src')) {
        if (!hasShownButton) {
          console.log('show')
          $this.show()
          hasShownButton = true
        } else {
          $this.hide()
        }
      }
    }
  }

  // when user clicks "generate_email"
  $('#generate_message').click(function () {
    if (!app.text.isMessageReady()) {
      return
    }

    var mainMessage = app.text.getMainMessage() + '<br><br>' + app.text.getRegards() + '<br>'
    $('#message').html(mainMessage)
    $('#mail_message').show()

    // scrolls to the generated message
    $('html, body').animate({
      scrollTop: $('#message').offset().top
    }, 1000)
  })

  // botão de gerar email
  $('#send_email_btn').click(function () {
    // removes empty values from array, concatenating valid indexes, ex: [1, null, 2, null] will be [1, 2]
    thisModule.imagesUriCleanArray = app.functions.cleanArray(thisModule.imagesUriArray)
    // it popups the alerts according to needed fields
    if (!app.text.isMessageReady()) {
      return
    }

    var mensagem = 'A Autoridade Nacional de Segurança Rodoviária (ANSR), num parecer enviado às polícias a propósito desta APP, refere que as polícias devem de facto proceder à emissão efetiva da multa, perante as queixas dos cidadãos por esta via. Todavia, refere a ANSR, que os denunciantes deverão posteriormente dirigir-se às instalações da polícia respetiva, para se identificarem presencialmente.<br><br>Caso não se queira dirigir à polícia, terá de se autenticar fazendo uso da <b>Chave  Móvel Digital</b> emitida pela Administração Pública. Caso não tenha uma, veja ' +
    '<u><a href="' + app.main.urls.Chave_Movel_Digital.aderir + '">aqui</a></u> como pedi-la.'

    $.jAlert({
      title: 'Deseja autenticar a sua mensagem com Chave Móvel Digital?',
      content: mensagem,
      theme: 'dark_blue',
      btns: [
        {
          text: '<b>Usar</b> Chave Móvel Digital',
          theme: 'green',
          class: 'jButtonAlert',
          onClick: function () {
            if (AUTHENTICATION_WITH_IN_APP_BROWSER) {
              app.authentication.startAuthenticationWithInAppBrowser()
            } else {
              app.authentication.startAuthenticationWithSystemBrowser()
            }
          }
        },
        {
          text: '<b>Não usar</b> Chave Móvel Digital',
          theme: 'green',
          class: 'jButtonAlert',
          onClick: sendMailMessageWithoutCMD
        }
      ]
    })
  })

  // CMD -> Chave Móvel Digital
  function sendMailMessageWithoutCMD () {
    var mainMessage = app.text.getMainMessage() + '<br><br>' + app.text.getRegards() + '<br>'

    const carPlateStr = app.functions.getCarPlate()
    const address = app.functions.getFullAddress()
    var emailSubject = `[${carPlateStr}] na ${address} - Denúncia de estacionamento ao abrigo do n.º 5 do art. 170.º do Código da Estrada`

    console.log(JSON.stringify(thisModule.imagesUriCleanArray, 0, 3))

    app.functions.submitDataToDB()

    app.functions.updateDateAndTime()

    cordova.plugins.email.open({
      to: thisModule.emailTo, // email addresses for TO field
      attachments: thisModule.imagesUriCleanArray, // file paths or base64 data streams
      subject: emailSubject, // subject of the email
      body: mainMessage, // email body (for HTML, set isHtml to true)
      isHtml: true // indicats if the body is HTML or plain text
    })
  }

  thisModule.sendMailMessageWithoutCMD = sendMailMessageWithoutCMD

  return thisModule
})({})
