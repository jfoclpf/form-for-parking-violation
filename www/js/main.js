/* eslint camelcase: off */

/* global $, cordova */

var DEBUG = true

/* tries to use built-in browser plugin to authentication;
when false uses OS default browser with a simple url link;
option `true` is not working, check:
https://github.com/apache/cordova-plugin-inappbrowser/issues/498 */
var IN_APP_BROWSER_AUTH = false

/* for any type of authentication this must be true */
var SAVE_PDF = true

console.log('DEBUG: ', DEBUG)
console.log('IN_APP_BROWSER_AUTH: ', IN_APP_BROWSER_AUTH)

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

    app.localization.loadMapsApi()
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
      title: 'Método de obtenção da foto:',
      theme: 'dark_blue',
      btns: [
        {
          text: 'Câmara',
          theme: 'green',
          class: 'jButtonAlert',
          onClick: function () { app.photos.getPhoto(num, 'camera', callback) }
        },
        {
          text: 'Biblioteca de fotos',
          theme: 'green',
          class: 'jButtonAlert',
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
    // it popups the alerts according to needed fields
    if (!app.text.isMessageReady()) {
      return
    }

    if (IN_APP_BROWSER_AUTH || SAVE_PDF) {
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
              if (IN_APP_BROWSER_AUTH) {
                app.authentication.startAuthentication()
              } else {
                app.authentication.savePDF()
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
    } else {
      sendMailMessageWithoutCMD()
    }
  })

  // CMD -> Chave Móvel Digital
  function sendMailMessageWithoutCMD () {
    var mainMessage = app.text.getMainMessage() + '<br><br>' + app.text.getRegards() + '<br>'

    const carPlateStr = app.functions.getCarPlate()
    const address = app.functions.getFullAddress()
    var emailSubject = `[${carPlateStr}] na ${address} - Denúncia de estacionamento ao abrigo do n.º 5 do art. 170.º do Código da Estrada`

    console.log(JSON.stringify(thisModule.imagesUriCleanArray, 0, 3))

    /* var databaseObj = {
      PROD: !DEBUG,
      foto1: 'test',
      foto2: 'test',
      foto3: 'test',
      foto4: 'test',
      carro_matricula: 'XX-XX-XX',
      carro_marca: '',
      carro_modelo: '',
      data_data: '',
      data_hora: '',
      data_concelho: '',
      data_local: '',
      data_num_porta: '20',
      data_coord_latit: 0,
      data_coord_long: 0,
      base_legal: 'CdE',
      autoridade: 'PSP'
    }

    app.functions.updateDateAndTime(databaseObj) */

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
