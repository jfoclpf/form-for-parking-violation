var message;
var email_to;
var email_subject;

$.datepicker.setDefaults({
  dateFormat: 'dd-mm-yy',
  dayNamesMin: [ "Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb" ],
  monthNamesShort: [ "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez" ],
  monthNames: [ "janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro" ]
});

$("#date").datepicker();

$("#button").click(function(){

  //campos vazios
  var to_break=false;
  $(".mandatory").each(function(){
    if ($(this).val().replace(/^\s+|\s+$/g, "").length == 0){
      alert("Preencha todos os campos obrigatórios assinalados com *");
      to_break = true;
      return false;
    }
  });
  if(to_break){
    return;
  }

  //detecta se a matrícula está bem preenchida
  var plate_str = $("#plate").val();
  plate_str = plate_str.toUpperCase(); // force place upcase
  var bool1 = (plate_str != "XX-XX-XX");
  var bool3 = (plate_str.substring(2, 3) == "-");
  var bool4 = (plate_str.substring(5, 6) == "-");
  var bool5 = (plate_str.length == 8);
  var bool_isCorrect = (bool1 && bool3 && bool4 && bool5);
  if (!bool_isCorrect) {
    alert("Preencha a matrícula em maiúsculas no formato XX-XX-XX");
    return;
  }

  //PREAMBLE
  var preamble = "Para enviar email para ";
  if ($("#municipality").val() == "Lisboa"){
    preamble += '<a href="mailto:pm@cm-lisboa.pt">pm@cm-lisboa.pt</a>';
    email_to = "pm@cm-lisboa.pt";
  }
  else if ($("#municipality").val() == "Porto"){
    preamble += '<a href="mailto:policiamunicipal@cm-porto.pt">policiamunicipal@cm-porto.pt</a>';
    email_to = "policiamunicipal@cm-porto.pt";
  }
  else{
    alert("erro");
    return;
  }
  preamble += " clique no seguinte botão:"

    /******************************************************/
  //PM de Lisboa ou Porto texto
  var PM;
  if ($("#municipality").val() == "Lisboa"){
    PM = "Polícia Municipal de Lisboa";
  }
  else if ($("#municipality").val() == "Porto"){
    PM = "Polícia Municipal do Porto";
  }
  else{
    alert("erro");
    return;
  }

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

  var msg = "Excelentíssimos senhores da" + " " + PM + ";"
  var msg1 = "Ao abrigo do n.º 5 do artigo 170.º do Código da Estrada, venho por este meio fazer a seguinte denúncia de contra-ordenação para que a "+
      PM + " " +
      "levante o auto respetivo e multe o infra-mencionado responsável.";

  var msg2 = "No passado dia <b>" + $.datepicker.formatDate("dd' de 'MM' de 'yy", $( "#date" ).datepicker('getDate') ) + "</b>" +
      ( $("#time").val() ? " pelas <b>" + $("#time").val() + "</b>" : "") + //optional
      ", " +

      "na <b>" + $("#place_prefix").val() + " " + $("#street").val() + ", " +  $("#municipality").val() + "</b>, " +

      ( $("#door_number").val() ? "aproximadamente junto à porta com o <b>número " + $("#door_number").val() + "</b>, " : "") + //optional

      "a viatura com matrícula <b>" + $("#plate").val() + "</b> " +
      carmake_model_txt +
      "encontrava-se estacionada sobre uma zona exclusivamente pedonal, em violação da alínea f) do n.º 1 do artigo 49º do Código da Estrada.";

  var msg3 = "Pode-se comprovar esta situação através das fotografias anexas ao presente email.";

  var msg4 = "Com os melhores cumprimentos<br>" + $("#name").val();

  message = msg + "<br><br>" + msg1 + "<br><br>" + msg2 + "<br><br>" + msg3 + "<br><br>" + msg4 + "<br><br>";

  $("#button2").show();
  $("#preamble").html(preamble).show();
  $("#message").html(message).show();
});

function clean_message() {
  var temp = message;
  temp = temp.replace(/<b\s*\/?>/mg,"");
  temp = temp.replace(/<\/b\s*\/?>/mg,"");
  temp = temp.replace(/<br\s*\/?>/mg,"%0D%0A");
  return temp;
}

$("#button2").click(function(){
  clipboard.copy({
    "text/html": message
  });
  alert("Abrir-se-á de seguida o seu cliente de mail com a referida mensagem!\n\n\nCaso o cliente de mail não se abra, a mensagem foi copiada para o seu ambiente de trabalho!\n1)Crie uma mensagem de email,\n2)Anexe as fotos,\n3)Cole o texto no corpo da mensagem clicando CTRL-V,\n4)Envie para " + email_to);

  email_subject = "Denúncia de estacionamento ao abrigo do n.º 5 do art. 170.º do Código da Estrada";
  window.open('mailto:'+email_to+'?subject='+email_subject+'&body='+clean_message());
});