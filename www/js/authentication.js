/* eslint camelcase: off */

/* eslint no-unused-vars: "off" */
/* global app, $, cordova, alert, pdf, Blob, atob, FileTransfer, AUTHENTICATION_WITH_IN_APP_BROWSER */

app.authentication = (function (thisModule) {
  var inAppBrowserRef
  var isAuthenticationWindowClosed = true
  var pdfFileJustCreated = false

  function startAuthenticationWithSystemBrowser () {
    savePDF()
  }

  // this function is not yet fully funcional
  function startAuthenticationWithInAppBrowser () {
    if (!AUTHENTICATION_WITH_IN_APP_BROWSER) {
      return
    }

    if (isAuthenticationWindowClosed) {
      loadAuthentication()
    }

    console.log('inAppBrowserRef: ', inAppBrowserRef)
    if (inAppBrowserRef) {
      savePDF()
    } else {
      authenticationError()
    }
  }

  function loadAuthentication () {
    if (!AUTHENTICATION_WITH_IN_APP_BROWSER) {
      return
    }

    console.log('loadAuthentication()')

    var url = app.main.urls.Chave_Movel_Digital.assinar_pdf

    var target = '_blank'
    var options = 'hidden=yes,' +
      'footer=yes,' +
      'beforeload=yes' +
      'zoom=no,' +
      'toolbarcolor=#3C5DBC'

    inAppBrowserRef = cordova.InAppBrowser.open(url, target, options)
    inAppBrowserRef.addEventListener('beforeload', beforeLoadCallbackFunction)
    inAppBrowserRef.addEventListener('loadstart', loadStartCallbackFunction)
    inAppBrowserRef.addEventListener('loadstop', loadedCallbackFunction)
    inAppBrowserRef.addEventListener('loaderror', authenticationError)
    inAppBrowserRef.addEventListener('exit', authenticationExit)
  }

  function beforeLoadCallbackFunction (params, callback) {
    if (params.url.match('DigitalSignConfirmTan.aspx')) {
      cordova.InAppBrowser.open(params.url, '_system')
    } else {
      // Default handling:
      callback(params.url)
    }
  }

  function loadStartCallbackFunction (event) {
    console.log('%c ========== loadstart ========== ', 'background: yellow; color: blue')
    console.log(event.url)

    if (event.url.split('/').pop() === 'DigitalSignConfirmTan.aspx') {
      console.log(event)
    }
  }

  function loadedCallbackFunction (event) {
    console.log('%c ========== loadstop ========== ', 'background: yellow; color: blue')
    // console.log(event.url)

    isAuthenticationWindowClosed = false

    inAppBrowserRef.insertCSS({ code: '.header,.logo,language-container,.footer{display: none !important}' })

    $.ajax({
      type: 'GET',
      url: cordova.file.applicationDirectory + 'www/js/authBrowserJSCode.js',
      dataType: 'text',
      success: function (JScodeRes) {
        // altera o texto quando refere o Documento para assinar
        var JScode = JScodeRes +
          `(function(){
             var textEl = document.getElementById('MainContent_lblTitleChooseDoc');
             if(textEl){
               textEl.innerHTML = 'Escolha o documento <u>${getPdfFileName()}</u> na pasta <i>Downloads</i> para assinar digitalmente';
             }
           })();`

        inAppBrowserRef.executeScript(
          { code: JScode },
          function () {
            console.log('authBrowserJSCode.js Inserted Succesfully into inApp Browser Window')
          })
      },
      error: function () {
        console.error('Ajax Error')
      }
    })
  }

  function downloadPdfFile (args) {
    console.log('downloadPdfFile')

    var fileTransfer = new FileTransfer()
    var uri = encodeURI(args.url)

    fileTransfer.download(
      uri, // file's uri
      args.targetPath, // where will be saved
      function (entry) {
        console.log('download complete: ' + entry.toURL())
        window.open(entry.toURL(), '_blank', 'location=no,closebuttoncaption=Cerrar,toolbar=yes,enableViewportScale=yes')
      },
      function (error) {
        console.log('download error source ' + error.source)
        console.log('download error target ' + error.target)
        console.log('upload error code' + error.code)
      },
      true,
      args.options
    )
  }

  function authenticationError () {
    $.jAlert({
      title: 'Erro na obtenção da autenticação!',
      theme: 'red',
      content: 'Confirme se tem acesso à Internet. Poderá sempre enviar a ocorrência às autoridades sem a autenticação da Chave Móvel Digital.'
    })
  }

  function authenticationExit () {
    console.log('Authentication Window closed')
    isAuthenticationWindowClosed = true
  }

  function savePDF () {
    var options = {
      documentSize: 'A4',
      type: 'base64'
    }

    var pdfhtml = '<html><body style="font-size:120%">' + app.text.getMainMessage()

    for (var i = 0; i < app.main.imagesUriCleanArray.length; i++) {
      pdfhtml += '<br><br>'
      pdfhtml += '<img src="' + app.main.imagesUriCleanArray[i] + '" width="320">'
    }

    pdfhtml += '<br><br>' + app.text.getExtraAuthenticationHTMLText()
    pdfhtml += '<br><br>' + app.text.getRegards() + '<br>'

    pdfhtml += '</body></html>'

    pdf.fromData(pdfhtml, options)
      .then(function (base64) {
        // To define the type of the Blob
        var contentType = 'application/pdf'

        // if cordova.file is not available use instead :
        // var folderpath = "file:///storage/emulated/0/Download/";
        var folderpath = cordova.file.externalRootDirectory + 'Download/'
        savebase64AsPDF(folderpath, getPdfFileName(), base64, contentType)
      })
      .catch((err) => console.err(err))
  }

  function getPdfFileName () {
    var carPlate = app.functions.getCarPlate()

    var fileNameExtra
    if (carPlate) {
      fileNameExtra = carPlate
    } else {
      var rightNow = new Date()
      fileNameExtra = rightNow.toISOString().slice(0, 10)
    }

    return fileNameExtra + '_Denuncia_Estacionamento' + '.pdf'
  }

  // these two function got from here: https://ourcodeworld.com/articles/read/230/how-to-save-a-pdf-from-a-base64-string-on-the-device-with-cordova
  /**
   * Convert a base64 string in a Blob according to the data and contentType.
   *
   * @param b64Data {String} Pure base64 string without contentType
   * @param contentType {String} the content type of the file i.e (application/pdf - text/plain)
   * @param sliceSize {Int} SliceSize to process the byteCharacters
   * @see http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
   * @return Blob
   */
  function b64toBlob (b64Data, contentType, sliceSize) {
    contentType = contentType || ''
    sliceSize = sliceSize || 512

    var byteCharacters = atob(b64Data)
    var byteArrays = []

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize)

      var byteNumbers = new Array(slice.length)
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i)
      }

      var byteArray = new Uint8Array(byteNumbers)

      byteArrays.push(byteArray)
    }

    var blob = new Blob(byteArrays, { type: contentType })
    return blob
  }

  /**
   * Create a PDF file according to its database64 content only.
   *
   * @param folderpath {String} The folder where the file will be created
   * @param filename {String} The name of the file that will be created
   * @param content {Base64 String} Important : The content can't contain the following string (data:application/pdf;base64). Only the base64 string is expected.
   */
  function savebase64AsPDF (folderpath, filename, content, contentType) {
    // Convert the base64 string in a Blob
    var DataBlob = b64toBlob(content, contentType)

    console.log('Starting to write the file :3')

    window.resolveLocalFileSystemURL(folderpath, function (dir) {
      console.log('Access to the directory granted succesfully')
      dir.getFile(filename, { create: true }, function (file) {
        console.log('File created succesfully.')
        file.createWriter(function (fileWriter) {
          console.log('Writing content to file')
          fileWriter.write(DataBlob)

          pdfFileJustCreated = true
          showPDFAuthInfo(folderpath, filename)
        }, function () {
          pdfFileJustCreated = false
          alert('Não foi possível salvar o ficheiro em ' + folderpath)
        })
      })
    })
  }

  function showPDFAuthInfo (folderpath, filename) {
    console.log('folderpath : ' + folderpath)
    console.log('fileName :' + filename)

    if (AUTHENTICATION_WITH_IN_APP_BROWSER) {
      inAppBrowserRef.hide()
    }

    var msg = 'Foi criado o ficheiro PDF <span style="color:orange"><b>' + filename + '</b></span>' + ' ' +
    'na pasta <i>Downloads</i> ou <i>Documentos/Downloads</i> com a sua denúncia.' + '<br><br>'
    msg += 'Abrir-se-á de seguida uma janela para assinar o PDF fazendo uso da sua Chave Móvel Digital.' + '<br><br>'
    msg += 'Guarde o PDF gerado com a sua assinatura digital.'

    $.jAlert({
      title: 'Criação de ficheiro PDF',
      content: msg,
      theme: 'dark_blue',
      btns: [
        {
          text: 'Avançar',
          theme: 'green',
          class: 'jButtonAlert',
          onClick: function () {
            if (AUTHENTICATION_WITH_IN_APP_BROWSER) {
              // tries to use internal browser plugin to sign the pdf document
              inAppBrowserRef.show()
            } else {
              cordova.InAppBrowser.open(app.main.urls.Chave_Movel_Digital.assinar_pdf, '_system')
            }
          }
        }
      ]
    })
  }

  // depois de sair da APP para assinar o PDF na página do Estado, regressa novamente à APP e corre esta função
  function onAppResume () {
    if (AUTHENTICATION_WITH_IN_APP_BROWSER) {
      return
    }

    console.log('pdfFileJustCreated:', pdfFileJustCreated)
    if (pdfFileJustCreated) {
      $.jAlert({
        title: 'PDF digitalmente assinado?',
        content: 'Consegiu assinar o PDF com sucesso, fazendo uso da sua Chave Móvel Digital?',
        theme: 'dark_blue',
        onClose: function () {
          pdfFileJustCreated = false
        },
        btns: [
          {
            text: 'Sim',
            theme: 'green',
            class: 'jButtonAlert',
            onClick: function () {
              $.jAlert({
                title: 'Envio do PDF digitalmente assinado',
                content: 'Abrir-se-á de seguida a sua APP de email onde terá apenas que anexar o PDF digitalmente assinado. Garanta que anexa apenas o PDF que está digitalmente assinado.',
                theme: 'dark_blue',
                btns: [
                  {
                    text: 'Avançar',
                    theme: 'green',
                    class: 'jButtonAlert',
                    onClick: sendMailMessageWithCMD // CMD -> Chave Móvel Digital
                  }
                ]
              })
            }
          },
          {
            text: 'Não, mas quero tentar novamente',
            theme: 'green',
            closeAlert: false,
            class: 'jButtonAlert',
            onClick: function () {
              pdfFileJustCreated = false
              // Opens in the system's default web browser
              cordova.InAppBrowser.open(app.main.urls.Chave_Movel_Digital.assinar_pdf, '_system')
            }
          },
          {
            text: 'Não, mas quero enviar sem Chave Móvel Digital',
            theme: 'green',
            class: 'jButtonAlert',
            onClick: function () {
              app.main.sendMailMessageWithoutCMD() // CMD -> Chave Móvel Digital
              pdfFileJustCreated = false
            }
          }
        ]
      })
    }
  }

  function sendMailMessageWithCMD () {
    var mainMessage = 'Exmos. Srs.,<br><br>'
    mainMessage += 'Envio em anexo ficheiro PDF com uma denúncia de estacionamento ao abrigo do n.º 5 do art. 170.º do Código da Estrada.<br><br>'

    mainMessage += 'Realço que de acordo com o n.º 1 do artigo 4.º da Lei n.º 37/2014, ' +
      'os atos praticados por um cidadão junto da Administração Pública presumem-se ser da sua autoria, ' +
      'dispensando-se a sua assinatura ou presença, ' +
      'sempre que sejam utilizados meios de autenticação segura para o efeito, ' +
      'meios esses, que de acordo com o número 2 do mesmo artigo, ' +
      'incluem o uso de certificado digital constante do cartão de cidadão. ' +
      'Por conseguinte, no seguimento das instruções emanadas pela ANSR, terão V. Exas. ' +
      'que emitir a respetiva coima sem que eu tenha que me apresentar junto das instalações de V. Exas.'

    mainMessage += '<br><br>' + app.text.getRegards() + '<br>'

    const carPlateStr = app.functions.getCarPlate()
    const address = app.functions.getFullAddress()
    var emailSubject = `[${carPlateStr}] na ${address} - Denúncia de estacionamento ao abrigo do n.º 5 do art. 170.º do Código da Estrada`

    app.functions.submitDataToDB()

    cordova.plugins.email.open({
      to: app.main.emailTo, // email addresses for TO field
      subject: emailSubject, // subject of the email
      body: mainMessage, // email body (for HTML, set isHtml to true)
      isHtml: true // indicats if the body is HTML or plain text
    }, function () {
      console.log('email view dismissed')
      pdfFileJustCreated = false
    }, this)
  }

  /* === Public methods to be returned === */
  thisModule.startAuthenticationWithInAppBrowser = startAuthenticationWithInAppBrowser
  thisModule.startAuthenticationWithSystemBrowser = startAuthenticationWithSystemBrowser
  thisModule.onAppResume = onAppResume

  return thisModule
})(app.authentication || {})
