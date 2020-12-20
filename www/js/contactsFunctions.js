/* Module that deals with the contacts stored in module contacts.js */

/* global app, $ */

app.contactsFunctions = (function (thisModule) {
  // fullName pattern is: authorityShort + ' - ' + nome
  function getEmailByFullName (fullName) {
    if (fullName === 'Polícia de Segurança Pública - Geral') {
      return 'contacto@psp.pt'
    }

    if (fullName === 'GNR - Comando Geral') {
      return 'gnr@gnr.pt'
    }

    // fullName pattern is: authorityShort + ' - ' + nome
    const authorityShort = fullName.split('-')[0].trim()
    // nome can have also dashes (-), thus gets the remainder from the first dash
    const nome = fullName.slice(fullName.indexOf('-') + 1).trim()

    switch (authorityShort) {
      case 'Polícia Municipal':
        for (let i = 0; i < app.contacts.PM_Contacts.length; i++) {
          if (app.contacts.PM_Contacts[i].nome === nome) {
            return app.contacts.PM_Contacts[i].contacto
          }
        }
        console.error('Could not find email of authority from ' + fullName)
        break
      case 'GNR':
        for (let i = 0; i < app.contacts.GNR_Contacts.length; i++) {
          if (app.contacts.GNR_Contacts[i].nome === nome) {
            return app.contacts.GNR_Contacts[i].contacto
          }
        }
        console.error('Could not find email of authority from ' + fullName)
        break
      case 'PSP':
        for (let i = 0; i < app.contacts.PSP_Contacts.length; i++) {
          if (app.contacts.PSP_Contacts[i].nome === nome) {
            return app.contacts.PSP_Contacts[i].contacto
          }
        }
        console.error('Could not find email of authority from ' + fullName)
        break
      default:
        console.error('Could not find email of authority from ' + fullName)
    }
  }

  // try to get PM (Policia Municipal) contacts based on name of municipality
  // geoNames is an array with possible names for the area
  function getPMcontacts (geoNames) {
    var PMrelevantContacts = []
    var municipalityName
    var toAddBool

    for (var key in app.contacts.PM_Contacts) {
      municipalityName = app.contacts.PM_Contacts[key].nome

      toAddBool = false
      for (var key2 in geoNames) {
        toAddBool = toAddBool || doStringsOverlap(geoNames[key2], municipalityName)
      }

      if (toAddBool) {
        var PMrelevantContact = {
          authority: 'Polícia Municipal',
          authorityShort: 'Polícia Municipal',
          nome: app.contacts.PM_Contacts[key].nome,
          contacto: app.contacts.PM_Contacts[key].contacto
        }
        PMrelevantContacts.push(PMrelevantContact)
      }
    }

    return PMrelevantContacts
  }

  // try to get GNR contacts based on name of municipality and locality
  // geoNames is an array with possible names for the area
  function getGNRcontacts (geoNames) {
    var GNRrelevantContacts = []
    var municipalityName
    var toAddBool

    for (var key in app.contacts.GNR_Contacts) {
      municipalityName = app.contacts.GNR_Contacts[key].nome

      toAddBool = false
      for (var key2 in geoNames) {
        toAddBool = toAddBool || doStringsOverlap(geoNames[key2], municipalityName)
      }

      if (toAddBool) {
        var GNRrelevantContact = {
          authority: 'Guarda Nacional Republicana',
          authorityShort: 'GNR',
          nome: app.contacts.GNR_Contacts[key].nome,
          contacto: app.contacts.GNR_Contacts[key].contacto
        }
        GNRrelevantContacts.push(GNRrelevantContact)
      }
    }

    return GNRrelevantContacts
  }

  // try to get PSP contacts based on name of municipality and locality
  // geoNames is an array with possible names for the area
  function getPSPcontacts (geoNames) {
    var PSPrelevantContacts = []
    var municipalityName
    var toAddBool

    for (var key in app.contacts.PSP_Contacts) {
      municipalityName = app.contacts.PSP_Contacts[key].nome

      toAddBool = false
      for (var key2 in geoNames) {
        toAddBool = toAddBool || doStringsOverlap(geoNames[key2], municipalityName)
      }

      if (toAddBool) {
        var PSPrelevantContact = {
          authority: 'Polícia de Segurança Pública',
          authorityShort: 'PSP',
          nome: app.contacts.PSP_Contacts[key].nome,
          contacto: app.contacts.PSP_Contacts[key].contacto
        }
        PSPrelevantContacts.push(PSPrelevantContact)
      }
    }

    return PSPrelevantContacts
  }

  // for example: "Porto District" overlap with "Porto"
  // this function is used to try to find similarities between strings
  // so that one can find the authority applicable for a specific area name
  function doStringsOverlap (string1, string2) {
    if (string1 === '' || string2 === '') {
      return false
    }

    string1 = $.trim(string1)
    string1 = string1.toLowerCase()
    string2 = $.trim(string2)
    string2 = string2.toLowerCase()

    // indexOf returns -1 when one string doesn't contain the other
    if (string1.indexOf(string2) !== -1 || string2.indexOf(string1) !== -1) {
      return true
    } else {
      return false
    }
  }

  function getEmailOfCurrentSelectedAuthority () {
    var index = $('#authority').val()
    return app.localization.AUTHORITIES[index].contacto
  }

  thisModule.getEmailByFullName = getEmailByFullName
  thisModule.getPMcontacts = getPMcontacts
  thisModule.getGNRcontacts = getGNRcontacts
  thisModule.getPSPcontacts = getPSPcontacts
  thisModule.getEmailOfCurrentSelectedAuthority = getEmailOfCurrentSelectedAuthority

  return thisModule
})(app.contactsFunctions || {})
