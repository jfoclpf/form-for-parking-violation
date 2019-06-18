/* eslint camelcase: off */

/* global app, $ */

app.sidebar = (function (thisModule) {
  function init () {
    $('#sidebarCollapse').on('click', function () {
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
      $('#content').fadeTo(200, 0.3).find('*').prop('disabled', true)
      $('#sidebar').css('box-shadow', '10px 1px 0.5rem rgba(0,0,0,0.5)')
    } else {
      $('#content').fadeTo(200, 1).find('*').prop('disabled', false)
      $('#sidebar').css('box-shadow', '')
    }

    // breaks the event chain
    return false
  }

  /* === Public methods to be returned === */
  thisModule.init = init
  thisModule.toggleSidebar = toggleSidebar

  return thisModule
})(app.sidebar || {})
