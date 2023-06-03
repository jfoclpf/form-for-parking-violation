/* eslint camelcase: off */

/* global app, cordova, XMLHttpRequest, FileReader, Blob, FormData, fetch  */

app.file = (function (thisModule) {
  // format: text, dataURL, arrayBuffer, binaryString
  function getFileContent (imageUri, format, callback) {
    window.resolveLocalFileSystemURL(imageUri, function (fileEntry) {
      fileEntry.file((file) => {
        if (!file.size) {
          callback(Error('File is empty (on fileEntry from resolveLocalFileSystemURL)'))
          return
        }
        const reader = new FileReader()

        reader.onloadend = () => {
          callback(null, reader.result)
        }
        reader.onerror = (err) => {
          console.error('Error on FileReader', err)
          callback(Error('Error on FileReader' + err.message))
        }

        switch (format) {
          case 'arrayBuffer':
            reader.readAsArrayBuffer(file)
            break
          case 'binaryString':
            reader.readAsBinaryString(file)
            break
          case 'dataURL':
            reader.readAsDataURL(file)
            break
          case 'text':
            reader.readAsText(file)
            break
          default:
            reader.readAsText(file)
        }
      }, (err) => { callback(Error('Error on fileEntry.file ' + JSON.stringify(err))) })
    }, (err) => { callback(Error('Error on resolveLocalFileSystemURL ' + JSON.stringify(err))) })
  }

  // 'file://path/to/photo.jpg?123' => 'file://path/to/photo123.jpg'
  // this function is very important cause the getpicture plugin returns a unique tag after ?
  // on the file uri, such that files don't get messed with each other, since the plugin uses the cache
  function adaptFilenameFromUri (uri) {
    if (uri.includes('?')) {
      const code = uri.split('?').slice(-1) // 123
      const fileNoCode = uri.split('?').slice(0, -1).join('?') // file://photo.jpg
      const extenstion = fileNoCode.split('.').slice(-1) // 'jpg'
      const fileNoCodeNoExtension = fileNoCode.split('.').slice(0, -1).join('.') // file://photo
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
    const output = []
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
  copyFile("file:///storage/emulated/0/Android/data/com.form.parking.violation/cache/IMG-20180505-WA0004.jpg", "myImg.jpg", LocalFileSystem.TEMPORARY);
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
              const documentsPath = fileSystem.root
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

    const destPathName = getFilenameFromURL(baseFileURI)[1]

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
      const output = []
      output[1] = url.split('/').pop()
      output[0] = url.substring(0, url.length - output[1].length - 1)
      return output
    }

    const destPathName = getFilenameFromURL(baseFileURI)[1]

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
        const reader = fileSystem.createReader()
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
    let fileSize = null
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
    const onerror = (err) => {
      console.error(`Error downloading file from url ${fileurl} to cordovaFileSystem ${cordovaFileSystem}`,
        err, new Error(err))
      if (typeof callback === 'function') { callback(Error(err)) }
    }

    let blob = null
    const xhr = new XMLHttpRequest()
    xhr.open('GET', fileurl)
    xhr.responseType = 'blob' // force the HTTP response, response-type header to be blob
    xhr.onload = () => {
      blob = xhr.response // xhr.response is now a blob object
      const DataBlob = blob
      window.resolveLocalFileSystemURL(cordovaFileSystem, (dirEntry) => {
        const sanitizedFilename = filename.replace(/[^a-z0-9.]/gi, '_').toLowerCase() // sanitize filename
        dirEntry.getFile(sanitizedFilename, { create: true }, (file) => {
          file.createWriter((fileWriter) => {
            fileWriter.write(DataBlob)
            console.success(`File downloaded succesfully from url ${fileurl} to ${cordovaFileSystem + sanitizedFilename}`)
            if (typeof callback === 'function') { callback(null, cordovaFileSystem + sanitizedFilename) }
          }, (err) => { console.error('Error on file.createWriter'); onerror(err) })
        }, (err) => { console.error('Error on dirEntry.getFile'); onerror(err) })
      }, (err) => { console.error('Error on resolveLocalFileSystemURL'); onerror(err) })
    }
    xhr.onerror = (err) => { console.error('Error on XMLHttpRequest'); onerror(err) }
    xhr.send()
  }

  function uploadFileToServer (fileUri, fileName, remoteUrl, callback) {
    const onerror = (err) => {
      console.error(`Error uploading file ${fileUri} to ${remoteUrl}`,
        err, new Error(err))
      if (typeof callback === 'function') { callback(Error(err)) }
    }

    window.resolveLocalFileSystemURL(fileUri, function (fileEntry) {
      fileEntry.file((file) => {
        if (!file.size) { onerror('File is empty (on fileEntry from resolveLocalFileSystemURL)'); return }
        const reader = new FileReader()
        reader.onloadend = () => {
          const blob = new Blob([new Uint8Array(reader.result)], { type: 'application/octet-stream' })
          if (!blob.size) { onerror('File is empty (on blob)'); return }
          const fd = new FormData()
          fd.append('file', blob, fileName)

          const xhr = new XMLHttpRequest()
          xhr.open('POST', remoteUrl, true)
          xhr.onload = function () {
            if (xhr.status === 200 || xhr.status === 201) {
              console.success(`File ${fileUri} uploaded succesfully to url ${remoteUrl}`)
              if (typeof callback === 'function') { callback() }
            } else {
              console.error('Error on xhr.status: ' + xhr.status); onerror(xhr.status)
            }
          }
          xhr.onerror = (err) => { console.error('Error on XMLHttpRequest'); onerror(err) }
          xhr.send(fd)
        }
        reader.onerror = (err) => { console.error('Error on FileReader'); onerror(err) }
        reader.readAsArrayBuffer(file)
      }, (err) => { console.error('Error on fileEntry.file'); onerror(err) })
    }, (err) => { console.error('Error on resolveLocalFileSystemURL'); onerror(err) })
  }

  function resizeImage (imageUri, callback) {
    // generate filename for resized image
    const uriAdapted = adaptFilenameFromUri(imageUri) // 'file://path/to/photo.jpg?123' => 'file://path/to/photo123.jpg'
    const fileName = getFilenameFromURL(uriAdapted)[1] // 'file://path/to/photo123.jpg' => 'photo123.jpg'
    const fileNameWithoutExtension = fileName.split('.').slice(0, -1).join('.') // 'photo123'
    const extension = getExtensionFromURL(fileName) // 'jpg'
    const fileNameResized = fileNameWithoutExtension + '_resized' + '.' + extension // 'photo123_resized.jpg'
    console.log('fileNameResized:', fileNameResized)

    const resizeOptions = {
      uri: imageUri,
      fileName: fileNameResized,
      folderName: cordova.file.cacheDirectory,
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

  function downloadFileAsDataURL (url) {
    return new Promise((resolve, reject) => {
      fetch(url)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader()
          reader.readAsDataURL(blob)
          reader.onloadend = () => resolve(reader.result)
          reader.onerror = err => reject(err)
        })
        .catch(err => reject(err))
    })
  }

  thisModule.getFileContent = getFileContent
  thisModule.listDir = listDir
  thisModule.getFilenameFromURL = getFilenameFromURL
  thisModule.copyFile = copyFile
  thisModule._copyFile = _copyFile
  thisModule.moveFile = moveFile
  thisModule.adaptFilenameFromUri = adaptFilenameFromUri
  thisModule.getExtensionFromURL = getExtensionFromURL
  thisModule.getFileSize = getFileSize
  thisModule.downloadFileToDevice = downloadFileToDevice
  thisModule.uploadFileToServer = uploadFileToServer
  thisModule.resizeImage = resizeImage
  thisModule.downloadFileAsDataURL = downloadFileAsDataURL

  return thisModule
})(app.file || {})
