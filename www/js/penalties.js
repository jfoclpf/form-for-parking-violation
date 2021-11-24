/* eslint no-var: off */
/* eslint camelcase: off */

/* global app, cordova, $ */

app.penalties = (function (thisModule) {
  var penalties // Object with the several penalties

  function init () {
    $.getJSON(cordova.file.applicationDirectory + 'www/json/penalties.json', function (data) {
      delete data.__comment
      penalties = Object.assign({}, data) // clone object

      $('#penalties').append('<option></option>') // first empty option

      // populates select with options from penalties.json
      for (const key of Object.keys(penalties)) {
        $('#penalties').append(
          `<option label="${penalties[key].select}" value="${key}">` +
            `${penalties[key].select}` +
          '</option>'
        )
        if (app.functions.isThis_iOS()) {
          $('#penalties').append('<optgroup label=""></optgroup>')
        }
      }

      $('#penalties').selectpicker()
    })
  }

  function getPenalties () {
    return penalties
  }

  function getSelectedPenaltyCode () {
    return $('#penalties').val()
  }

  function getShortDescription (code) {
    for (const key in penalties) {
      if (key === code) {
        return penalties[key].select
      }
    }
  }

  function getDescription (code) {
    for (const key in penalties) {
      if (key === code) {
        return penalties[key].description
      }
    }
  }

  function getLawArticle (code) {
    for (const key in penalties) {
      if (key === code) {
        return penalties[key].law_article
      }
    }
  }

  /* === Public methods to be returned === */
  thisModule.init = init
  thisModule.getPenalties = getPenalties
  thisModule.getSelectedPenaltyCode = getSelectedPenaltyCode
  thisModule.getShortDescription = getShortDescription
  thisModule.getDescription = getDescription
  thisModule.getLawArticle = getLawArticle

  return thisModule
})(app.penalties || {})
