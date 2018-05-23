
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

//initializes date and time with current date and time
function updateDateAndTime(){    
    var date = new Date();
    $("#date").datepicker('setDate', date);
    var currentTime = pad(date.getHours(), 2) + ':' + pad(date.getMinutes(), 2);
    $("#time").val(currentTime);
}

function getPathFromUri(uri){
    return uri.split("?")[0];
}


//ex: from "file:///storage/emulated/0/Android/data/com.form.parking.violation/cache/1525698243664.jpg"
//output[0] == "file:///storage/emulated/0/Android/data/com.form.parking.violation/cache"
//output[1] == "1525698243664.jpg"
function getFilenameFromURL(url){ 
    if (!url){
        return false;
    }
    var output = [];    
    output[1] = url.split('/').pop();
    output[0] = url.substring(0, url.length-output[1].length-1);
    return output;
}

//from "https://example.com/folder/file.jpg?param.eter#hash=12.345"
//output ------> jpg
function getExtensionFromURL(url) {
    return url.split(/\#|\?/)[0].split('.').pop().trim();
}

/*use it like this, for example:
copyFile("file:///storage/emulated/0/Android/data/com.form.parking.violation/cache/IMG-20180505-WA0004.jpg",        "myImg.jpg", LocalFileSystem.TEMPORARY); 
see https://stackoverflow.com/a/50221986/1243247 */
function _copyFile(baseFileURI, destPathName, fileSystem){
    console.log("Copying from: " + baseFileURI);
    
    if(!baseFileURI){
        console.error("File to copy empty or null");
        return;   
    }
              
    return new Promise(function(resolve, reject) {
        window.resolveLocalFileSystemURL(baseFileURI, 
            function(file){
                window.requestFileSystem(fileSystem, 0, 
                    function (fileSystem) {
                        var documentsPath = fileSystem.root;
                        console.log(documentsPath);
                        file.copyTo(documentsPath, destPathName,
                        function(res){                        
                            console.log('copying was successful to: ' + res.nativeURL);  
                            resolve(res.nativeURL);
                        }, 
                        function(){
                            console.log('unsuccessful copying');
                        });
                    });
            }, 
            function(){
                console.log('failure! file was not found');
                reject();
            }
        );
    });
} 


function copyFile(baseFileURI, destPathDir){
    console.log("Copying : " + baseFileURI);   
    
    function getFilenameFromURL(url){ 
        if (!url){
            return false;
        }
        var output = [];    
        output[1] = url.split('/').pop();
        output[0] = url.substring(0, url.length-output[1].length-1);
        return output;
    }    
    
    var destPathName = getFilenameFromURL(baseFileURI)[1];
    
    if(!baseFileURI || !destPathName){
        console.error("File to copy empty or invalid");
        return;   
    }
    
    if(!destPathDir){
        console.error("Directory to copy empty or null");
        return;   
    }         
         
    console.log("Copying to: " + destPathDir + destPathName); 
    
    return new Promise(function(resolve, reject) {
        window.resolveLocalFileSystemURL(baseFileURI, 
            function(file){
                window.resolveLocalFileSystemURL(destPathDir, 
                    function (destPathDirObj) {                        
                        console.log(destPathDirObj);
                    
                        file.copyTo(destPathDirObj, destPathName,
                        function(res){                        
                            console.log('copying was successful to: ' + res.nativeURL);  
                            resolve(res.nativeURL);
                        }, 
                        function(){
                            console.log('unsuccessful copying');
                        });
                    });
            }, 
            function(){
                console.log('failure! file was not found');
                reject();
            }
        );
    });
} 

function moveFile(baseFileURI, destPathDir){
    console.log("Moving : " + baseFileURI);   
    
    function getFilenameFromURL(url){ 
        if (!url){
            return false;
        }
        var output = [];    
        output[1] = url.split('/').pop();
        output[0] = url.substring(0, url.length-output[1].length-1);
        return output;
    }    
    
    var destPathName = getFilenameFromURL(baseFileURI)[1];
    
    if(!baseFileURI || !destPathName){
        console.error("File to move empty or invalid");
        return;   
    }
    
    if(!destPathDir){
        console.error("Directory to move empty or null");
        return;   
    }         
         
    console.log("Moving to: " + destPathDir + destPathName); 
    
    return new Promise(function(resolve, reject) {
        window.resolveLocalFileSystemURL(baseFileURI, 
            function(file){
                window.resolveLocalFileSystemURL(destPathDir, 
                    function (destPathDirObj) {                        
                        console.log(destPathDirObj);
                    
                        file.moveTo(destPathDirObj, destPathName,
                        function(res){                        
                            console.log('moving was successful to: ' + res.nativeURL);  
                            resolve(res.nativeURL);
                        }, 
                        function(){
                            console.log('unsuccessful moving');
                        });
                    });
            }, 
            function(){
                console.log('failure! file was not found');
                reject();
            }
        );
    });
} 

//example: list of www/audio/ folder in cordova/ionic app.
//listDir(cordova.file.applicationDirectory + "www/audio/");
function listDir(path){
  window.resolveLocalFileSystemURL(path,
    function (fileSystem) {
      var reader = fileSystem.createReader();
      reader.readEntries(
        function (entries) {
          console.log(entries);
        },
        function (err) {
          console.log(err);
        }
      );
    }, function (err) {
      console.log(err);
    }
  );
}

function getFileSize(fileUri) {
    return new Promise(function(resolve, reject) {    
        window.resolveLocalFileSystemURL(fileUri, function(fileEntry) {
            fileEntry.file(function(fileObj) {
                resolve(fileObj.size);
            },
            function(err){
                reject(err);
            });
        }, 
        function(err){
            reject(err);
        });
    });
}

function isThisAndroid(){
    return device.platform.toLowerCase() === "android";
}

function adaptURItoAndroid(imgUR){
    
    if(!isThisAndroid() || !imgUR){
        return imgUR;
    }
    
    //the string is of the type "/path/to/dest"
    if (!imgUR.includes("://")){
        return "file://" + imgUR;
    }
    //it does include some protocol blabla://
    //replace by file://
    else{
        return "file://" + imgUR.split("://")[1];
    }
}
