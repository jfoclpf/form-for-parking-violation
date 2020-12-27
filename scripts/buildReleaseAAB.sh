#!/bin/bash

export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64/
export ANDROID_SDK_ROOT=/home/joao/Android/Sdk/
export PATH=${PATH}:$ANDROID_SDK_ROOT/tools:$ANDROID_SDK_ROOT/platform-tools

cd "${0%/*}" # directory of the script
cd ..        # root directory of the project

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
rm -f dist/formParkingViolation.aab

cp platforms/android/app/build/outputs/bundle/release/app-release.aab dist/formParkingViolation.aab

GREEN=$(tput setaf 2)
printf "\n\n${GREEN}File created at: dist/formParkingViolation.aab\n\n"
