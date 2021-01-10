/* eslint camelcase: off */

/* global app, cordova, $ */

app.sidebar = (function (thisModule) {
  function init () {
    $('#sidebarCollapse').on('click', function (e) {
      toggleSidebar()
      return false
    })

    $('#content').click(function () {
      if ($('#sidebar').hasClass('active')) {
        toggleSidebar(false)
        // breaks the event chain
        return false
      }
    })

    // populates urls
    $('a.aderir_url').attr('href', app.main.urls.Chave_Movel_Digital.aderir)
    $('a.a_minha_area_url').attr('href', app.main.urls.Chave_Movel_Digital.a_minha_area)
    $('a.assinar_pdf_url').attr('href', app.main.urls.Chave_Movel_Digital.assinar_pdf)
    $('a.app_url').attr('href', app.main.urls.Chave_Movel_Digital.app)

    // opens http links with system browser
    $('a[href]').click(function (event) {
      var href = $(this).attr('href')
      if (href.startsWith('https://') || href.startsWith('http://')) {
        event.preventDefault()

        cordova.InAppBrowser.open(href, '_system')
      }
    })

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
      showSection('map_section')
      app.sidebar.toggleSidebar(false)

      // this must be here on the last line,
      // because `$('#map_view_select').val()` returns null before Sidebar is hidden
      app.map.tryToShowMap($('#map_view_select').val())
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

    $('#privacy_policy_shows').click(function () {
      showSection('privacy_policy')
      app.sidebar.toggleSidebar(false)
    })
  }

  function showSection (sectionId) {
    $('.section').not('#' + sectionId).hide()
    $('#' + sectionId).show()

    // when the user clicks on the map section on the sidebar, shows different header
    if (sectionId === 'map_section') {
      $('#header_title').hide()
      $('#header_for_map').show()
    } else {
      $('#header_title').show()
      $('#header_for_map').hide()
    }

    // hides sidebar
    $('#sidebar').toggleClass('active', false)
  }

  // staus undefined - togle sidebar
  // status true     - activates sidebar
  // status false    - deactivates sidebar
  function toggleSidebar (status) {
    if (typeof status !== 'boolean') {
      $('#sidebar').toggleClass('active')
    } else if (status) {
      $('#sidebar').addClass('active')
    } else {
      $('#sidebar').removeClass('active')
    }

    if ($('#sidebar').hasClass('active')) {
      $('#content').stop(true, true).fadeTo(200, 0.3).find('*').prop('disabled', true)
    } else {
      $('#content').stop(true, true).fadeTo(200, 1).find('*').prop('disabled', false)
    }

    // for touch screens detects when the user slides the sidebar with the finger
    (function () {
      var ts
      var wrapper = document.getElementsByClassName('wrapper')[0]

      wrapper.addEventListener('touchstart', function (e) {
        if ($('#sidebar').hasClass('active')) {
          ts = e.changedTouches[0].clientX
        }
      }, { passive: true })

      wrapper.addEventListener('touchend', function (e) {
        if ($('#sidebar').hasClass('active')) {
          var te = e.changedTouches[0].clientX
          if (ts > te + 5) {
            // console.log('slided left')
            toggleSidebar(false)
          } else if (ts < te - 5) {
            // console.log('slided right')
          }
        }
      }, { passive: true })

      wrapper.addEventListener('touchmove', function (e) {
        if ($('#sidebar').hasClass('active')) {
          e.stopImmediatePropagation()
        }
      }, { passive: false })
    }())

    // breaks the event chain
    return false
  }

  /* === Public methods to be returned === */
  thisModule.init = init
  thisModule.toggleSidebar = toggleSidebar
  thisModule.showSection = showSection

  return thisModule
})(app.sidebar || {})
