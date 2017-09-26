
//date field
$.datepicker.setDefaults({
    dateFormat: 'dd-mm-yy',
    dayNamesMin: [ "Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb" ],
    monthNamesShort: [ "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez" ],
    monthNames: [ "janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro" ]
});
$("#date").datepicker();

//populates personal in fields information if available in storage
function loadsPersonalInfo(){
  
  $('.personal_info').each(function(){    
      var id = $(this).attr('id');
      var value = window.localStorage.getItem(id);
      if(value){
        $(this).val(value);
      }
  });
}

//removes leading and trailing spaces on every text field "on focus out"
$( ":text" ).each(function( index ) {
    $( this ).focusout(function() {
      var text = $(this).val();
      text = $.trim(text);
      text = text.replace(/\s\s+/g, ' '); //removes consecutive spaces in-between        
      $(this).val(text);
    });
});


//save to storage for later usage on every select
$('select.personal_info').each(function(){
    $( this ).on('change', function() {
        var id = $(this).attr('id');
        console.log(id);
        var value = $(this).val();
        window.localStorage.setItem(id, value);
    });
});

//save to storage for later usage on every "focus out" of text input fields
$('input.personal_info').each(function(){
    $( this ).focusout(function() {      
        var id = $(this).attr('id');
        console.log(id);
        var value = $(this).val();
        value = $.trim(value);
        value = value.replace(/\s\s+/g, ' '); //removes consecutive spaces in-between
        window.localStorage.setItem(id, value);
    });
});


function populatesPenalties(){
  
    var keys = [];
    for (var key in PENALTIES) {
        if (PENALTIES.hasOwnProperty(key)) {
            keys.push(key);
        }
    }

    $("#penalties").append("<option></option>");
    for (var i = 0; i < keys.length; i++) {
        key = keys[i];
        $("#penalties").append("<option>" + PENALTIES[key].select + "</option>");
    }
}


//as the user writes the carplate, detects if the name is ok
$("#plate").on('input', function() {
    if (!isCarPlateOK($(this).val()) && !DEBUG){
        $(this).css("border-color","red");        
    }
    else{
        $(this).css("border-color","");
    }
});

$('#id_number').on('input', function() {
    if ($(this).val() == "" && !DEBUG){
        $(this).css("border-color","red");        
    }
    else{
        $(this).css("border-color","");
    }  
});
$('#address').on('input', function() {
    if ($(this).val() == "" && !DEBUG){
        $(this).css("border-color","red");        
    }
    else{
        $(this).css("border-color","");
    }  
});
$('#address_city').on('input', function() {
    if ($(this).val() == "" && !DEBUG){
        $(this).css("border-color","red");        
    }
    else{
        $(this).css("border-color","");
    }  
});
$('#carmake').on('input', function() {
    if ($(this).val() == "" && !DEBUG){
        $(this).css("border-color","red");        
    }
    else{
        $(this).css("border-color","");
    }  
});
$('#model').on('input', function() {
    if ($(this).val() == "" && !DEBUG){
        $(this).css("border-color","red");        
    }
    else{
        $(this).css("border-color","");
    }  
});
$('#locality').on('input',  function() {
    if ($(this).val() == "" && !DEBUG){
        $(this).css("border-color","red");        
    }
    else{
        $(this).css("border-color","");
    }  
});
$('#street').on('input',  function() {
    if ($(this).val() == "" && !DEBUG){
        $(this).css("border-color","red");        
    }
    else{
        $(this).css("border-color","");
    }  
});
$('#street_number').on('input', function() {
    if ($(this).val() == "" && !DEBUG){
        $(this).css("border-color","red");        
    }
    else{
        $(this).css("border-color","");
    }  
});

//detects if the car plate is correctly filled in
function isCarPlateOK(){
  
    var plate_str = $("#plate").val();
    plate_str = plate_str.toUpperCase(); // force place upcase

    plate_str = plate_str.replace(/\u2013|\u2014/g, "-"); //it replaces all &ndash; (–) and &mdash; (—) symbols with simple dashes (-)

    var bool1 = (plate_str != "XX-XX-XX");
    var bool3 = (plate_str.substring(2, 3) == "-");
    var bool4 = (plate_str.substring(5, 6) == "-");
    var bool5 = (plate_str.length == 8);

    var bool_isCorrect = (bool1 && bool3 && bool4 && bool5);

    return bool_isCorrect;
}

//as the user writes Postal Code, detects if the name is ok
$("#postal_code").on('input', function() {
    if (!isPostalCodeOK() && !DEBUG){
        $(this).css("border-color","red");        
    }
    else{
        $(this).css("border-color","");
    }
});

//detects if the postal code is correctly filled in
function isPostalCodeOK(){
  
    var plate_str = $("#postal_code").val();
    
    plate_str = $.trim(plate_str);
    
    if (plate_str.length != 8){
        return false;
    }
    
    plate_str = plate_str.replace(/\u2013|\u2014/g, "-"); //it replaces all &ndash; (–) and &mdash; (—) symbols with simple dashes (-)
    
    //regex format for 0000-000 or 0000 000 
    //http://stackoverflow.com/questions/2577236/regex-for-zip-code
    if (plate_str.match(/^\d{4}(?:[-\s]\d{3})?$/)){
        return true;
    } 
    else{
        return false;
    }

}

//get carplate 
function getCarPlate(){
  
    var plate_str = $("#plate").val();
    plate_str = plate_str.toUpperCase(); // force place upcase
    plate_str = plate_str.replace(/\u2013|\u2014/g, "-"); //it replaces all &ndash; (–) and &mdash; (—) symbols with simple dashes (-)

    return plate_str;
}

//as the user writes his name, detects if the name is ok
$("#name").on('input', function() {
    if (!isFullNameOK($(this).val()) && !DEBUG){
        $(this).css("border-color","red");        
    }
    else{
        $(this).css("border-color","");
    }
});

//detects if user has inserted full name
function isFullNameOK(fullName){
    
    //removes all non-alphabetic characters
    var name = fullName.replace(/[^a-zA-Z ]/g, "");
    //removes consecutive spaces in-between
    name = name.replace(/\s\s+/g, ' ');
    
    //trims leading and trailing spaces
    var name = $.trim(name);
    
    //gets the number of words / names
    var name_array = name.split(' ');
    var number_of_names = name_array.length;
    
    //disconsider small particles which are not a name
    var el;
    for (var i in name_array){        
        el = name_array[i];
        if (el == "dos" || el == "da" || el == "do" || el == "das"){
            number_of_names--;
        }
    }
    
    console.log("Number of relevant names: ", number_of_names);
    //if user inserted only 1 or 2 words, it didn't inserted full name, as demanded
    if ((number_of_names == 1 || number_of_names == 2)){
      return false;
    }
    
    return true;
}

//limpar a mensagem para o email, remove HTML tags, 
//pois o mailto não aceita HTML tags, apenas texto simples 
function clean_message(message) {
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

//for the camera plugin
function openCamera(imgNmbr) {

    var srcType = Camera.PictureSourceType.CAMERA;
    var options = setOptions(srcType);    

    navigator.camera.getPicture(function cameraSuccess(imageUri) {

        displayImage(imageUri, "myImg_" + imgNmbr);
        console.log(imageUri);
        
        ImageUriArray[imgNmbr]=imageUri;
        
        //hides "Adds images" button
        $("#" + "addImg_" + imgNmbr).text("Substituir imagem");
        $("#" + "remImg_" + imgNmbr).show();

    }, function cameraError(error) {
        console.debug("Não foi possível obter fotografia: " + error, "app");

    }, options);
}

function setOptions(srcType) {
    var options = {
        // Some common settings are 20, 50, and 100
        quality: 50,
        destinationType: Camera.DestinationType.FILE_URI,
        // In this app, dynamically set the picture source, Camera or photo gallery
        sourceType: srcType,
        encodingType: Camera.EncodingType.JPEG,
        mediaType: Camera.MediaType.PICTURE,
        allowEdit: false,
        correctOrientation: true  //Corrects Android orientation quirks
    }
    return options;
}

function displayImage(imgUri, id) {

    var elem = document.getElementById(id);
    elem.src = imgUri;
    elem.style.display = "block";
}

function removeImage(id, num){
    
    var elem = document.getElementById(id);
    elem.src = "";
    elem.style.display = "none";
    ImageUriArray[num] = null;
}

// Will remove all falsy values: undefined, null, 0, false, NaN and "" (empty string)
function cleanArray(actual) {
  var newArray = new Array();
  for (var i = 0; i < actual.length; i++) {
    if (actual[i]) {
      newArray.push(actual[i]);
    }
  }
  return newArray;
}



//##############################################################################################################
//##############################################################################################################
//  LOCALIZATION/GPS

var MAPS_API_Loaded = false;
function loadMapsApi () {

    var API_KEY;
    API_KEY = 'AIzaSyDF1EPBBAGNzmqof3zRLxhAXCZsBdYxrW4'; //KEY for Android

    if(navigator.connection.type === Connection.NONE || MAPS_API_Loaded){
        return;
    }
    $.getScript('https://maps.googleapis.com/maps/api/js?key='+API_KEY+'&sensor=true&callback=onMapsApiLoaded');
    
    //this flag should be here otherwise the script might be loaded several times, and Google refuses it
    MAPS_API_Loaded = true; 
}

function onMapsApiLoaded () {
    
    //get from GPS Address information
    GetGeolocation();
};

//botão get address by GPS
$("#getCurrentAddresBtn").click(function(){
    GetGeolocation();
});

/*Geo location functions*/
function GetGeolocation() {
    $("#locality").addClass("loading");
    $("#street").addClass("loading");
    $("#street_number").addClass("loading");    
    
    var options = { timeout: 30000, enableHighAccuracy: true };
    navigator.geolocation.getCurrentPosition(GetPosition, PositionError, options);
}
 
function GetPosition(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    ReverseGeocode(latitude, longitude);   // Pass the latitude and longitude to get address.
}
 
function PositionError() {
    navigator.notification.alert('Não foi possível detetar a presente localização.');
}


/*Get address by coordinates*/
function ReverseGeocode(latitude, longitude){
    var reverseGeocoder = new google.maps.Geocoder();
    var currentPosition = new google.maps.LatLng(latitude, longitude);
    reverseGeocoder.geocode({'latLng': currentPosition}, function(results, status) {
 
        if (status == google.maps.GeocoderStatus.OK) {
            if (results[0]) {
                
                var geoNames = []; //array of possible names for the locale
                var authorities = []; //array of possible authorities applicable for that area
                
                var address_components = results[0].address_components;
                
                $("#locality").val(getAddressComponents( address_components, "locality"));                
                $("#street").val(getAddressComponents( address_components, "route")); //nome da rua/avenida/etc.
                $("#street_number").val(getAddressComponents( address_components, "street_number"));
                                                
                //get concelho/municipality according to Google Maps API
                var municipalityFromGmaps = getAddressComponents(address_components, "administrative_area_level_2");
                console.log("municipality from Goolge Maps is " + municipalityFromGmaps);
                geoNames.push(municipalityFromGmaps);
                
                var localityFromGmaps = getAddressComponents(address_components, "locality");
                console.log("locality from Goolge Maps is " + localityFromGmaps);
                geoNames.push(localityFromGmaps);                
                
                var postalCodeFromGmaps = getAddressComponents(address_components,"postal_code");
                console.log("postal_code from Goolge Maps is " + postalCodeFromGmaps);
                
                var dataFromDB = getDataFromPostalCode(postalCodeFromGmaps);
                var localityFromDB = dataFromDB.locality;
                console.log("locality from DB is " + localityFromDB);
                geoNames.push(localityFromDB);
                
                var municipalityFromDB = dataFromDB.municipality;
                console.log("municipality from DB is " + municipalityFromDB);
                geoNames.push(municipalityFromDB);
                
                //if Google Maps has futher information of local name
                var locality2 = getAddressComponents(address_components, "administrative_area_level_3");
                if (locality2 && locality2!=""){
                    geoNames.push(locality2);
                }
                
                geoNames = cleanArray(geoNames); //removes empty strings
                authorities.push.apply(authorities, getPMcontacts(geoNames));
                authorities.push.apply(authorities, getGNRcontacts(geoNames));
                authorities.push.apply(authorities, getPSPcontacts(geoNames));                              
                
                $("#street").removeClass("loading");
                $('#street').trigger('input');
                $("#street_number").removeClass("loading");
                $('#street_number').trigger('input');
                $("#locality").removeClass("loading");
                $('#locality').trigger('input');                
               
            }
            else {
                $.jAlert({
                    'title': "Erro!", 
                    'content': "Não foi possível detetar o local. Introduza-o manualmente."
                });
            }
        } 
        else {
            $.jAlert({
                'title': "Erro!", 
                'content': "Não foi possível detetar o local. Introduza-o manualmente."
            });
        }
    });
}



//gets "street_number", "route", "locality", "country", "postal_code", "administrative_area_level_2"(concelho)
function getAddressComponents(components, type) {    
    
    for (var key in components) {
        if (components.hasOwnProperty(key)) {            
            
            if (type == components[key].types[0]) {
                return components[key].long_name;
            }  
        }        
    }
}

//GPS/Google Postal Code -> Localities.postalCode -> Localities.municipality ->  Municipalities.code -> Municipalities.name -> PM_Contacts.nome
function getDataFromPostalCode( postalCode ){   

    console.log('getDataFromPostalCode: ' + postalCode);
    
    var locality, municipality, municipality_code;
    
    for (var key in Localities) {
        if (Localities[key].postalCode == postalCode){
            locality = Localities[key].locality;
            municipality_code = Localities[key].municipality;
            break
        }
    }
    
    for (var key in Municipalities){
        if (Municipalities[key].code == municipality_code){
            municipality = Municipalities[key].name;
            break
        }    
    }
    
    var toReturn = {
        "locality": $.trim(locality), 
        "municipality": $.trim(municipality)
    };
    return toReturn;
}

//try to get PM contacts based on name of municipality
//geoNames is an array with possible names for the area
function getPMcontacts( geoNames ){

    console.log(geoNames);
    console.log(PM_Contacts);
    
    var PMrelevantContacts = [];
    var municipalityName;
    var toAddBool;    
    
    for (var key in PM_Contacts){
        municipalityName = PM_Contacts[key].nome;        
        
        toAddBool = false;
        for (key2 in geoNames){            
            toAddBool = toAddBool || doStringsOverlap(geoNames[key2], municipalityName);      
        }
                
        if (toAddBool){       
            PMrelevantContacts.push(Array.from(PM_Contacts[key]));            
        }
    }
 
    for (var key3 in PMrelevantContacts){
        PMrelevantContacts[key3].nome = "Polícia Municipal: " + PMrelevantContacts[key3].nome;
    }
    
    return PMrelevantContacts;
}

//try to get GNR contacts based on name of municipality and locality
//geoNames is an array with possible names for the area
function getGNRcontacts( geoNames ){

    var GNRrelevantContacts = [];
    var GNRauthority;
    var toAddBool;
    
    for (var key in GNR_Contacts){
        municipalityName = GNR_Contacts[key].nome;
        
        toAddBool = false;
        for (key2 in geoNames){            
            toAddBool = toAddBool || doStringsOverlap(geoNames[key2], municipalityName);      
        }
                
        if (toAddBool){
            GNRrelevantContacts.push(GNR_Contacts[key]);
        }
    }
    
    for (var key in GNRrelevantContacts){
        GNRrelevantContacts[key].nome = "GNR: " + GNRrelevantContacts[key].nome;  
    }
    
    return GNRrelevantContacts;
}

//try to get PSP contacts based on name of municipality and locality
//geoNames is an array with possible names for the area
function getPSPcontacts( geoNames ){

    var PSPrelevantContacts = [];
    var PSPauthority;
    var toAddBool;    
    
    for (var key in PSP_Contacts){
        municipalityName = PSP_Contacts[key].nome;
        
        toAddBool = false;
        for (key2 in geoNames){            
            toAddBool = toAddBool || doStringsOverlap(geoNames[key2], municipalityName);      
        }
                
        if (toAddBool){
            PSPrelevantContacts.push(PSP_Contacts[key]);
        }
    }

    for (var key in PSPrelevantContacts){
        PSPrelevantContacts[key].nome = "PSP: " + PSPrelevantContacts[key].nome;  
    }
    
    return PSPrelevantContacts;
}

//for example: "Porto District" overlap with "Porto"
//this function is used to try to find similarities between strings
//so that one can find the authority applicable for a specific area name
function doStringsOverlap(string1, string2){
    
    if (string1 == "" || string2 == "" ){
        return false;
    }
    
    string1 = $.trim(string1);
    string1 = string1.toLowerCase();
    string2 = $.trim(string2);
    string2 = string2.toLowerCase();
    
    if(string1.includes(string2) || string2.includes(string1)){
        return true;
    }
    else{
        return false;
    }
}

      
   



