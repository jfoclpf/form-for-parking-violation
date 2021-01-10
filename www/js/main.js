/* eslint camelcase: off */

/* global $, cordova */

var DEBUG = true

/* tries to use built-in browser plugin to authentication;
when false uses OS default browser with a simple url link;
option `true` is not working, check:
https://github.com/apache/cordova-plugin-inappbrowser/issues/498 */
var AUTHENTICATION_WITH_IN_APP_BROWSER = false

console.log('AUTHENTICATION_WITH_IN_APP_BROWSER: ', AUTHENTICATION_WITH_IN_APP_BROWSER)
console.success = (message) => { console.log('%c ' + message, 'color: green; font-weight:bold') }

var app = {}

app.main = (function (thisModule) {
  var wasInit

  thisModule.variables = {} // global object used for debug
  thisModule.urls = {
    Chave_Movel_Digital: {
      aderir: 'https://www.autenticacao.gov.pt/cmd-pedido-chave',
      a_minha_area: 'https://www.autenticacao.gov.pt/a-chave-movel-digital',
      assinar_pdf: 'https://cmd.autenticacao.gov.pt/Ama.Authentication.Frontend/Processes/DigitalSignature/DigitalSignatureIntro.aspx',
      app: 'https://play.google.com/store/apps/details?id=pt.ama.autenticacaogov&hl=pt'
    },
    databaseServer: {
      uploadImages: 'https://contabo.joaopimentel.com/passeio_livre/serverapp_img_upload', // used to upload an image
      requestImage: 'https://contabo.joaopimentel.com/passeio_livre/image_server', // folder where all the images are stored
      uploadOccurence: 'https://contabo.joaopimentel.com/passeio_livre/serverapp', // to upload anew or update the data of an occurence
      requestHistoric: 'https://contabo.joaopimentel.com/passeio_livre/serverapp_get_historic' // to request all historic ocurrences of current user
    },
    androidPlayStore: 'https://play.google.com/store/apps/details?id=com.form.parking.violation'
  }

  $(document).ready(function () {
    console.log('$(document).ready started')
    wasInit = false
    document.addEventListener('deviceready', onDeviceReady, false)

    app.sidebar.init()
    app.sidebar.showSection('main_form')
  })

  function onDeviceReady () {
    console.log('onDeviceReady() started')

    document.addEventListener('online', onOnline, false)
    document.addEventListener('resume', onResume, false)

    window.screen.orientation.lock('portrait')

    cordova.getAppVersion.getVersionNumber(function (version) {
      console.log('APP version is ' + version)
      $('.version').text('versão ' + version)
    })

    cordova.plugins.IsDebug.getIsDebug(function (isDebug) {
      // in release mode the app is not debuggable (in chrome), thus I may stil want to debug with DEBUG=false
      // but in release mode I want to be sure that DEBUG is always false
      if (!isDebug) { // release mode
        DEBUG = false
        console.log = () => {}
        console.warn = () => {}
        console.error = () => {}
      }
      init()
    }, function (err) {
      console.error(err)
      init()
    })
  }

  // if by any strange reason onDeviceReady doesn't trigger after 5 seconds, load init() anyway
  setTimeout(function () {
    if (!wasInit) {
      init()
    }
  }, 5000)

  // when the page loads (only on smartphone)
  function init () {
    console.log('init() started')
    wasInit = true

    console.log('DEBUG: ', DEBUG)
    // for the plugin cordova-plugin-inappbrowser
    window.open = cordova.InAppBrowser.open

    app.functions.addFunctionsToPlugins()

    // information stored in variable window.localStorage
    app.personalInfo.loadsPersonalInfo()

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

    app.map.init()

    if (DEBUG) {
      app.functions.setDebugValues()
    }

    if (!DEBUG) {
      requestUserAppEvaluation()
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

  // request user to evaluate this app on Play Store
  function requestUserAppEvaluation () {
    if (JSON.parse(window.localStorage.getItem('didUserAlreadyClickedToEvaluatedApp'))) {
      return
    }

    const minimumOccurencesToRequestUserToEvaluteApp = 5
    app.historic.requestNumberOfHistoricOccurrences(
      (err, result) => {
        if (!err && result > minimumOccurencesToRequestUserToEvaluteApp) {
          var msg = 'Reparámos que tem usado esta APP, que é gratuita, de código aberto e sem publicidade. Fizemo-lo dentro do espírito de serviço público.<br><br>' +
            'Contudo vários utilizadores movidos por uma lógica vingativa, presumivelmente automobilistas cujas ações foram reportadas, têm dado nota negativa (nota 1) a esta APP na Play Store.<br><br>' +
            'Ajude-nos avaliando o nosso trabalho cívico. Muito obrigados'

          $.jAlert({
            content: msg,
            theme: 'dark_blue',
            btns: [
              {
                text: 'Avaliar na Play Sore',
                theme: 'green',
                class: 'jButtonAlert',
                onClick: function () {
                  window.localStorage.setItem('didUserAlreadyClickedToEvaluatedApp', 'true')
                  cordova.InAppBrowser.open(thisModule.urls.androidPlayStore, '_system')
                }
              }
            ]
          })
        }
      })
  }

  // when user clicks "generate_email"
  $('#generate_message').click(function () {
    if (!app.form.isMessageReady()) {
      return
    }

    var mainMessage = app.text.getMainMessage('body')
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
    if (!app.form.isMessageReady()) {
      return
    }

    var mensagem = 'A Autoridade Nacional de Segurança Rodoviária (ANSR), num parecer enviado às polícias a propósito desta APP, ' +
    'refere que as polícias devem de facto proceder à emissão efetiva da multa, perante as queixas dos cidadãos por esta via. ' +
    'Todavia, refere a ANSR, que os denunciantes deverão posteriormente dirigir-se às instalações da polícia respetiva, para se identificarem presencialmente.<br><br>' +
    'Caso não se queira dirigir à polícia, terá de se autenticar fazendo uso da <b>Chave  Móvel Digital</b> emitida pela Administração Pública. ' +
    'Caso não tenha uma, veja no menu principal como pedi-la.'

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
    app.dbServerLink.submitNewEntryToDB()

    app.functions.updateDateAndTime()

    var imagesArray = app.photos.getImagesArray()
    console.log(JSON.stringify(imagesArray, 0, 3))
    const attachments = imagesArray.map(path => cordova.plugins.email.adaptFilePathInInternalStorage(path))

    cordova.plugins.email.open({
      to: app.contactsFunctions.getEmailOfCurrentSelectedAuthority(), // email addresses for TO field
      attachments: attachments,
      subject: app.text.getMainMessage('subject'), // subject of the email
      body: app.text.getMainMessage('body'), // email body (for HTML, set isHtml to true)
      isHtml: true // indicats if the body is HTML or plain text
    })
  }

  thisModule.sendMailMessageWithoutCMD = sendMailMessageWithoutCMD

  return thisModule
})({})
