/* eslint camelcase: off */

/* global app, $, fetch, DEBUG */

app.personalInfo = (function (thisModule) {
  function init () {
    const typeOfUser = window.localStorage.getItem('typeOfUser')
    if (typeOfUser === 'citizen') {
      $('#userIsCitizen').prop('checked', true).trigger('change')
    } else if (typeOfUser === 'policeOfficer') {
      $('#userIsPoliceOfficer').prop('checked', true).trigger('change')
    } else {
      console.warn('No valid typeOfUser stored in device local storage:' + typeOfUser)
      $('#userIsCitizen').prop('checked', true).trigger('change') // default
    }

    loadsPersonalInfo()
  }

  // populates personal in fields information if available in storage
  function loadsPersonalInfo () {
    $('.personal_info').each(function () {
      const id = $(this).attr('id')
      const value = window.localStorage.getItem(id)
      if (value) {
        $(this).val(value)
      }
    })
  }

  // save to storage for later usage on every select
  $('select.personal_info').each(function () {
    $(this).on('change', function () {
      const id = $(this).attr('id')
      console.log(id)
      const value = $(this).val()
      window.localStorage.setItem(id, value)
    })
  })

  // save to storage for later usage on every "focus out" of text input fields
  $('input.personal_info').each(function () {
    $(this).on('focusout', function () {
      const id = $(this).attr('id')
      console.log(id)
      let value = $(this).val().trim()
      value = value.replace(/\s\s+/g, ' ') // removes consecutive spaces in-between
      window.localStorage.setItem(id, value)

      $('button#save_personal_data').show(300).hide(900)
    })
  })

  /* ********************************************************************** */
  /* ******************** NAME OF THE USER ******************************** */
  // as the user writes his name, detects if the name is ok
  $('#name').on('input', function () {
    if (!isFullNameOK($(this).val()) && !DEBUG) {
      $(this).css('border-color', 'red')
    } else {
      $(this).css('border-color', '')
    }
  })

  // detects if user has inserted full name
  function isFullNameOK (fullName) {
    // removes all non-alphabetic characters
    let name = fullName.replace(/[^a-zA-Z ]/g, '')
    // removes consecutive spaces in-between
    name = name.replace(/\s\s+/g, ' ')

    // trims leading and trailing spaces
    name = $.trim(name)

    // gets the number of words / names
    const name_array = name.split(' ')
    let number_of_names = name_array.length

    // disconsider small particles which are not a name
    let el
    for (const i in name_array) {
      el = name_array[i]
      if (el === 'dos' || el === 'da' || el === 'do' || el === 'das') {
        number_of_names--
      }
    }

    console.log('Number of relevant names: ', number_of_names)
    // if user inserted only 1 or 2 words, it didn't inserted full name, as demanded
    if (number_of_names <= 1) {
      return false
    }

    return true
  }

  /* ********************************************************************** */
  /* ************************* EMAIL ************************************** */
  $('#email').on('input', function () {
    if (!validateEmail($(this).val()) && !DEBUG) {
      $(this).css('border-color', 'red')
    } else {
      $(this).css('border-color', '')
    }
  })

  /* ********************************************************************** */
  /* ******************** ID NUMBER OF THE USER *************************** */
  $('#id_number').on('input', function () {
    if ($(this).val() === '' && !DEBUG) {
      $(this).css('border-color', 'red')
    } else {
      $(this).css('border-color', '')
    }
  })

  /* ********************************************************************** */
  /* ******************** ADDRESS OF THE USER ***************************** */
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

  // as the user writes Postal Code, detects if the name is ok
  $('#postal_code').on('input', function () {
    if (!isPostalCodeOK()) {
      $(this).css('border-color', 'red')
    } else {
      $(this).css('border-color', '')
      // postal code is OK, get now locality/city from postal code
      fetch(`${app.main.urls.geoApi.ptApi}/cp/${$('#postal_code').val()}?json=1`)
        .then(r => r.json())
        .then(res => {
          if (res.Localidade) {
            $('#address_city').val(res.Localidade)
              .trigger('input').trigger('input')
          }
        })
    }

    $(this).val(function (index, value) {
      if (value.length < 8) { // length of 0000-000
        return value.toUpperCase().replace(/[^0-9]/g, '').replace(/(.{4})/g, '$1\u2013')
      } else {
        return value.toUpperCase().substr(0, 7) + value.toUpperCase().substr(7, 8).replace(/[^0-9]/g, '')
      }
    })
  })

  // detects if the postal code is correctly filled in
  function isPostalCodeOK () {
    let plate_str = $('#postal_code').val()

    plate_str = $.trim(plate_str)

    if (plate_str.length !== 8) {
      return false
    }

    plate_str = plate_str.replace(/\u2013|\u2014/g, '-') // it replaces all &ndash; (–) and &mdash; (—) symbols with simple dashes (-)

    // regex format for 0000-000 or 0000 000
    // http://stackoverflow.com/questions/2577236/regex-for-zip-code
    if (plate_str.match(/^\d{4}(?:[-\s]\d{3})?$/)) {
      return true
    } else {
      return false
    }
  }

  /* ********************************************************************** */
  /* ******************** TYPE OF USER ************************************ */
  $('input[type=radio][name="typeOfUser"]').on('change', function () {
    const typeOfUser = this.value
    if (typeOfUser === 'citizen') {
      $('.citizenDiv').show()
      $('.policeOfficer').hide()
      window.localStorage.setItem('typeOfUser', 'citizen')
    } else if (typeOfUser === 'policeOfficer') {
      $('.policeOfficer').show()
      $('.citizenDiv').hide()
      window.localStorage.setItem('typeOfUser', 'policeOfficer')
    } else {
      console.error('Wrong type of user ' + typeOfUser)
    }
  })

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
  }

  thisModule.init = init
  thisModule.isFullNameOK = isFullNameOK
  // thisModule.isPostalCodeOK = isPostalCodeOK

  return thisModule
})(app.personalInfo || {})
