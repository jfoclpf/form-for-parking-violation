/* eslint camelcase: off */

/* global app, $, CAR_LIST, DEBUG, CARROS_MATRICULAS_API */

app.form = (function (thisModule) {
  // date field
  $.datepicker.setDefaults({
    dateFormat: 'dd-mm-yy',
    dayNamesMin: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    monthNames: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
  })
  $('#date').datepicker()

  // populates personal in fields information if available in storage
  function loadsPersonalInfo () {
    $('.personal_info').each(function () {
      var id = $(this).attr('id')
      var value = window.localStorage.getItem(id)
      if (value) {
        $(this).val(value)
      }
    })
  }

  function showSection (sectionId) {
    $('.section').not('#' + sectionId).hide()
    $('#' + sectionId).show()
    $('#sidebar').toggleClass('active', false)
  }

  $('#personal_data_show').click(function () {
    showSection('personal_data')
    app.sidebar.toggleSidebar(false)
  })

  $('#historic_show').click(function () {
    app.historic.updateHistoric()
    showSection('historic')
    app.sidebar.toggleSidebar(false)
  })

  $('#map_section_show').click(function () {
    app.map.tryToShowMap()
    showSection('map_section')
    app.sidebar.toggleSidebar(false)
  })

  $('#form_show').click(function () {
    showSection('main_form')
    app.sidebar.toggleSidebar(false)
  })

  $('#legal_basis_show').click(function () {
    showSection('legal_basis')
    app.sidebar.toggleSidebar(false)
  })

  $('#cmd_how_it_works_show').click(function () {
    showSection('cmd_how_it_works')
    app.sidebar.toggleSidebar(false)
  })

  $('#cmd_legal_basis_shows').click(function () {
    showSection('cmd_legal_basis')
    app.sidebar.toggleSidebar(false)
  })

  // removes leading and trailing spaces on every text field "on focus out"
  $(':text').each(function (index) {
    $(this).focusout(function () {
      var text = $(this).val()
      text = $.trim(text)
      text = text.replace(/\s\s+/g, ' ') // removes consecutive spaces in-between
      $(this).val(text)
    })
  })

  // save to storage for later usage on every select
  $('select.personal_info').each(function () {
    $(this).on('change', function () {
      var id = $(this).attr('id')
      console.log(id)
      var value = $(this).val()
      window.localStorage.setItem(id, value)
    })
  })

  // save to storage for later usage on every "focus out" of text input fields
  $('input.personal_info').each(function () {
    $(this).focusout(function () {
      var id = $(this).attr('id')
      console.log(id)
      var value = $(this).val()
      value = $.trim(value)
      value = value.replace(/\s\s+/g, ' ') // removes consecutive spaces in-between
      window.localStorage.setItem(id, value)

      $('button#save_personal_data').show(300).hide(900)
    })
  })

  // as the user writes Postal Code, detects if the name is ok
  $('#postal_code').on('input', function () {
    if (!app.functions.isPostalCodeOK()) {
      $(this).css('border-color', 'red')
    } else {
      $(this).css('border-color', '')
    }

    $(this).val(function (index, value) {
      if (value.length < 8) { // length of 0000-000
        return value.toUpperCase().replace(/[^0-9]/g, '').replace(/(.{4})/g, '$1\u2013')
      } else {
        return value.toUpperCase().substr(0, 7) + value.toUpperCase().substr(7, 8).replace(/[^0-9]/g, '')
      }
    })
  })

  function setPortuguesePlateInput () {
    $('#plate').bind('input', plateOnInput)
    $('#plate').attr('placeholder', 'XX\u2013XX\u2013XX')
    $('#plate').addClass('mandatory')
    $('#plate').attr('maxlength', '8')

    if (!app.functions.isCarPlateOK() && !DEBUG) {
      $('#plate').css('border-color', 'red')
    } else {
      $('#plate').css('border-color', '')
    }
  }

  // matrícula estrangeira, matrículas da GNR, etc.
  function setAnyPlateFormat () {
    $('#plate').unbind('input', plateOnInput)
    $('#plate').attr('placeholder', '')
    $('#plate').removeClass('mandatory')
    $('#plate').attr('maxlength', '')
    $('#plate').css('border-color', '')
  }

  $('#free_plate').change(function () {
    if (this.checked) {
      setAnyPlateFormat()
    } else {
      setPortuguesePlateInput()
    }
  });

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

  $('#id_number').on('input', function () {
    if ($(this).val() === '' && !DEBUG) {
      $(this).css('border-color', 'red')
    } else {
      $(this).css('border-color', '')
    }
  })

  $('#address').on('input', function () {
    if ($(this).val() === '' && !DEBUG) {
      $(this).css('border-color', 'red')
    } else {
      $(this).css('border-color', '')
    }
  })

  $('#address_city').on('input', function () {
    if ($(this).val() === '' && !DEBUG) {
      $(this).css('border-color', 'red')
    } else {
      $(this).css('border-color', '')
    }
  })

  $('#plate').bind('input', plateOnInput)

  function plateOnInput () {
    $(this).val(function (index, value) {
      if (value.length < 8) { // length of XX-XX-XX
        return value.toUpperCase().replace(/\W/gi, '').replace(/(.{2})/g, '$1\u2013')
      } else {
        return value.toUpperCase().substr(0, 7) + value.toUpperCase().substr(7, 8).replace(/\W/gi, '')
      }
    })
    if (!app.functions.isCarPlateOK()) {
      $(this).css('border-color', 'red')
    } else {
      $(this).css('border-color', '')
      fillCarMakeAndModelFromPlate($(this).val())
    }
  }

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

  var storedRequestedCarInfo // to avoid doing many successive requests for the same plate
  var requestGoingOn = false // to avoid parallel requests

  function fillCarMakeAndModelFromPlate (_plate) {
    // avoid parallel requests
    if (requestGoingOn) {
      return
    } else {
      requestGoingOn = true
    }

    // replace longdash by normal dash for the API
    var plate = _plate.replaceAll('\u2013', '-')

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

  /* === Public methods to be returned === */
  thisModule.loadsPersonalInfo = loadsPersonalInfo
  thisModule.setPortuguesePlateInput = setPortuguesePlateInput
  thisModule.showSection = showSection

  return thisModule
})(app.form || {})
