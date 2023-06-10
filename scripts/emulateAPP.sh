#!/bin/bash

export PATH=$PATH:/usr/local/android-sdk/tools
export PATH=$PATH:/usr/local/android-sdk/tools/bin
export PATH=$PATH:/usr/local/android-sdk
export PATH=$PATH:/usr/local/android-sdk/platform-tools
export PATH=$PATH:/usr/local/android-sdk/build-tools
export JAVA_HOME=/usr/lib/jvm/java-1.11.0-openjdk-amd64/
export ANDROID_SDK_ROOT=/usr/lib/android-sdk

cd "${0%/*}"


cordova build

if [ -z "$1" ] 
then
    cordova emulate --target=avd android
else
    cordova emulate --target=$1 android
fi



