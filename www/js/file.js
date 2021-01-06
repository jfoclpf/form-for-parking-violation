/* eslint camelcase: off */

/* global app, XMLHttpRequest  */

app.file = (function (thisModule) {
  // 'file://path/to/photo.jpg?123' => 'file://path/to/photo123.jpg'
  // this function is very important cause the getpicture plugin returns a unique tag after ?
  // on the file uri, such that files don't get messed with each other, since the plugin uses the cache
  function adaptFilenameFromUri (uri) {
    if (uri.includes('?')) {
      var code = uri.split('?').slice(-1) // 123
      var fileNoCode = uri.split('?').slice(0, -1).join('?') // file://photo.jpg
      var extenstion = fileNoCode.split('.').slice(-1) // 'jpg'
      var fileNoCodeNoExtension = fileNoCode.split('.').slice(0, -1).join('.') // file://photo
      return fileNoCodeNoExtension + code + '.' + extenstion
    } else {
      return uri
    }
  }

  // ex: from "file:///storage/emulated/0/Android/data/com.form.parking.violation/cache/1525698243664.jpg"
  // output[0] == "file:///storage/emulated/0/Android/data/com.form.parking.violation/cache"
  // output[1] == "1525698243664.jpg"
  function getFilenameFromURL (url) {
    if (!url) {
      return false
    }
    var output = []
    output[1] = url.split('/').pop()
    output[0] = url.substring(0, url.length - output[1].length - 1)
    return output
  }

  // from "https://example.com/folder/file.jpg?param.eter#hash=12.345"
  // output ------> jpg
  function getExtensionFromURL (url) {
    return url.split(/#|\?/)[0].split('.').pop().trim()
  }

  /* use it like this, for example:
  copyFile("file:///storage/emulated/0/Android/data/com.form.parking.violation/cache/IMG-20180505-WA0004.jpg",        "myImg.jpg", LocalFileSystem.TEMPORARY);
  see https://stackoverflow.com/a/50221986/1243247 */
  function _copyFile (baseFileURI, destPathName, fileSystem) {
    console.log('Copying from: ' + baseFileURI)

    if (!baseFileURI) {
      console.error('File to copy empty or null')
      return
    }

    return new Promise(function (resolve, reject) {
      window.resolveLocalFileSystemURL(baseFileURI,
        function (file) {
          window.requestFileSystem(fileSystem, 0,
            function (fileSystem) {
              var documentsPath = fileSystem.root
              console.log(documentsPath)
              file.copyTo(documentsPath, destPathName,
                function (res) {
                  console.log('copying was successful to: ' + res.nativeURL)
                  resolve(res.nativeURL)
                },
                function () {
                  console.log('unsuccessful copying')
                })
            })
        },
        function () {
          console.log('failure! file was not found')
          reject(Error('failure! file was not found'))
        }
      )
    })
  }

  function copyFile (baseFileURI, destPathDir) {
    console.log('Copying : ' + baseFileURI)

    var destPathName = getFilenameFromURL(baseFileURI)[1]

    if (!baseFileURI || !destPathName) {
      console.error('File to copy empty or invalid')
      return
    }

    if (!destPathDir) {
      console.error('Directory to copy empty or null')
      return
    }

    console.log('Copying to: ' + destPathDir + destPathName)

    return new Promise(function (resolve, reject) {
      window.resolveLocalFileSystemURL(baseFileURI,
        function (file) {
          window.resolveLocalFileSystemURL(destPathDir,
            function (destPathDirObj) {
              console.log(destPathDirObj)

              file.copyTo(destPathDirObj, destPathName,
                function (res) {
                  console.log('copying was successful to: ' + res.nativeURL)
                  resolve(res.nativeURL)
                },
                function () {
                  console.log('unsuccessful copying')
                })
            })
        },
        function () {
          console.log('failure! file was not found')
          reject(Error('failure! file was not found'))
        }
      )
    })
  }

  function moveFile (baseFileURI, destPathDir) {
    console.log('Moving : ' + baseFileURI)

    function getFilenameFromURL (url) {
      if (!url) {
        return false
      }
      var output = []
      output[1] = url.split('/').pop()
      output[0] = url.substring(0, url.length - output[1].length - 1)
      return output
    }

    var destPathName = getFilenameFromURL(baseFileURI)[1]

    if (!baseFileURI || !destPathName) {
      console.error('File to move empty or invalid')
      return
    }

    if (!destPathDir) {
      console.error('Directory to move empty or null')
      return
    }

    console.log('Moving to: ' + destPathDir + destPathName)

    return new Promise(function (resolve, reject) {
      window.resolveLocalFileSystemURL(baseFileURI,
        function (file) {
          window.resolveLocalFileSystemURL(destPathDir,
            function (destPathDirObj) {
              console.log(destPathDirObj)

              file.moveTo(destPathDirObj, destPathName,
                function (res) {
                  console.log('moving was successful to: ' + res.nativeURL)
                  resolve(res.nativeURL)
                },
                function () {
                  console.log('unsuccessful moving')
                })
            })
        },
        function () {
          console.log('failure! file was not found')
          reject(Error('failure! file was not found'))
        }
      )
    })
  }

  // example: list of www/audio/ folder in cordova/ionic app.
  // listDir(cordova.file.applicationDirectory + "www/audio/");
  function listDir (path) {
    window.resolveLocalFileSystemURL(path,
      function (fileSystem) {
        var reader = fileSystem.createReader()
        reader.readEntries(
          function (entries) {
            console.log(entries)
          },
          function (err) {
            console.log(err)
          }
        )
      }, function (err) {
        console.log(err)
      }
    )
  }

  function getFileSize (fileUri, callback) {
    var fileSize = null
    window.resolveLocalFileSystemURL(fileUri, function (fileEntry) {
      fileEntry.file(function (fileObj) {
        fileSize = fileObj.size
        callback(fileSize)
      },
      function (err) {
        console.error('fileEntry error:\n', JSON.stringify(err))
        callback(fileSize, Error(err))
      })
    },
    function (err) {
      console.error('resolveLocalFileSystemURL error:\n', JSON.stringify(err))
      callback(fileSize, Error(err))
    })
  }

  // download file to device
  // for different types of cordovaFileSystem check here: https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-file/#where-to-store-files
  // or simply in the console type `console.log(cordova.file)`
  function downloadFileToDevice (fileurl, filename, cordovaFileSystem, callback) {
    var blob = null
    var xhr = new XMLHttpRequest()
    xhr.open('GET', fileurl)
    xhr.responseType = 'blob' // force the HTTP response, response-type header to be blob
    xhr.onload = function () {
      blob = xhr.response // xhr.response is now a blob object
      var DataBlob = blob
      window.resolveLocalFileSystemURL(cordovaFileSystem, function (dir) {
        dir.getFile(filename, { create: true }, function (file) {
          file.createWriter(function (fileWriter) {
            fileWriter.write(DataBlob)
            console.success(`File downloaded succesfully from url ${fileurl} to ${cordovaFileSystem + filename}`)
            if (typeof callback === 'function') { callback(null, cordovaFileSystem + filename) }
          }, function (err) {
            console.error(`Error downloading file from url: ${fileurl} to cordovaFileSystem: ${cordovaFileSystem}`)
            console.error(err)
            if (typeof callback === 'function') { callback(err) }
          })
        })
      })
    }
    xhr.send()
  }

  function resizeImage (imageUri, callback) {
    // generate filename for resized image
    var uriAdapted = adaptFilenameFromUri(imageUri) // 'file://path/to/photo.jpg?123' => 'file://path/to/photo123.jpg'
    var fileName = getFilenameFromURL(uriAdapted)[1] // 'file://path/to/photo123.jpg' => 'photo123.jpg'
    var fileNameWithoutExtension = fileName.split('.').slice(0, -1).join('.') // 'photo123'
    var extension = getExtensionFromURL(fileName) // 'jpg'
    var fileNameResized = fileNameWithoutExtension + '_resized' + '.' + extension // 'photo123_resized.jpg'
    console.log('fileNameResized:', fileNameResized)

    var resizeOptions = {
      uri: imageUri,
      fileName: fileNameResized,
      quality: 90,
      width: 1200,
      height: 1200,
      base64: false
    }

    window.ImageResizer.resize(resizeOptions,
      function (resizedImageUri) {
        // success on resizing
        console.log('%c Image resized: ', 'color: green; font-weight:bold', resizedImageUri)
        callback(resizedImageUri)
      },
      // failed to resize
      function (err) {
        console.log('%c Failed to resize: ', 'color: red; font-weight:bold')
        callback(imageUri, Error(err))
      })
  }

  thisModule.listDir = listDir
  thisModule.getFilenameFromURL = getFilenameFromURL
  thisModule.copyFile = copyFile
  thisModule._copyFile = _copyFile
  thisModule.moveFile = moveFile
  thisModule.adaptFilenameFromUri = adaptFilenameFromUri
  thisModule.getExtensionFromURL = getExtensionFromURL
  thisModule.getFileSize = getFileSize
  thisModule.downloadFileToDevice = downloadFileToDevice
  thisModule.resizeImage = resizeImage

  return thisModule
})(app.file || {})
