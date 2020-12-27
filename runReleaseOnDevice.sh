#!/bin/bash

export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64/
export ANDROID_SDK_ROOT=/home/joao/Android/Sdk/
export PATH=${PATH}:$ANDROID_SDK_ROOT/tools:$ANDROID_SDK_ROOT/platform-tools

cd "${0%/*}"

#adb kill-server
#adb start-server

adb uninstall com.form.parking.violation

# extract $PASS
source keys/keyPassword

cordova clean

cordova build --release android

cp keys/autocosts.keystore platforms/android/app/build/outputs/apk/release/
cd platforms/android/app/build/outputs/apk/release/

jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore autocosts.keystore -storepass $PASS app-release-unsigned.apk autocosts

zipalign -v 4 app-release-unsigned.apk formParkingViolation.apk

cd ../../../../../../..

cordova run android --device --release