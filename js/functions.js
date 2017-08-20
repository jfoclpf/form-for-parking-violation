
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

//populates HTML select according to the information on municipalities.js file
//and sorts the MUNICIPALITIES alphabetically
function populatesMunicipalities(){
  
    var keys = [];
    for (var key in MUNICIPALITIES) {
        if (MUNICIPALITIES.hasOwnProperty(key)) {
            keys.push(key);
        }
    }
    keys.sort();
    $("#municipality").append("<option></option>");
    for (var i = 0; i < keys.length; i++) {
        key = keys[i];
        $("#municipality").append("<option>" + MUNICIPALITIES[key].name + "</option>");
    }
}

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

//detects if the car plate is correctly filled in
function isCarPlateOK(){
  
    var plate_str = $("#plate").val();
    plate_str = plate_str.toUpperCase(); // force place upcase

    plate_str = plate_str.replace(/−/g,'-'); // replace minus character with hifen 

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
    
    plate_str = plate_str.replace(/−/g,'-'); // replace minus character with hifen     
    
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
    plate_str = plate_str.replace(/−/g,'-'); // replace minus character with hifen 

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
        
        ImageUriArray.push(imageUri);
        
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

function removeImage(id){
    
    var elem = document.getElementById(id);
    elem.src = "";
    elem.style.display = "none";
}



