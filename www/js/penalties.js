/* eslint camelcase: off */

/* global app, cordova, $ */

app.penalties = (function (thisModule) {
  let penalties // Object with the several penalties

  function init (callback) {
    app.file.getFileContent(cordova.file.applicationDirectory + 'www/json/penalties.json', 'text', function (err, res) {
      if (err) {
        console.error(err)
        return
      }

      const data = JSON.parse(res)
      delete data.__comment
      penalties = Object.assign({}, data) // clone object

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
      // add some css attributes to selectpicker
      $('[data-id="penalties"]')
        .css({
          'white-space': 'normal',
          'background-color': 'white',
          border: '1px solid #ced4da'
        })

      callback()
    })
  }

  function getPenalties () {
    return penalties
  }

  function getSelectedPenaltyCode () {
    return $('#penalties').val()
  }

  function getData (penaltyCode, propertyParam) {
    let property // from the object penalties in penalties.json
    switch (propertyParam) {
      case 'shortDescription':
        property = 'select'
        break
      case 'description':
        property = 'description'
        break
      case 'lawArticle':
        property = 'law_article'
        break
      default:
        throw Error('wrong property: ' + propertyParam)
    }

    // in case of several penalty codes, they are separated by semicolon
    // for ex.: 'na_passadeira' or 'na_passadeira;passeios'
    const codes = penaltyCode.split(';')

    let text = ''
    for (let i = 0; i < codes.length; i++) {
      text += codes[i] in penalties ? penalties[codes[i]][property] : ''
      if (i < codes.length - 2) {
        text += '; '
      } else if (i === codes.length - 2) {
        text += '; e '
      }
    }
    return text
  }

  /* === Public methods to be returned === */
  thisModule.init = init
  thisModule.getPenalties = getPenalties
  thisModule.getSelectedPenaltyCode = getSelectedPenaltyCode
  thisModule.getData = getData

  return thisModule
})(app.penalties || {})
