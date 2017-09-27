//main message
function getMainMessage(ShortName){
    
    //Authority
    var authority, authorityShort, authorityName;
    for (var key in AUTHORITIES){
        if(!AUTHORITIES.hasOwnProperty(key)) continue;
                             
        if ($("#authority").val() == key){
            authority = AUTHORITIES[key].authority;
            authorityShort = AUTHORITIES[key].authorityShort;
            authorityName = AUTHORITIES[key].nome;
            EMAIL_TO = AUTHORITIES[key].contacto;
        }
    }
    
    //Penalties
    var penaltyDescription;
    var penaltyLawArticle;
    for (var key in PENALTIES){
        if(!PENALTIES.hasOwnProperty(key)) continue;

        var obj = PENALTIES[key];                             
        if ($("#penalties").val() == obj.select){
            penaltyDescription = obj.description;
            penaltyLawArticle = obj.law_article; 
        }
    }
    
    var CarPlateStr = getCarPlate();
    
    //texto para marca e modelo
    var is_carmake = ($("#carmake").val().replace(/^\s+|\s+$/g, "").length != 0);
    var is_model = ($("#model").val().replace(/^\s+|\s+$/g, "").length != 0);
    var carmake_model_txt;
    if (is_carmake && is_model){
        carmake_model_txt = "de marca e modelo <b>" + $("#carmake").val() + " " + $("#model").val() + "</b>, ";
    }
    else if (is_carmake){
        carmake_model_txt = "de marca <b>" + $("#carmake").val() + "</b>, ";
    }
    else if (is_model){
        carmake_model_txt = "de modelo <b>" + $("#model").val() + "</b>, ";
    }
    else{
        carmake_model_txt = "";
    }    
    
    var msg = "Excelentíssimos senhores da" + " " + authority + ", " + authorityName + ";"

    var msg1 = "Eu, <b>" + $("#name").val() + "</b>, com o <b>" + $("#id_type").val() + "</b> com o número <b>" + $("#id_number").val() + "</b> " +
        "e com residência em <b>" + $("#address").val() + ", " + $("#postal_code").val() + ", " + $("#address_city").val() + 
        "</b>, venho por este meio," + " " +
        "ao abrigo do n.º 5 do artigo 170.º do Código da Estrada, fazer a seguinte denúncia de contra-ordenação para que a " +
        authority + " " + "levante o auto respetivo e multe o infra-mencionado responsável.";

    var msg2 = "No passado dia <b>" + $.datepicker.formatDate("dd' de 'MM' de 'yy", $( "#date" ).datepicker('getDate') ) + "</b>" +
        ( $("#time").val() ? " pelas <b>" + $("#time").val() + "</b>" : "") + //optional
        ", " +
        "na <b>" + $("#street").val() + ", " +  $("#locality").val() + "</b>, " +
        ( $("#street_number").val() ? "aproximadamente junto à porta com o <b>número " + $("#street_number").val() + "</b>, " : "") + //optional
        "a viatura com matrícula <b>" + CarPlateStr + "</b> " + carmake_model_txt +
        "encontrava-se estacionada" + " " + penaltyDescription + ", em violação " + penaltyLawArticle +".";

    var msg3 = "Pode-se comprovar esta situação através das fotografias anexas ao presente email. Juro pela minha honra que a informação que consta neste email é verídica.";

    var msg4 = "Com os melhores cumprimentos<br>" + ShortName;

    var msg5 = getImagesToMessage();

    message = msg + "<br><br>" + msg1 + "<br><br>" + msg2 + "<br><br>" + msg3 + "<br><br>" + msg4 + "<br>";

    return message;
}