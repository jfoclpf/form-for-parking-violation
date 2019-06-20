/* eslint camelcase: off */

/* global app, $, cordova, alert, pdf, Blob, atob, AUTHENTICATION */

app.authentication = (function (thisModule) {
  var inAppBrowserRef
  var isAuthenticationWindowClosed = true

  // function called by main.js
  function startAuthentication () {
    if (!AUTHENTICATION) {
      return
    }

    if (isAuthenticationWindowClosed) {
      loadAuthentication()
    }

    if (!inAppBrowserRef) {
      savePDF()
    } else {
      authenticationError()
    }
  }

  function loadAuthentication () {
    if (!AUTHENTICATION) {
      return
    }

    console.log('loadAuthentication()')

    var url = 'https://cmd.autenticacao.gov.pt' +
                '/Ama.Authentication.Frontend/Processes/DigitalSignature/DigitalSignatureIntro.aspx'

    var target = '_blank'
    var options = 'location=no,' +
      'hidden=yes,' +
      'footer=yes,' +
      'zoom=no,' +
      'toolbarcolor=#3C5DBC'

    inAppBrowserRef = cordova.InAppBrowser.open(url, target, options)

    inAppBrowserRef.addEventListener('loadstart', loadStartCallbackFunction)

    inAppBrowserRef.addEventListener('loadstop', loadedCallbackFunction)

    inAppBrowserRef.addEventListener('loaderror', authenticationError)

    inAppBrowserRef.addEventListener('exit', authenticationExit)
  }

  function loadStartCallbackFunction (event) {
    console.log('Authentication Window start loading')
    console.log('url: ' + event.url)

    if (app.functions.getExtensionFromURL(event.url).toLowerCase() === 'pdf') {
      alert('Encontrou ficheiro pdf assinado :)')
    }
  }

  function loadedCallbackFunction () {
    console.log('Authentication Window loaded')

    isAuthenticationWindowClosed = false

    inAppBrowserRef.insertCSS({ code: '.header,.logo,language-container,.footer{display: none !important}' })

    $.ajax({
      type: 'GET',
      url: cordova.file.applicationDirectory + 'www/js/authBrowserJSCode.js',
      dataType: 'text',
      success: function (JScodeRes) {
        // altera o texto quando refere o Documento para assinar
        var JScode = JScodeRes +
                  '(function(){' +
                      "var textEl = document.getElementById('MainContent_lblTitleChooseDoc');" +
                      'if(textEl){' +
                          "textEl.innerHTML = 'Escolha o documento <u>" +
                              getPdfFileName() + "</u> na pasta <i>Downloads</i> para assinar digitalmente';" +
                      '}' +
                  '})();'

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

  function authenticationError () {
    $.jAlert({
      'title': 'Erro na obtenção da autenticação!',
      'theme': 'red',
      'content': 'Confirme se tem acesso à Internet. Poderá sempre enviar a ocorrência às autoridades sem a autenticação da Chave Móvel Digital.'
    })
  }

  function authenticationExit () {
    console.log('Authentication Window closed')
    isAuthenticationWindowClosed = true
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

    return 'Denuncia_Estacionamento_' + fileNameExtra + '.pdf'
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
          showPDFAuthInfo(folderpath, filename)
        }, function () {
          alert('Não foi possível salvar o ficheiro em ' + folderpath)
        })
      })
    })
  }

  function showPDFAuthInfo (folderpath, filename) {
    console.log('folderpath : ' + folderpath)
    console.log('fileName :' + filename)

    if (AUTHENTICATION) {
      inAppBrowserRef.hide()
    }

    var msg = 'Foi criado o ficheiro pdf <b>' + filename + '</b> na pasta <i>Downloads</i> com a sua denúncia. '
    if (AUTHENTICATION) {
      msg += 'Terá agora, na janela seguinte, de carregar este ficheiro no autenticação.gov para assiná-lo digitalmente'
    } else {
      msg += 'Terá agora de o assinar fazendo uso da sua Chave Móvel Digital, clicando ' +
      '<a href="https://cmd.autenticacao.gov.pt/Ama.Authentication.Frontend/Processes/DigitalSignature/DigitalSignatureIntro.aspx">AQUI</a>'
    }

    $.jAlert({
      'title': 'Criação de ficheiro PDF',
      'content': msg,
      'theme': 'dark_blue',
      'onClose': function () {
        if (AUTHENTICATION) {
          inAppBrowserRef.show()
        }
      }
    })
  }

  /* === Public methods to be returned === */
  thisModule.startAuthentication = startAuthentication
  thisModule.savePDF = savePDF

  return thisModule
})(app.authentication || {})
