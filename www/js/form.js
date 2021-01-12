/* eslint camelcase: off */

/* global app, $, CAR_LIST, DEBUG, CARROS_MATRICULAS_API */

app.form = (function (thisModule) {
  /* ********************************************************************** */
  /* ******************* FORM FIELDS FETCHING FUNCTIONS ******************* */
  // get carplate
  function getCarPlate () {
    var plate_str = $('#plate').val()
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

  function getFullAddress () {
    const streetNumber = getStreetNumber()
    if (streetNumber) {
      return `${getStreetName()} n. ${streetNumber}, ${getLocality()}`
    } else {
      return `${getStreetName()}, ${getLocality()}`
    }
  }

  function getLocality () {
    return $('#locality').val()
  }

  function getStreetName () {
    return $('#street').val()
  }

  function getStreetNumber () {
    return $('#street_number').val() ? $('#street_number').val() : ''
  }

  function getAuthority () {
    return $('#authority option:selected').text()
  }

  /* ********************************************************************** */
  /* ******************* IS FORM CORRECTLY FILLED  ************************ */
  // returns true if all the fields and inputs in the form are filled in and ready to write the message
  function isMessageReady () {
    if (DEBUG) {
      return true
    }

    var to_break = false
    var error_string = ''
    var count = 0

    // loops through mandatory fields
    $('.mandatory').each(function () {
      var val = $(this).val()
      if (val == null || val === undefined || val === '' || (val).length === 0 || (val).replace(/^\s+|\s+$/g, '').length === 0) {
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

    // detects if the name is correctly filled in
    var Name = $('#name').val()
    if (!app.personalInfo.isFullNameOK(Name) && !DEBUG) {
      $.jAlert({
        title: 'Erro no nome!',
        theme: 'red',
        content: 'Insira o nome completo.'
      })
      return false
    }

    if (!app.personalInfo.isPostalCodeOK() && !DEBUG) {
      $.jAlert({
        title: 'Erro no Código Postal!',
        theme: 'red',
        content: 'Insira o Código Postal no formato XXXX-XXX'
      })
      return false
    }

    // detects if the Portuguese car plate is correctly filled
    if (!$('#free_plate').is(':checked') && !isCarPlateOK() && !DEBUG) {
      $.jAlert({
        title: 'Erro na matrícula!',
        theme: 'red',
        content: 'A matrícula que introduziu não é válida'
      })
      return false
    }

    // from here the inputs are correctly written

    if (app.photos.getImagesArray().length === 0) {
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
      var text = $(this).val()
      text = $.trim(text)
      text = text.replace(/\s\s+/g, ' ') // removes consecutive spaces in-between
      $(this).val(text)
    })
  })

  /* *************************************************************************** */
  /* ********************* MAIN FORM HANDLERS ********************************** */

  /* ********************************************************************** */
  /* *********************** IMAGES/PHOTOS ******************************** */
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
    $('#plate').unbind('input', plateOnInput)
    $('#plate').attr('placeholder', '')
    $('#plate').removeClass('mandatory')
    $('#plate').attr('maxlength', '')
    $('#plate').css('border-color', '')
  }

  function setPortuguesePlateInput () {
    $('#plate').bind('input', plateOnInput)
    $('#plate').attr('placeholder', 'XX\u2013XX\u2013XX')
    $('#plate').addClass('mandatory')
    $('#plate').attr('maxlength', '8')

    if (!isCarPlateOK() && !DEBUG) {
      $('#plate').css('border-color', 'red')
    } else {
      $('#plate').css('border-color', '')
    }
  }

  $('#plate').bind('input', plateOnInput)

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
    var plateArray = $('#plate').val().split(/[-–—]/)
    return isArrayAValidPlate(plateArray)
  }

  // check if array is valid, p.e. ['AA','99','DD']
  function isArrayAValidPlate (arrayPlate) {
    var plateString = arrayPlate.join('-')
    // four valid plate types: AA-00-00, 00-00-AA, 00-AA-00, AA-00-AA
    // see: https://pt.stackoverflow.com/a/431398/101186
    var expr = RegExp(/(([A-Z]{2}-[0-9]{2}-[0-9]{2})|([0-9]{2}-[0-9]{2}-[A-Z]{2})|([0-9]{2}-[A-Z]{2}-[0-9]{2})|([A-Z]{2}-[0-9]{2}-[A-Z]{2}))$/)

    return expr.test(plateString)
  }

  var storedRequestedCarInfo // to avoid doing many successive requests for the same plate
  var requestGoingOn = false // to avoid parallel requests

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
    var plate = _plate.replace(/\u2013/g, '-')

    if (plate === '00-XX-00') { // used in general debug
      return
    }

    if (storedRequestedCarInfo && plate === storedRequestedCarInfo.license_plate) {
      $('#carmake').val(storedRequestedCarInfo.manufacturer).trigger('input')
      $('#carmodel').val(storedRequestedCarInfo.model).trigger('input')
      requestGoingOn = false
    } else {
      // request from server
      var requestUrl = CARROS_MATRICULAS_API.serverUrl + plate

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
    var prevValueCarmake = ''
    $('#carmake').on('input', function () {
      $(this).val(function (index, value) {
        if (!prevValueCarmake) {
          prevValueCarmake = value
        } else if (value.length < prevValueCarmake.length) { // backspace key
          prevValueCarmake = value
          return value
        }

        var brand
        for (var found = false, i = 0; i < CAR_LIST.length; i++) {
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
        var strToReturn = prevValueCarmake = brand || value
        return strToReturn
      })
    })

    var prevValueCarmodel = ''
    $('#carmodel').on('input', function () {
      $(this).val(function (index, value) {
        if (!prevValueCarmodel) {
          prevValueCarmodel = value
        } else if (value.length < prevValueCarmodel.length) { // backspace key
          prevValueCarmodel = value
          return value
        }

        var i; var models = []
        var found = false

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
        var foundModels = []
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
          var A = foundModels.concat().sort()

          var a1 = A[0]; var a2 = A[A.length - 1]; var L = a1.length; i = 0
          while (i < L && a1.charAt(i) === a2.charAt(i)) i++

          var strToReturn = prevValueCarmodel = a1.substring(0, i)
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

  /* ********************************************************************** */
  /* ********************* LOCAL OF OCCURRENCE **************************** */
  $('#locality').on('input', function () {
    if ($(this).val() === '' && !DEBUG) {
      $(this).css('border-color', 'red')
    } else {
      $(this).css('border-color', '')
    }
  })

  $('#locality').focusout(function () {
    app.localization.getAuthoritiesFromAddress()
  })

  $('#street').on('input', function () {
    if ($(this).val() === '' && !DEBUG) {
      $(this).css('border-color', 'red')
    } else {
      $(this).css('border-color', '')
    }
  })

  $('#street_number').on('input', function () {
    if ($(this).val() === '' && !DEBUG) {
      $(this).css('border-color', 'red')
    } else {
      $(this).css('border-color', '')
    }
  })

  /* === Public methods to be returned === */
  /* === Form field fetching functions === */
  thisModule.getCarPlate = getCarPlate
  thisModule.getCarMake = getCarMake
  thisModule.getCarModel = getCarModel
  thisModule.getDateYYYY_MM_DD = getDateYYYY_MM_DD
  thisModule.getTimeHH_MM = getTimeHH_MM
  thisModule.getFullAddress = getFullAddress
  thisModule.getLocality = getLocality
  thisModule.getStreetName = getStreetName
  thisModule.getStreetNumber = getStreetNumber
  thisModule.getAuthority = getAuthority
  /* ======================================== */
  thisModule.isMessageReady = isMessageReady
  thisModule.setPortuguesePlateInput = setPortuguesePlateInput
  thisModule.isArrayAValidPlate = isArrayAValidPlate

  return thisModule
})(app.form || {})
