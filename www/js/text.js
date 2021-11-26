/* global app, $ */

app.text = (function (thisModule) {
  // main message
  function getMainMessage (option) {
    if (option === 'body') {
      // Penalties
      const penalties = app.penalties.getPenalties()
      // select is multiselect and $('#penalties').val() is an array of selected penalty codes
      const selectedPenalties = []
      $('#penalties').val()
        .forEach(penalty => {
          selectedPenalties.push({
            description: penalties[penalty].description,
            lawArticle: penalties[penalty].law_article
          })
        })

      const carPlateStr = app.form.getCarPlate()

      // texto para marca e modelo
      const isCarMake = ($('#carmake').val().replace(/^\s+|\s+$/g, '').length !== 0)
      const isCarModel = ($('#carmodel').val().replace(/^\s+|\s+$/g, '').length !== 0)
      let carmakeModelText
      if (isCarMake && isCarModel) {
        carmakeModelText = `de marca e modelo <b>${$('#carmake').val()} ${$('#carmodel').val()}</b>, `
      } else if (isCarMake) {
        carmakeModelText = `de marca <b>${$('#carmake').val()}</b>, `
      } else if (isCarModel) {
        carmakeModelText = `de modelo <b>${$('#carmodel').val()}</b>, `
      } else {
        carmakeModelText = ''
      }

      const msg = getRandomGreetings() + ' da ' + getNameOfCurrentSelectedAuthority() + ';'

      // see https://stackoverflow.com/a/37321145/1243247
      const msg1 = `Eu, <b>${$('#name').val()}</b>, \
        com o <b>${$('#id_type').val()}</b> com o número <b>${$('#id_number').val()}</b> \
        e com residência em <b>${$('#address').val()}, ${$('#postal_code').val()}, ${$('#address_city').val()}</b>, \
        venho por este meio, ao abrigo do n.º 5 do artigo 170.º do Código da Estrada, \
        fazer a seguinte denúncia de contraordenação para que V. Exas. \
        levantem o auto respetivo e multem o infra-mencionado responsável.`

      let msg2 = 'No passado dia <b>' +
        $.datepicker.formatDate("dd' de 'MM' de 'yy", $('#date').datepicker('getDate')) + '</b>' +
        ($('#time').val() ? ' pelas <b>' + $('#time').val() + '</b>' : '') + // optional
        ', ' + 'na <b>' + $('#street').val() + ', ' + $('#locality').val() + '</b>, ' +
        ($('#street_number').val()
          ? 'aproximadamente junto à porta com o <b>número ' + $('#street_number').val() + '</b>, '
          : ''
        ) // optional

      if (app.functions.isThis_iOS()) {
        // apple doesn't allow car plates, considers it defamation
        msg2 += `a viatura ${carmakeModelText}\
          cuja matrícula se encontra na foto em anexo, `
      } else {
        msg2 += `a viatura com matrícula <b>${carPlateStr}</b> ${carmakeModelText}`
      }

      // penalities
      msg2 += 'encontrava-se estacionada '
      for (let i = 0; i < selectedPenalties.length; i++) {
        if (i !== selectedPenalties.length - 1) {
          msg2 += `${selectedPenalties[i].description}, em violação ${selectedPenalties[i].lawArticle}; `
        } else { // last element
          msg2 += `encontrando-se estacionada ainda ${selectedPenalties[i].description}, em violação ${selectedPenalties[i].lawArticle}.`
        }
      }

      const msg3 = `Pode-se comprovar esta situação através \
        ${((app.photos.getPhotosUriOnFileSystem().length === 1) ? 'da fotografia anexa' : 'das fotografias anexas')} \
        à presente mensagem eletrónica. Juro pela minha honra que a informação supra citada é verídica. \
        Recordo ainda, que ao abrigo do referido n.º 5 do artigo 170.º do Código da Estrada, \
        a autoridade que tiver notícia por denúncia de contraordenação, levanta auto, \
        não carecendo de presenciar tal contraordenação rodoviária, situação a que se aplica o n.º 1 do mesmo artigo. \
        Refiro ainda que me encontro plenamente disponível para participar na qualidade de testemunha \
        no processo que vier a ser instaurado com referência à presente missiva.`

      const message = msg + '<br><br>' + msg1 + '<br><br>' + msg2 + '<br><br>' + msg3 + '<br><br>' + getRegards() + '<br>'

      return message
    } else if (option === 'subject') {
      const carPlateStr = app.form.getCarPlate()
      const address = app.form.getFullAddress()

      const emailSubject = (app.functions.isThis_iOS() ? 'Veículo ' : `[${carPlateStr}] `) +
        `na ${address} - Denúncia de estacionamento ao abrigo do n.º 5 do art. 170.º do Código da Estrada`

      return emailSubject
    } else {
      console.error('Error in getMainMessage(option) wth option=' + option)
    }
  }

  function getExtraAuthenticationHTMLText () {
    var text = 'Refira-se ainda que esta mensagem tem anexo o meu certificado digital emitido pela Agência para a Modernização Administrativa, <b>o que é equivalente, de acordo com a Lei, à minha presença nas instalações de V. Exas</b>.<br><br>' +
    'Tenho pleno conhecimento de que a Autoridade Nacional de Segurança Rodoviária (ANSR) consigna que os agentes de autoridade, mediante denúncia de um cidadão, deverão levantar auto de contraordenação, tornando-se necessário recolher os elementos ' +
    'probatórios que sustentem formalmente os documentos de denúncia, conforme o n.º 3 do artigo 170.º do Código Estrada (CE). Contudo, de acordo com o n. 1) do artigo 169.º-A do Código da Estrada, introduzido pelo Decreto-Lei n.º 102-B/2020, ' +
    'os atos processuais podem ser praticados em suporte informático com aposição de assinatura digital qualificada, nomeadamente através do Cartão de Cidadão e da Chave Móvel Digital, o que se verifica no presente caso. ' +
    'O n. 2 do mesmo artigo 169.º-A do Código da Estrada refere que os atos processuais e documentos assinados nos termos do número anterior substituem e dispensam para quaisquer efeitos a assinatura autografada no processo em suporte de papel. ' +
    'Logo, considerando as instruções emanadas pela ANSR, o artigo 169.º-A do Código da Estrada introduzido pelo Decreto-Lei n.º 102-B/2020, e o facto de esta mensagem estar assinada com recurso à Chave Móvel Digital, ' +
    'deverá V. Exa. proceder ao levantamento de auto de contraordenação, de acordo com o artigo 170.º do Código da Estrada, sem a necessidade de que eu me dirija presencialmente às instalações policiais as quais eu endereço esta denúncia.'

    return text
  }

  // called by historic module
  function getReminderMessage (occurrence) {
    var text = `${getRandomGreetings()} da ${occurrence.autoridade}<br><br>` +
      `No seguimento da denúncia já enviada anteriormente a V. Exas. a propósito da violação do Código da Estrada perpetrada pelo condutor do veículo ${occurrence.carro_marca} ${occurrence.carro_modelo} com a matrícula ${occurrence.carro_matricula}, ` +
      `na ${occurrence.data_local} n. ${occurrence.data_num_porta}, ${occurrence.data_concelho}, no dia ${(new Date(occurrence.data_data)).toLocaleDateString('pt-PT')} às ${occurrence.data_hora.slice(0, 5)}, ` +
      `veículo esse que se encontrava ${app.penalties.getDescription(occurrence.base_legal)} em violação ${app.penalties.getLawArticle(occurrence.base_legal)}, ` +
      `vinha por este meio inquirir V. Exas. sobre o estado do processo respetivo, considerando que já decorreram ${Math.round(((new Date()) - new Date(occurrence.data_data)) / (1000 * 60 * 60 * 24))} dias desde a data da ocorrência.<br><br>` +
      `Fico a aguardar resposta de V. Exas.<br><br>${getRegards()}`

    return text
  }

  function getMailMessageWithCMD (option) {
    if (option === 'body') {
      var mainMessage = getRandomGreetings() + ' da ' + getNameOfCurrentSelectedAuthority() + ';<br><br>' +
        'Envio em anexo ficheiro PDF com uma denúncia de estacionamento ao abrigo do n.º 5 do art. 170.º do Código da Estrada.<br><br>'

      mainMessage += 'Refira-se ainda que o PDF em anexo tem o meu certificado digital emitido pela Agência para a Modernização Administrativa, <b>o que é equivalente, de acordo com a Lei, à minha presença nas instalações de V. Exas</b>.<br><br>' +
        'Recordo que a Autoridade Nacional de Segurança Rodoviária (ANSR) consigna que os agentes de autoridade, mediante denúncia de um cidadão, deverão levantar auto de contraordenação, tornando-se necessário recolher os elementos ' +
        'probatórios que sustentem formalmente os documentos de denúncia, conforme o n.º 3 do artigo 170.º do Código Estrada (CE). Contudo, de acordo com o n. 1) do artigo 169.º-A do Código da Estrada, introduzido pelo Decreto-Lei n.º 102-B/2020, ' +
        'os atos processuais podem ser praticados em suporte informático com aposição de assinatura digital qualificada, nomeadamente através do Cartão de Cidadão e da Chave Móvel Digital, o que se verifica no presente caso. ' +
        'O n.º 2 do mesmo artigo 169.º-A do Código da Estrada refere que os atos processuais e documentos assinados nos termos do número anterior substituem e dispensam para quaisquer efeitos a assinatura autografada no processo em suporte de papel.<br><br>' +
        'Logo, considerando as instruções emanadas pela ANSR, o artigo 169.º-A do Código da Estrada introduzido pelo Decreto-Lei n.º 102-B/2020, e o facto de esta mensagem estar assinada com recurso à Chave Móvel Digital, ' +
        'deverá V. Exa. proceder ao levantamento de auto de contraordenação, de acordo com o artigo 170.º do Código da Estrada, sem a necessidade de que eu me dirija presencialmente às instalações policiais as quais eu endereço esta denúncia.'

      mainMessage += '<br><br>' + getRegards() + '<br>'
      return mainMessage
    } else if (option === 'subject') {
      const carPlateStr = app.form.getCarPlate()
      const address = app.form.getFullAddress()

      const emailSubject = (app.functions.isThis_iOS() ? 'Veículo ' : `[${carPlateStr}] `) +
        `na ${address} - Denúncia de estacionamento ao abrigo do n.º 5 do art. 170.º do Código da Estrada`

      return emailSubject
    } else {
      console.error('Error in getMailMessageWithCMD(option) wth option=' + option)
    }
  }

  function getNameOfCurrentSelectedAuthority () {
    // Authority
    var authority, authorityName
    var index = $('#authority').val()

    authority = app.localization.AUTHORITIES[index].authority
    authorityName = app.localization.AUTHORITIES[index].nome

    return authority + ', ' + authorityName
  }

  function getRandomGreetings () {
    var greetingsInitial = [
      'Excelentíssimos senhores',
      'Excelentíssimos agentes',
      'Prezados senhores',
      'Prezados agentes',
      'Caros senhores',
      'Ex.mos Senhores',
      'Ex.mos Senhores Agentes'
    ]

    return greetingsInitial[Math.floor(Math.random() * greetingsInitial.length)]
  }

  // best regards
  // Andrey
  function getRegards () {
    // gets a random regard
    var regards = [
      'Agradecendo antecipadamente a atenção de V. Ex.as, apresento os meus melhores cumprimentos',
      'Com os melhores cumprimentos',
      'Com os meus melhores cumprimentos',
      'Melhores cumprimentos',
      'Apresentando os meus melhores cumprimentos',
      'Atenciosamente',
      'Atentamente',
      'Respeitosamente'
    ]

    var regard = regards[Math.floor(Math.random() * regards.length)]

    // full name
    var Name = $('#name').val()
    // gets first and last name
    var ShortName = Name.split(' ')[0] + ' ' + Name.split(' ')[(Name.split(' ')).length - 1]

    var msgEnd = regard + ',<br>' + ShortName

    return msgEnd
  }

  /* === Public methods to be returned === */
  thisModule.getMainMessage = getMainMessage
  thisModule.getReminderMessage = getReminderMessage
  thisModule.getMailMessageWithCMD = getMailMessageWithCMD
  thisModule.getRegards = getRegards
  thisModule.getExtraAuthenticationHTMLText = getExtraAuthenticationHTMLText

  return thisModule
})(app.text || {})
