#!/bin/bash

export JAVA_HOME=/usr/lib/jvm/java-1.21.0-openjdk-amd64/
export ANDROID_SDK_ROOT=/usr/lib/android-sdk
export PATH=${PATH}:$ANDROID_SDK_ROOT/tools:$ANDROID_SDK_ROOT/platform-tools

cd "${0%/*}" # directory of the script
cd ..        # root directory of the project

# extract $PASS
source keys/keyPassword

#adb kill-server
#adb start-server

# detect if device is connected
adb get-state 1>/dev/null 2>&1 && printf "\033[32mDEVICE ATTACHED\033[0m\n\n" || { printf "\033[31m No device attached\n\n"; exit 1; }

adb uninstall com.form.parking.violation

# extract $PASS
source keys/keyPassword

cordova clean

cordova run android --release -- --keystore=keys/autocosts.keystore --storePassword=$PASS --alias=autocosts --password=$PASS --packageType=apk
