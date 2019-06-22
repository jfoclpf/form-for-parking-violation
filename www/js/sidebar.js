/* eslint camelcase: off */

/* global app, $ */

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
          e.preventDefault()
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

  return thisModule
})(app.sidebar || {})
