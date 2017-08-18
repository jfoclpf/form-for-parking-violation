var APP_BOOL = true; //for www version set this to FALSE
console.log("APP_BOOL: ", APP_BOOL);
var DEBUG = false;
console.log("DEBUG: ", DEBUG);

function loadCordovaFile(){
    var head = document.getElementsByTagName('head')[0];
    var js = document.createElement("script");

    js.type = "text/javascript";
    js.src = "cordova.js";
    head.appendChild(js);    
}

if (APP_BOOL && !DEBUG) {
    loadCordovaFile();
}