#!/bin/bash

export JAVA_HOME=/usr/lib/jvm/java-1.11.0-openjdk-amd64/
export ANDROID_SDK_ROOT=/usr/lib/android-sdk
export PATH=${PATH}:$ANDROID_SDK_ROOT/tools:$ANDROID_SDK_ROOT/platform-tools

cd "${0%/*}" # directory of the script
cd ..        # root directory of the project

# extract $PASS
source keys/keyPassword

cordova clean

cordova build --release android -- --packageType=apk

cp keys/autocosts.keystore platforms/android/app/build/outputs/apk/release/
cd platforms/android/app/build/outputs/apk/release/

# old method
#jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore autocosts.keystore -storepass $PASS app-release-unsigned.apk autocosts

zipalign -v 4 app-release-unsigned.apk formParkingViolation.apk
apksigner sign --ks autocosts.keystore --pass-encoding utf-8 --ks-key-alias autocosts --ks-pass pass:$PASS --key-pass pass:$PASS formParkingViolation.apk

cd ../../../../../../..
rm -f dist/formParkingViolation.apk

cp platforms/android/app/build/outputs/apk/release/formParkingViolation.apk dist/

GREEN=$(tput setaf 2)
printf "\n\n${GREEN}File created at: dist/formParkingViolation.apk\n\n"
