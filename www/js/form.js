/* eslint camelcase: off */
/* eslint prefer-regex-literals: off */

/* global app, cordova, $, CAR_LIST, DEBUG, CARROS_MATRICULAS_API */

app.form = (function (thisModule) {
  // JSON data from file js/json/municipalities.json
  let listOfMunicipalities = []

  function init () {
    if (app.functions.isThis_iOS()) {
      $('#plate').removeClass('mandatory')
      $('#plateDiv').remove()
    } else {
      $('#plate').bind('input', plateOnInput)
    }

    // preload prepositions of municípios: "de", "do" or "da" for each municipality
    app.file.getFileContent(cordova.file.applicationDirectory + 'www/json/municipalities.json', 'text', function (err, res) {
      if (err) {
        console.error(err)
      } else {
        listOfMunicipalities = JSON.parse(res)
      }
    })

    initPullToRefresh()
  }

  /* ********************************************************************** */
  /* ******************* FORM FIELDS FETCHING FUNCTIONS ******************* */
  // get carplate
  function getCarPlate () {
    if (app.functions.isThis_iOS()) {
      return ''
    }

    let plate_str = $('#plate').val()
    plate_str = plate_str.toUpperCase() // force place upcase
    plate_str = plate_str.replace(/\u2013|\u2014/g, '-') // it replaces all &ndash; (–) and &mdash; (—) symbols with simple dashes (-)

    return plate_str
  }

  function getCarMake () {
    return $('#carmake').val()
  }

  function getCarModel () {
    return $('#carmodel').val()
  }

  function getDateYYYY_MM_DD () {
    // returns format YYYY-MM-DD
    return $.datepicker.formatDate("yy'-'mm'-'dd", $('#date').datepicker('getDate'))
  }

  function getTimeHH_MM () {
    return $('#time').val()
  }

  // returns one of ["de", "da", "do"] according to the municipality,
  // ex: "do" Porto, "de" Lisboa, "da" Guarda
  function getPrepositionOfMunicipality (municipality) {
    if (!municipality || typeof municipality !== 'string') {
      return ''
    }
    const municipality_ = municipality.toLowerCase().trim()
    for (const i of listOfMunicipalities) {
      if (i.municipio.toLowerCase().trim() === municipality_) {
        return i.prep
      }
    }
    return ''
  }

  function getFullAddress () {
    const local = getStreetName() // rua, praceta, largo, travessa, etc.
    const streetNumber = getStreetNumber()
    const locality = getLocality() // freguesia, bairro, etc.
    const municipality = getMunicipality()
    const prepositionOfMunicipality = getPrepositionOfMunicipality(municipality) // "de", "da" or "do"

    const streetNumberString = streetNumber ? ` n. ${streetNumber}` : ''
    const localityString = locality ? `${locality}, ` : ''
    const municipalityString = prepositionOfMunicipality ? `município ${prepositionOfMunicipality} ` : ''

    return `${local}${streetNumberString}, ${localityString}${municipalityString}${municipality}`
  }

  function getMunicipality () {
    return $('#municipality').val() || ''
  }

  function getLocality () {
    return $('#locality').val() || ''
  }

  function getStreetName () {
    return $('#street').val() || ''
  }

  function getStreetNumber () {
    return $('#street_number').val() || ''
  }

  function getAuthority () {
    return $('#authority option:selected').text() || ''
  }

  /* ********************************************************************** */
  /* ******************* IS FORM CORRECTLY FILLED  ************************ */
  // returns true if all the fields and inputs in the form are filled in and ready to write the message
  function isMessageReady () {
    if (DEBUG) {
      return true
    }

    let to_break = false
    let error_string = ''
    let count = 0

    // loops through mandatory fields
    $('.mandatory').each(function () {
      const val = $(this).val()
      if (
        val == null ||
        val === undefined ||
        val === '' ||
        (val).length === 0 ||
        (val).replace(/^\s+|\s+$/g, '').length === 0
      ) {
        console.log('Error on #' + $(this).attr('id'))
        error_string += '- ' + $(this).attr('name') + '<br>'
        count++
        to_break = true
      }
    })

    console.log('#generate_message goes', to_break)
    if (to_break) {
      if (count === 1) {
        $.jAlert({
          title: 'Erro!',
          theme: 'red',
          content: 'Preencha o seguinte campo obrigatório:<br>' + error_string
        })
      } else {
        $.jAlert({
          title: 'Erro!',
          theme: 'red',
          content: 'Preencha os seguintes campos obrigatórios:<br>' + error_string
        })
      }
      return false
    }

    // detects if the tipo de ocorrência is correctly filled in
    if ($('#penalties').val().length === 0) {
      $.jAlert({
        title: 'Erro na Base Legal',
        theme: 'red',
        content: 'Insira pelo menos um tipo de ocorrência'
      })
      return false
    } else if ($('#penalties').val().length > 4) {
      $.jAlert({
        title: 'Erro na Base Legal',
        theme: 'red',
        content: 'Insira no máximo 4 tipos de ocorrência'
      })
      return false
    }

    // detects if the name is correctly filled in
    const Name = $('#name').val()
    if (!app.personalInfo.isFullNameOK(Name)) {
      $.jAlert({
        title: 'Erro no nome!',
        theme: 'red',
        content: 'Insira o nome completo.'
      })
      return false
    }

    /* if (!app.personalInfo.isPostalCodeOK()) {
      $.jAlert({
        title: 'Erro no Código Postal!',
        theme: 'red',
        content: 'Insira o Código Postal no formato XXXX-XXX'
      })
      return false
    } */

    // detects if the Portuguese car plate is correctly filled
    if (!app.functions.isThis_iOS() && !$('#free_plate').is(':checked') && !isCarPlateOK() && !DEBUG) {
      $.jAlert({
        title: 'Erro na matrícula!',
        theme: 'red',
        content: 'A matrícula que introduziu não é válida'
      })
      return false
    }

    // from here the inputs are correctly written

    if (app.photos.getPhotosUriOnFileSystem().length === 0) {
      $.jAlert({
        title: 'Erro nas fotos!',
        theme: 'red',
        content: 'Adicione pelo menos uma foto do veículo em causa'
      })
      return false
    }

    return true
  }

  /* ************** GENERAL FORM HANDLERS ******************* */
  // removes leading and trailing spaces on every text field "on focus out"
  $(':text').each(function (index) {
    $(this).focusout(function () {
      let text = $(this).val()
      text = $.trim(text)
      text = text.replace(/\s\s+/g, ' ') // removes consecutive spaces in-between
      $(this).val(text)
    })
  })

  /* *************************************************************************** */
  /* ********************* MAIN FORM HANDLERS ********************************** */

  /* ********************************************************************** */
  /* *********************** IMAGES/PHOTOS ******************************** */
  // buttons "Add Photo"
  $('#addImg_1, #addImg_2, #addImg_3, #addImg_4').on('click', function () {
    // get id, for example #remImg_2
    const id = $(this).attr('id')
    console.log('photo id: ' + id)
    // gets the number of the element, by obtaining the last character of the id
    const num = parseInt(id[id.length - 1])

    const callback = function (imgNmbr) {
      console.log(`Photo ${imgNmbr} added`)
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
  $('#remImg_1, #remImg_2, #remImg_3, #remImg_4').on('click', function () {
    // get id, for example #remImg_2
    const id = $(this).attr('id')
    // gets the number of the element, by obtaining the last character of the id
    const num = parseInt(id[id.length - 1])

    const imgId = 'myImg_' + num.toString()
    const imgElem = document.getElementById(imgId)
    imgElem.src = ''
    imgElem.style.display = 'none'

    app.photos.removeImage(num)

    $(this).hide()
    $('#addImg_' + num).html('<i class="fa fa-plus"></i>')

    updateImgContainers()
  })

  function displayImage (imgUri, imgNmbr) {
    // show button to edit/add photo and button to remove photo
    $('#addImg_' + imgNmbr.toString()).html('<i class="fa fa-edit"></i>')
    $('#remImg_' + imgNmbr.toString()).show()

    const imgId = 'myImg_' + imgNmbr.toString()
    const imgElem = document.getElementById(imgId)
    // show image
    imgElem.src = imgUri
    imgElem.style.display = 'block'
    // show also parent div
    const parentNode = imgElem.parentNode
    parentNode.style.display = 'block'

    updateImgContainers()
  }

  // function to add the [+] button on the next empty container
  function updateImgContainers () {
    const numberOfContainers = $('#image_selector .img-container').length
    // button to add photo for the next empty container
    let hasShownButton = false
    for (let i = 0; i < numberOfContainers; i++) {
      const $this = $('#image_selector .img-container').eq(i)
      if (!$this.find('img').attr('src')) {
        if (!hasShownButton) {
          console.log('show image container ' + (i + 1).toString())
          $this.show()
          hasShownButton = true
        } else {
          console.log('hide image container ' + (i + 1).toString())
          $this.hide()
        }
      } else {
        $this.show()
      }
    }
  }

  /* ********************************************************************** */
  /* *********************** VEHICLE PLATE ******************************** */
  $('#free_plate').change(function () {
    if (this.checked) {
      setAnyPlateFormat()
    } else {
      setPortuguesePlateInput()
    }
  })

  // matrícula estrangeira, matrículas da GNR, etc.
  function setAnyPlateFormat () {
    $('#plate').off('input', plateOnInput)
    $('#plate').attr('placeholder', '')
    $('#plate').removeClass('mandatory')
    $('#plate').attr('maxlength', '')
    $('#plate').css('border-color', '')
  }

  function setPortuguesePlateInput () {
    $('#plate').on('input', plateOnInput)
    $('#plate').attr('placeholder', 'XX\u2013XX\u2013XX')
    $('#plate').addClass('mandatory')
    $('#plate').attr('maxlength', '8')

    if (!isCarPlateOK() && !DEBUG) {
      $('#plate').css('border-color', 'red')
    } else {
      $('#plate').css('border-color', '')
    }
  }

  function plateOnInput () {
    $(this).val(function (index, value) {
      if (value.length < 8) { // length of XX-XX-XX
        return value.toUpperCase().replace(/\W/gi, '').replace(/(.{2})/g, '$1\u2013')
      } else {
        return value.toUpperCase().substr(0, 7) + value.toUpperCase().substr(7, 8).replace(/\W/gi, '')
      }
    })
    if (!isCarPlateOK()) {
      $(this).css('border-color', 'red')
    } else {
      $(this).css('border-color', '')
      fillCarMakeAndModelFromPlate($(this).val())
    }
  }

  // detects if the car plate is correctly filled in
  function isCarPlateOK () {
    const plateArray = $('#plate').val().split(/[-–—]/)
    return isArrayAValidPlate(plateArray)
  }

  // check if array is valid, p.e. ['AA','99','DD']
  function isArrayAValidPlate (arrayPlate) {
    const plateString = arrayPlate.join('-')
    // four valid plate types: AA-00-00, 00-00-AA, 00-AA-00, AA-00-AA
    // see: https://pt.stackoverflow.com/a/431398/101186
    const expr = RegExp(/(([A-Z]{2}-[0-9]{2}-[0-9]{2})|([0-9]{2}-[0-9]{2}-[A-Z]{2})|([0-9]{2}-[A-Z]{2}-[0-9]{2})|([A-Z]{2}-[0-9]{2}-[A-Z]{2}))$/)

    return expr.test(plateString)
  }

  let storedRequestedCarInfo // to avoid doing many successive requests for the same plate
  let requestGoingOn = false // to avoid parallel requests

  function fillCarMakeAndModelFromPlate (_plate) {
    if (!CARROS_MATRICULAS_API) {
      return
    }

    // avoid parallel requests
    if (requestGoingOn) {
      return
    } else {
      requestGoingOn = true
    }

    // replace all longdashes by normal dashes for the API
    const plate = _plate.replace(/\u2013/g, '-')

    if (plate === '00-XX-00') { // used in general debug
      return
    }

    if (storedRequestedCarInfo && plate === storedRequestedCarInfo.license_plate) {
      $('#carmake').val(storedRequestedCarInfo.manufacturer).trigger('input')
      $('#carmodel').val(storedRequestedCarInfo.model).trigger('input')
      requestGoingOn = false
    } else {
      // request from server
      console.log('Request car make/model from server to ' + plate)
      const requestUrl = CARROS_MATRICULAS_API.serverUrl + plate

      $.ajax({
        type: 'GET',
        url: requestUrl,
        dataType: 'json',
        headers: {
          'x-api-key': CARROS_MATRICULAS_API['x-api-key']
        },
        success: function (carInfo) {
          console.log(carInfo)
          if (!carInfo.error && carInfo.manufacturer) {
            storedRequestedCarInfo = carInfo
            $('#carmake').val(carInfo.manufacturer).trigger('input')
            $('#carmodel').val(carInfo.model).trigger('input')
          }
          requestGoingOn = false
        },
        error: function () {
          console.error('error requesting on: ' + requestUrl)
          requestGoingOn = false
        }
      })
    }
  }

  /* ********************************************************************** */
  /* ******************** CAR MAKE AND MODEL ****************************** */
  // Car Make and Car Model dealing with input
  // Car List and Models are got from www/js/res/car-list.js
  (function () {
    let prevValueCarmake = ''
    $('#carmake').on('input', function () {
      $(this).val(function (index, value) {
        if (!prevValueCarmake) {
          prevValueCarmake = value
        } else if (value.length < prevValueCarmake.length) { // backspace key
          prevValueCarmake = value
          return value
        }

        let brand
        for (let found = false, i = 0; i < CAR_LIST.length; i++) {
          // if 'value' is on the begining of the 'brand'
          if (CAR_LIST[i].brand.indexOf(value) === 0) {
            if (found) {
              prevValueCarmake = value
              return value
            }
            brand = CAR_LIST[i].brand
            found = true
          }
        }
        // just found one
        const strToReturn = prevValueCarmake = brand || value
        return strToReturn
      })
    })

    let prevValueCarmodel = ''
    $('#carmodel').on('input', function () {
      $(this).val(function (index, value) {
        if (!prevValueCarmodel) {
          prevValueCarmodel = value
        } else if (value.length < prevValueCarmodel.length) { // backspace key
          prevValueCarmodel = value
          return value
        }

        let i; let models = []
        let found = false

        // is the brand on #carmake valid?
        for (i = 0; i < CAR_LIST.length; i++) {
          if (CAR_LIST[i].brand.toLowerCase().trim() === $('#carmake').val().toLowerCase().trim()) {
            models = CAR_LIST[i].models
            found = true
            break
          }
        }

        if (!found) {
          prevValueCarmodel = value
          return value
        }

        // finding carmodel
        // user input may be "As" which matches "Astra", "Astra cabrio" or "Astra caravan"
        // therefore gets common string, it should return "Astra"
        const foundModels = []
        for (i = 0; i < models.length; i++) {
          // if 'value' is on the begining of the 'model'
          if (models[i].indexOf(value) === 0) {
            foundModels.push(models[i])
          }
        }
        if (foundModels.length === 0) {
          prevValueCarmodel = value
          return value
        } else {
          // longest common starting substring in the array models
          // with ["Astra", "Astra cabrio", "Astra caravan"] returns "Astra"
          const A = foundModels.concat().sort()

          const a1 = A[0]; const a2 = A[A.length - 1]; const L = a1.length; i = 0
          while (i < L && a1.charAt(i) === a2.charAt(i)) i++

          const strToReturn = prevValueCarmodel = a1.substring(0, i)
          return strToReturn
        }
      })
    })
  }())

  $('#carmake').on('input', function () {
    if ($(this).val() === '' && !DEBUG) {
      $(this).css('border-color', 'red')
    } else {
      $(this).css('border-color', '')
    }
  })

  $('#carmodel').on('input', function () {
    if ($(this).val() === '' && !DEBUG) {
      $(this).css('border-color', 'red')
    } else {
      $(this).css('border-color', '')
    }
  })

  /* ********************************************************************** */
  /* ********************* DATE OF OCCURRENCE ***************************** */
  $.datepicker.setDefaults({
    dateFormat: 'dd-mm-yy',
    dayNamesMin: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    monthNames: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
  })
  $('#date').datepicker()

  $('#date, #time').on('input keyup keypress focusout', function () {
    if ($(this).val() === '' && !DEBUG) {
      $(this).css('border-color', 'red')
    } else {
      $(this).css('border-color', '')
    }
  })

  /* ********************************************************************** */
  /* ********************* LOCAL OF OCCURRENCE **************************** */
  $('#locality, #municipality').on('input', function () {
    if ($(this).val() === '' && !DEBUG) {
      $(this).css('border-color', 'red')
    } else {
      $(this).css('border-color', '')
    }
  })

  $('#locality, #municipality').on('focusout', function () {
    app.localization.getAuthoritiesFromAddress()
  })

  $('#street').on('input', function () {
    if ($(this).val() === '' && !DEBUG) {
      $(this).css('border-color', 'red')
    } else {
      $(this).css('border-color', '')
    }
  })

  /* Pull to Refresh function */
  function initPullToRefresh () {
    const pStart = { x: 0, y: 0 }
    const pStop = { x: 0, y: 0 }

    function swipeStart (e) {
      if (typeof e.targetTouches !== 'undefined') {
        const touch = e.targetTouches[0]
        pStart.x = touch.screenX
        pStart.y = touch.screenY
      } else {
        pStart.x = e.screenX
        pStart.y = e.screenY
      }
    }

    function swipeEnd (e) {
      if (typeof e.changedTouches !== 'undefined') {
        const touch = e.changedTouches[0]
        pStop.x = touch.screenX
        pStop.y = touch.screenY
      } else {
        pStop.x = e.screenX
        pStop.y = e.screenY
      }

      swipeCheck()
    }

    function swipeCheck () {
      const changeY = pStart.y - pStop.y
      const changeX = pStart.x - pStop.x
      if (isPullDown(changeY, changeX)) {
        // user has pulled to refresh
        app.functions.updateDateAndTime()
        app.localization.getGeolocation()
      }
    }

    function isPullDown (dY, dX) {
      // methods of checking slope, length, direction of line created by swipe action
      return (
        dY < 0 &&
        ((Math.abs(dX) <= 100 && Math.abs(dY) >= 300) ||
          (Math.abs(dX) / Math.abs(dY) <= 0.3 && dY >= 60))
      )
    }

    document.addEventListener(
      'touchstart',
      function (e) {
        swipeStart(e)
      },
      false
    )
    document.addEventListener(
      'touchend',
      function (e) {
        swipeEnd(e)
      },
      false
    )
  }

  /* spinner */
  function startSpinner () {
    $('#getCurrentAddresBtn').removeClass('btn btn-primary').addClass('spinner-border text-primary')
  }
  function stopSpinner () {
    $('#getCurrentAddresBtn').removeClass('spinner-border text-primary').addClass('btn btn-primary')
  }

  thisModule.init = init
  /* === Public methods to be returned === */
  /* === Form field fetching functions === */
  thisModule.getCarPlate = getCarPlate
  thisModule.getCarMake = getCarMake
  thisModule.getCarModel = getCarModel
  thisModule.getDateYYYY_MM_DD = getDateYYYY_MM_DD
  thisModule.getTimeHH_MM = getTimeHH_MM
  thisModule.getPrepositionOfMunicipality = getPrepositionOfMunicipality
  thisModule.getFullAddress = getFullAddress
  thisModule.getLocality = getLocality
  thisModule.getStreetName = getStreetName
  thisModule.getStreetNumber = getStreetNumber
  thisModule.getAuthority = getAuthority
  /* ======================================== */
  thisModule.isMessageReady = isMessageReady
  thisModule.setPortuguesePlateInput = setPortuguesePlateInput
  thisModule.isArrayAValidPlate = isArrayAValidPlate
  /* ======================================== */
  thisModule.startSpinner = startSpinner
  thisModule.stopSpinner = stopSpinner
  thisModule.displayImage = displayImage

  return thisModule
})(app.form || {})
