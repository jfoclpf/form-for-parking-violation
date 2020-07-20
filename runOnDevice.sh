#!/bin/bash

export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64/
export ANDROID_HOME=/home/joao/Android/Sdk/
export ANDROID_SDK_ROOT=/home/joao/Android/Sdk/
export PATH=${PATH}:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools


cd "${0%/*}"

adb kill-server
adb start-server

adb usb

adb uninstall com.form.parking.violation

cordova build
cordova run android --device

