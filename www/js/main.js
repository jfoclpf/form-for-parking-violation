/* eslint camelcase: off */

/* global $, cordova, device */

let DEBUG = true

const app = {}

app.main = (function (thisModule) {
  let wasInit

  thisModule.urls = {
    Chave_Movel_Digital: {
      aderir: 'https://www.autenticacao.gov.pt/cmd-pedido-chave',
      a_minha_area: 'https://www.autenticacao.gov.pt/a-chave-movel-digital',
      assinar_pdf: 'https://cmd.autenticacao.gov.pt/Ama.Authentication.Frontend/Processes/DigitalSignature/DigitalSignatureIntro.aspx',
      appAndroid: 'https://play.google.com/store/apps/details?id=pt.ama.autenticacaogov&hl=pt',
      app_iOS: 'https://apps.apple.com/pt/app/id1291777170'
    },
    databaseServer: {
      uploadImages: 'https://form-for-parking-violation.joaopimentel.com/serverapp_img_upload', // used to upload an image
      requestImage: 'https://form-for-parking-violation.joaopimentel.com/image_server', // folder where all the images are stored
      uploadOccurence: 'https://form-for-parking-violation.joaopimentel.com/serverapp', // to upload anew or update the data of an occurence
      requestHistoric: 'https://form-for-parking-violation.joaopimentel.com/serverapp_get_historic' // to request all historic ocurrences of current user
    },
    androidApps: {
      thisApp: 'https://play.google.com/store/apps/details?id=com.form.parking.violation',
      shareToFileSystem: 'https://play.google.com/store/apps/details?id=com.boxhead.android.sharetofilesystem&hl=pt'
    },
    geoApi: {
      nominatimReverse: 'https://nominatim.openstreetmap.org/reverse',
      ptApi: 'https://geoapi.pt'
    }
  }

  $(function () {
    console.log('$(document).ready started')
    wasInit = false
    document.addEventListener('deviceready', onDeviceReady, false)

    app.sidebar.showSection('main_form')
  })

  function onDeviceReady () {
    console.log('onDeviceReady() started')
    console.success = (message) => { console.log('%c ' + message, 'color: green; font-weight:bold') }

    document.addEventListener('online', onOnline, false)
    document.addEventListener('resume', onResume, false)

    window.screen.orientation.lock('portrait')

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
    cordova.getAppVersion.getVersionNumber(function (version) {
      console.log('APP version is ' + version)
      thisModule.APPversion = version
      $('.version').text(`${device.platform} ${device.version}, v. ${version}${DEBUG ? 'd' : 'p'}`)
    })

    console.log('init() started')
    wasInit = true

    console.log('DEBUG: ', DEBUG)
    // for the plugin cordova-plugin-inappbrowser
    window.open = cordova.InAppBrowser.open

    $.fn.selectpicker.Constructor.BootstrapVersion = '4'

    app.form.init()
    app.sidebar.init()
    app.functions.addFunctionsToPlugins()

    // information stored in variable window.localStorage
    app.personalInfo.init()

    // loads JSON penalties files and
    // populates HTML select according to the information on penalties.js file
    app.penalties.init(() => {
      // map needs JSON penalties file available
      app.map.init()
    })

    app.functions.updateDateAndTime()

    $('input.mandatory').each(function () {
      if (!DEBUG && $(this).val() === '') {
        $(this).css('border-color', 'red')
      }
    })

    $('#plate').css('border-color', '')
    app.form.setPortuguesePlateInput()

    // this is used to get address on form, and for maps section
    app.localization.loadMapsApi()

    if (DEBUG) {
      app.functions.setDebugValues()
    }

    if (!DEBUG) {
      requestUserAppEvaluation()
    }

    // define Promise.allSettled when not available
    Promise.allSettled = Promise.allSettled || ((promises) => Promise.all(
      promises.map(p => p
        .then(value => ({
          status: 'fulfilled',
          value
        }))
        .catch(reason => ({
          status: 'rejected',
          reason
        }))
      )
    ))
  }

  // ##############################################################################################################
  // ##############################################################################################################

  function onOnline () {
    app.localization.loadMapsApi()
  }

  function onResume (res) {
    const result = res.pendingResult
    console.log('onResume', result)
    if (
      result &&
      result.pluginServiceName.toLowerCase() === 'camera' &&
      result.pluginStatus === 'OK'
    ) {
      // result.result has the image URI
      app.photos.onAppResumeAfterReboot(result.result)
    } else {
      app.authentication.onAppResume()
    }
  }

  // request user to evaluate this app on Play Store
  function requestUserAppEvaluation () {
    if (
      JSON.parse(window.localStorage.getItem('didUserAlreadyClickedToEvaluatedApp')) ||
      JSON.parse(window.localStorage.getItem('isUserUsingCamera'))
    ) {
      return
    }

    const minimumOccurencesToRequestUserToEvaluteApp = 5
    app.historic.requestNumberOfHistoricOccurrences(
      (err, result) => {
        if (!err && result > minimumOccurencesToRequestUserToEvaluteApp) {
          const msg = 'Reparámos que tem usado esta APP, que é gratuita, de código aberto e sem publicidade. Fizemo-lo dentro do espírito de serviço público.<br><br>' +
            'Contudo vários utilizadores movidos por uma lógica vingativa, presumivelmente automobilistas cujas ações foram reportadas, têm dado nota negativa (nota 1) a esta APP na Play Store.<br><br>' +
            'Ajude-nos avaliando o nosso trabalho cívico. Muito obrigados'

          $.jAlert({
            content: msg,
            theme: 'dark_blue',
            btns: [
              {
                text: 'Avaliar na Play Store',
                theme: 'green',
                class: 'jButtonAlert',
                onClick: function () {
                  window.localStorage.setItem('didUserAlreadyClickedToEvaluatedApp', 'true')
                  cordova.InAppBrowser.open(thisModule.urls.androidApps.thisApp, '_system')
                }
              }
            ]
          })
        }
      })
  }

  // when user clicks "generate_email"
  $('#generate_message').on('click', function () {
    if (!app.form.isMessageReady()) {
      return
    }

    let mainMessage
    const typeOfUser = $('input[type=radio][name="typeOfUser"]:checked').val()
    if (typeOfUser === 'citizen') {
      mainMessage = app.text.getMainMessage('body', 'citizen')
    } else if (typeOfUser === 'policeOfficer') {
      mainMessage = app.text.getMainMessage('body', 'policeOfficer')
    } else {
      console.error('Wrong type of user ' + typeOfUser)
    }

    $('#message').html(mainMessage)
    $('#mail_message').show()

    // scrolls to the generated message
    $('html, body').animate({
      scrollTop: $('#message').offset().top
    }, 1000)
  })

  // botão de gerar email
  $('#send_email_btn').on('click', function () {
    // it popups the alerts according to needed fields
    if (!app.form.isMessageReady()) {
      return
    }

    const typeOfUser = $('input[type=radio][name="typeOfUser"]:checked').val()

    if (typeOfUser === 'citizen') {
      const mensagem = 'A Autoridade Nacional de Segurança Rodoviária (ANSR), num parecer enviado às polícias a propósito desta APP, ' +
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
              app.authentication.startAuthenticationWithSystemBrowser()
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
    } else if (typeOfUser === 'policeOfficer') {
      sendMailMessageForPoliceOfficer()
    } else {
      console.error('Wrong type of user ' + typeOfUser)
    }
  })

  // Citizen sends Email Without Chave Móvel Digital
  function sendMailMessageWithoutCMD () {
    app.dbServerLink.submitNewEntryToDB()

    const imagesArray = app.photos.getPhotosForEmailAttachment()
    // console.log(JSON.stringify(imagesArray, 0, 3))
    const attachments = imagesArray.map((path, i) => cordova.plugins.email.adaptDataUrlForAttachment(path, i))

    cordova.plugins.email.open({
      to: app.contactsFunctions.getEmailOfCurrentSelectedAuthority(), // email addresses for TO field
      attachments,
      subject: app.text.getMainMessage('subject', 'citizen'), // subject of the email
      body: app.text.getMainMessage('body', 'citizen'), // email body (for HTML, set isHtml to true)
      isHtml: true // indicats if the body is HTML or plain text
    })
  }

  // Police Officer sends Email Without Chave Móvel Digital
  function sendMailMessageForPoliceOfficer () {
    const imagesArray = app.photos.getPhotosForEmailAttachment()
    // console.log(JSON.stringify(imagesArray, 0, 3))
    const attachments = imagesArray.map((path, i) => cordova.plugins.email.adaptDataUrlForAttachment(path, i))
    console.log(JSON.stringify(attachments, 0, 3))

    cordova.plugins.email.open({
      to: $('#email').val().toLowerCase(), // fetch email address from personal info
      attachments,
      subject: app.text.getMainMessage('subject', 'policeOfficer'), // subject of the email
      body: app.text.getMainMessage('body', 'policeOfficer'), // email body (for HTML, set isHtml to true)
      isHtml: true // indicats if the body is HTML or plain text
    })
  }

  thisModule.sendMailMessageWithoutCMD = sendMailMessageWithoutCMD

  return thisModule
})({})
