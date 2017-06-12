var message;
var email_to;
var email_subject;

var debug = /debug=(\d+)/.exec(window.location.href);
var images_support = /images_support=(\d+)/.exec(window.location.href);
var map_reverse_location = /map_reverse_location=(\d+)/.exec(window.location.href);
var enable_user_cookie = /user_cookie=(\d+)/.exec(window.location.href);

//date field
$.datepicker.setDefaults({
  dateFormat: 'dd-mm-yy',
  dayNamesMin: [ "Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb" ],
  monthNamesShort: [ "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez" ],
  monthNames: [ "janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro" ]
});
$("#date").datepicker();

//when the page loads
$(window).on('load', function(){
    
  //populates HTML select according to the information on municipalities.js file
  //and sorts the municipalities alphabetically
  var keys = [];
  for (var key in municipalities) {
    if (municipalities.hasOwnProperty(key)) {
      keys.push(key);
    }
  }
  keys.sort();
  $("#municipality").append("<option></option>");
  for (var i = 0; i < keys.length; i++) {
    key = keys[i];
    $("#municipality").append("<option>" + municipalities[key].name + "</option>");
  }
    
  //initializes date and time with current date and time
  var date = new Date();
  $("#date").datepicker('setDate', date);
  var currentTime = pad(date.getHours(), 2) + ':' + pad(date.getMinutes(), 2);
  $("#time").val(currentTime);

  // if user cookie
  if (enable_user_cookie){
	  getUserCookie();
  }
  
  //if images support enabled show
  if (images_support) {
	  $("#image_selector").show();
  }
  
  // Get Localization if available   
  if (map_reverse_location) {
	getLocation() // this may return that map_reverse_location isn't available with "false" value
  }

});

//when user clicks "generate email"
$("#button").click(function(){

  if (!debug) {
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
  }

  // Updates Cookie
  if (enable_user_cookie)
    setUserCookie();
  
  //deteta se a matrícula está bem preenchida
  var Name = $("#name").val();
  number_of_names = Name.split(' ').length;
  if ((number_of_names == 1 || number_of_names == 2) && !debug){
      alert("Insira o nome completo");
      return;
  }
  Name2 = Name.split(' ')[0] + " " +  Name.split(' ')[(Name.split(' ')).length-1];
  
  //deteta se a matrícula está bem preenchida
  var plate_str = $("#plate").val();
  plate_str = plate_str.toUpperCase(); // force place upcase
  var bool1 = (plate_str != "XX-XX-XX");
  var bool3 = (plate_str.substring(2, 3) == "-");
  var bool4 = (plate_str.substring(5, 6) == "-");
  var bool5 = (plate_str.length == 8);
  var bool_isCorrect = (bool1 && bool3 && bool4 && bool5);
  if ((!bool_isCorrect) && (!debug)) {
    alert("Preencha a matrícula em maiúsculas no formato XX-XX-XX");
    return;
  }

  //PREAMBLE
  var preamble = "Para enviar email para ";
  for (var key in municipalities){
    if(!municipalities.hasOwnProperty(key)) continue;
    
    var obj = municipalities[key];                             
    if ($("#municipality").val() == obj.name){
      preamble += '<a href="mailto:' + obj.email + '">' + obj.email + '</a>';
      email_to = obj.email;        
    }
  } 
  preamble += " clique no seguinte botão:"

    /******************************************************/
  //PM de Lisboa ou Porto texto
  var PM;
  for (var key in municipalities){
    if(!municipalities.hasOwnProperty(key)) continue;
    
    var obj = municipalities[key];                             
    if ($("#municipality").val() == obj.name){
      PM = obj.authority;       
    }
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

  //Texto principal
  var msg = "Excelentíssimos senhores da" + " " + PM + ";"
  
  var msg1 = "Eu, <b>" + $("#name").val() + "</b>, com o <b>" + $("#id_type").val() + "</b> com o número <b>" + $("#id_number").val() + "</b> " +
             "e com residência em <b>" + $("#address").val() + "</b>, venho por este meio," + " " +
             "ao abrigo do n.º 5 do artigo 170.º do Código da Estrada, fazer a seguinte denúncia de contra-ordenação para que a "+
             PM + " " +
             "levante o auto respetivo e multe o infra-mencionado responsável.";

  var msg2 = "No passado dia <b>" + $.datepicker.formatDate("dd' de 'MM' de 'yy", $( "#date" ).datepicker('getDate') ) + "</b>" +
      ( $("#time").val() ? " pelas <b>" + $("#time").val() + "</b>" : "") + //optional
      ", " +

      "na <b>" + $("#place_prefix").val() + " " + $("#street").val() + ", " +  $("#municipality").val() + "</b>, " +

      ( $("#door_number").val() ? "aproximadamente junto à porta com o <b>número " + $("#door_number").val() + "</b>, " : "") + //optional

      "a viatura com matrícula <b>" + plate_str + "</b> " +
      carmake_model_txt +
      "encontrava-se estacionada sobre uma zona exclusivamente pedonal, em violação da alínea f) do n.º 1 do artigo 49º do Código da Estrada.";

  var msg3 = "Pode-se comprovar esta situação através das fotografias anexas ao presente email. Juro pela minha honra que a informação que consta neste email é verídica.";

  var msg4 = "Com os melhores cumprimentos<br>" + Name2;

  var msg5 = getImagesToMessage();

  message = msg + "<br><br>" + msg1 + "<br><br>" + msg2 + "<br><br>" + msg3 + "<br><br>" + msg4 + "<br><br>";
  
  messageImg = message + msg5 + "<br><br>" + getMapImageToMessage();
  
  $("#preamble").html(preamble);
  $("#message").html(messageImg);
  $("#second_stage").show();
});

//limpar a mensagem para o email, remove HTML tags, 
//pois o mailto não aceita HTML tags, apenas texto simples 
function clean_message() {
  var temp = message;
  temp = temp.replace(/<b\s*\/?>/mg,"");
  temp = temp.replace(/<\/b\s*\/?>/mg,"");
  temp = temp.replace(/<br\s*\/?>/mg,"\n");
  return temp;
}

//add zeros to numbers, ex: pad(7, 3)="007"
function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

//botão de gerar email
$("#button2").click(function(){
  clipboard.copy({
    "text/html": messageImg
  });
  alert("Abrir-se-á de seguida o seu cliente de mail, bastando depois anexar a foto!\n\n\nCaso o cliente de mail não se abra, a mensagem foi copiada para o seu ambiente de trabalho!\n1)Crie uma mensagem de email,\n2)Cole o texto no corpo da mensagem clicando CTRL-V,\n3)Envie para " + email_to);

  email_subject = "Denúncia de estacionamento ao abrigo do n.º 5 do art. 170.º do Código da Estrada";
    
  email_subject = encodeURIComponent(email_subject);
  clean_msg = encodeURIComponent(clean_message());
  
  window.open('mailto:'+encodeURIComponent(email_to)+'?subject='+email_subject+'&body='+clean_msg);  
});

var geoL = { coords : { longitude : 0, latitude : 0 }};

// Location
function getLocation() {	
    if (navigator.geolocation) {
		
        navigator.geolocation.getCurrentPosition(fillFormAddress);
        $('#map_holder').click(function(e) {
          var offset = $(this).offset();
          newLong = geoL.coords.longitude + (e.pageX - offset.left - $(this).width() / 2) / 100000;
          newLat = geoL.coords.latitude - (e.pageY - offset.top - $(this).height() / 2) / 100000;
		  geoL = { coords : { latitude : newLat,longitude : newLong }};		  
		  updateMapLocation(geoL);
        });	
    } else {
		if (debug)
          alert("Geolocation não é suportada por este browser.");
        map_reverse_location = false;	    
    }
}

function fillFormAddress(position)
{	
	geoL = { coords : { longitude : position.coords.longitude, latitude : position.coords.latitude }};
	
	updateMapLocation(position);
	
	$("#location_holder").show()	
}

function updateMapLocation(position) {

  var latlon = position.coords.latitude + "," + position.coords.longitude;	
  img_url = "https://maps.googleapis.com/maps/api/staticmap?center="+latlon+"&zoom=17&size=600x300&sensor=false&markers=color:red%7Clabel:!%7C"+latlon;	

  $("#longitude").val(position.coords.longitude);
  $("#latitude").val(position.coords.latitude);
  $("#map_holder").html("<img style='width: 100%' src='"+img_url+"'>");  

  $.ajax({
        type: "GET",
        url: "https://nominatim.openstreetmap.org/reverse?format=json&lat=" + position.coords.latitude + "&lon=" + position.coords.longitude + "&zoom=18&addressdetails=1",
        cache: false,
        dataType: "json",
        success: function(data) {
            
  			  // if ($("#municipality").val() == "") {
				$("#municipality").val(data.address.city);
			  // };			
			  
			  roadsplit = data.address.road.split(" ");
			  //if ($("#place_prefix").val() == "") {
				  $("#place_prefix").val(roadsplit[0]);
			  //}
			  
			  //if ($("#street").val() == "") {
				  $("#street").val(data.address.road.substr(roadsplit[0].length+1,data.address.road.length-roadsplit[0].length+1));
			  //}

		    }
        }
    );
}

function getMapImageToMessage()
{
	t = "";
	
	if (map_reverse_location) {
	  t = "<div class='row'><div class='col-xs-12'>" +
  	      "Mapa " + "<p><img class='col-xs-12' src='" + img_url + "'>" +
	      "</div></div>";
	}
	
	return t;
}

// User Information Cookie

function setUserCookie() {
    var d = new Date();
    d.setTime(d.getTime() + (360*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
	document.cookie = "user=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = encodeURIComponent(JSON.stringify({ "name" : $("#name").val(), "id_type" : $("#id_type").val(), "id_number" : $("#id_number").val(), "address" : $("#address").val()})) + ";" + expires + ";path=/";
}


function getUserCookie() {
    var decodedCookie = JSON.parse(decodeURIComponent(document.cookie));
	$("#name").val(decodedCookie.name);
	$("#id_type").val(decodedCookie.id_type);
	$("#id_number").val(decodedCookie.id_number);
	$("#address").val(decodedCookie.address);
}

