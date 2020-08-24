#!/bin/bash

export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64/
export ANDROID_SDK_ROOT=/home/joao/Android/Sdk/
export PATH=${PATH}:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools

cd "${0%/*}"

# extract $PASS
source keys/keyPassword

cordova clean

cordova build android --prod --release &&

cd platforms/android/ && ./gradlew bundle &&

cd ../../

cp keys/autocosts.keystore platforms/android/app/build/outputs/bundle/release/
cd platforms/android/app/build/outputs/bundle/release/

jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore autocosts.keystore -storepass $PASS app-release.aab autocosts &&

cd ../../../../../../..
rm formParkingViolation.aab

cp platforms/android/app/build/outputs/bundle/release/app-release.aab ./formParkingViolation.aab
