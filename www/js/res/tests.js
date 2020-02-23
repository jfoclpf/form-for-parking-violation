/* eslint camelcase: off */
/* eslint quotes: off */
/* eslint no-undef: off */
/* eslint no-unused-vars: off */
/* eslint func-call-spacing: off */
/* eslint space-before-blocks: off */
/* eslint no-unexpected-multiline: off */
/* eslint space-before-function-paren: off */
/* eslint semi: off */
/* eslint all: off */

justTheNameOfTheFile = 'file:///storage/9C33-6BBD/DCIM/Camera/20190616_183142.jpg'
window.requestFileSystem(window.LocalFileSystem.PERSISTENT, 0,
  async fs => {
    window.resolveLocalFileSystemURL(window.cordova.file.dataDirectory,
      async dirEntry => {
        dirEntry.getFile(justTheNameOfTheFile, { create: true, exclusive: false },
          fileEntry => {
            console.log(1)
          })
      })
  }
)

filename = "file:///storage/9C33-6BBD/DCIM/Camera/20190616_183142.jpg"

function getFileSize (fileUri) {
  window.resolveLocalFileSystemURL(fileUri, function (fileEntry) {
    console.log('fileEntry.toURL() ', fileEntry.toURL())
    fileEntry.file(function (fileObj) {
      console.log(fileObj.size)
    },
    function (err) {
      console.error('fileEntry error:\n', JSON.stringify(err))
    })
  },
  function (err) {
    console.error('resolveLocalFileSystemURL error:\n', JSON.stringify(err))
  })
}

getFileSize(filename)

filename = "file:///storage/9C33-6BBD/DCIM/Camera/20190616_183142.jpg"
function resizeImage (imageUri) {
  var resizeOptions = {
    uri: imageUri,
    fileName: 'resized.jpg',
    quality: 90,
    width: 1200,
    height: 1200,
    base64: false
  }

  window.ImageResizer.resize(resizeOptions,
    function (resizedImageUri) {
      // success on resizing
      console.log('%c Image resized: ', 'color: green; font-weight:bold', resizedImageUri)
    },
    // failed to resize, return image unchanged
    function () {
      console.log('%c Failed to resize: ', 'color: red; font-weight:bold')
    })
}
resizeImage(filename)

filename = "file:///storage/9C33-6BBD/DCIM/Camera/20190616_183142.jpg"
/* function getFileSize (filePath, callback) {
  window.resolveLocalFileSystemURL(filePath,
    function (fileSystem) {
      fileSystem.getFile(fileName, {create: false},
        function (fileEntry) {
          fileEntry.getMetadata(
            function (metadata) {
              console.log(metadata.size) // get file size
            },
            function (err) {
              callback(filePath, err)
            }
          )
        },
        function (err) {
          callback(filePath, err)
        }
      )
    },
    function (err) {
      console.error('error on resolveLocalFileSystemURL')
      callback(filePath, err)
    }
  )
} */

getFileSize(filename, function (filePath, err) {
  console.log(filePath, JSON.stringify(err))
})

$.jAlert({
  title: 'Criação de ficheiro PDF',
  content: 'msg',
  theme: 'dark_blue',
  btns: [
    {
      text: 'Assinar PDF com Chave Móvel Digital',
      theme: 'green',
      class: 'jButtonAlert',
      onClick: function () {
        if (IN_APP_BROWSER_AUTH) {
          inAppBrowserRef.show()
        }
      }
    }
  ]
})
