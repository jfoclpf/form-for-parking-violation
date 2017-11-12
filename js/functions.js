
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

function getPathFromUri(uri){
    return uri.split("?")[0];
}

