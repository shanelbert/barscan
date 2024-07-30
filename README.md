## What is in this repo?

This repository contains scripts for creating an Android app that can scan barcodes and store the barcode values into spreadsheets. The app was developed using bare React Native (without the Expo framework) on Windows as the development OS, with Android as the target OS. This project used Expo Camera for the barcode scanning functionality. 

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Development](#development)
	- [Setting Up Development Environment](#setting-up-development-environment)
	- [Add Dependencies](#add-dependencies)
	- [Other](#other)

## Installation
The following are steps to create APK using scripts in this repo and install it to the target Android device:

1. Download this repo as a zip file.

2. Extract the zip file.

3. Open command prompt in the extracted folder, then run `npm install`.

4. Open another command prompt as administrator, navigate to `barscan/android/app` folder, then run the following command:
	
	`"C:/Program Files/Microsoft/jdk-17.0.11.9-hotspot/bin/keytool.exe" -genkeypair -v -storetype PKCS12 -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000`
	
	Change the `jdk-17.0.11.9-hotspot` in the command above to your version of JDK.
	
	<img src="https://drive.usercontent.google.com/download?id=1ouu8hN24di4Ppf9C2wZhaxDLX5onPsgK" width="640px">
	
	If you download the JDK using Chocolatey, your Java installation will likely be located in `C:/Program Files/Microsoft`. If you choose a different installation method, it might be installed in `C:/Program Files/Java`. Adjust the JDK path in the command above based on your specific situation.
	
	This command will prompt you for several information, then generates the keystore as a file called `my-upload-key.keystore`.
	
5. Add the following lines to `barscan/android/gradle.properties` file (replace both of the "******" with your keystore password):
	
	```
	MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
	MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
	MYAPP_UPLOAD_STORE_PASSWORD=******
	MYAPP_UPLOAD_KEY_PASSWORD=******
	```
	
	Do not change the `MYAPP` part.

6. Edit the `barscan/android/app/build.gradle` file as shown below:
	
	```gradle
	// ...
	
	android {
			// ...
			
			signingConfigs {
					// ...
					
					// add this block
					release {
							if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
									storeFile file(MYAPP_UPLOAD_STORE_FILE)
									storePassword MYAPP_UPLOAD_STORE_PASSWORD
									keyAlias MYAPP_UPLOAD_KEY_ALIAS
									keyPassword MYAPP_UPLOAD_KEY_PASSWORD
							}
					}
			}
			buildTypes {
					// ...
				
					release {
							// ...
							// signingConfig signingConfigs.debug // comment this line
							signingConfig signingConfigs.release // add this line
							minifyEnabled enableProguardInReleaseBuilds
							proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
					}
			}
	}
	
	// ...
	```

7. Open command prompt, go to the `barscan/android` folder, then run:
	
	`gradlew assembleRelease`
	
	Your APK will be generated in the `barscan/android/app/build/outputs/apk/release` folder.
	
8. In your Android device, uninstall any previous version of the app you already have installed. 

9. Plug in your Android device to the development machine, open command prompt, then run the following command from the root of the project folder to install the APK to your Android device:
	
	`adb install -r android/app/build/outputs/apk/release/app-release.apk`
	
	Alternatively, you can copy the APK to your device and install it from there.
	
## Usage

This section assumes you have [this server](https://github.com/shanelbert/barscan_server) running and connected to the same local network as your Android device.  

1. Create a new Google spreadsheet file.

2. Share the file's **edit** access to the Google service account.
	
	<img src="https://drive.usercontent.google.com/download?id=17w7zpPJ_ibIGSJ_iH72PRbfVl-jbJ2T7" width="800px">
	
	To get the service account's email, go to [this page](https://console.cloud.google.com/projectselector2/iam-admin/serviceaccounts?supportedpurview=project), select your project, then copy the service account's email.
	
	<img src="https://drive.usercontent.google.com/download?id=1IDoZmhH0TgfskqQ8w44DMNC79kQ3heP_" width="800px">
	
3. Open the Android app.

4. Click the gear button at the upper right.
	
	<img src="https://drive.usercontent.google.com/download?id=1j2mbZC4GNHhiXJLix0l9eLhgSOJp8bS2" width="360px">

5. Input the IP address of the server, then click the "SET" button.
	
	<img src="https://drive.usercontent.google.com/download?id=1d3qE2GRhwJ4q6Mbx-MQT_6L16P-BqeyR" width="360px">

6. Enter the spreadsheet's URL, then click the "REGISTER" button.
	
	<img src="https://drive.usercontent.google.com/download?id=1okyxRPexBJ7vErllGy_NXAzcwL_bozIy" width="360px">
	
	You can register multiple spreadsheets.

7. Click the back button at the upper left.

8. Click the "SELECT" button under the "Spreadsheet File", then select the spreadsheet you have just added.
	
	<img src="https://drive.usercontent.google.com/download?id=1JyfnFbYCUvPclGRGDSMy-oOGhQ6K1ihy" width="360px">
	
9. Click the "SELECT" button under the "Sheet", then choose the sheet where you want to write the barcode value.
	
	<img src="https://drive.usercontent.google.com/download?id=1Vdp5NWF-aF0vSVada5SbAehvrNLpFFvO" width="360px">

10. Click the "SCAN" button under the "Serial No.". Move your device closer or farther until the barcode is read. If there are several barcodes, the app will only read barcode inside the dashed rectangle.
	
	<img src="https://drive.usercontent.google.com/download?id=1zFCafnCdv4TrL1_qahTyu-7YGz8eZgQZ" width="360px">
	
	> Scanning barcode in a dark environment may be more challenging, so ensure you have sufficient light.

11. Click the "SUBMIT" button. You will see the barcode value in the spreadsheet.
	
	<img src="https://drive.usercontent.google.com/download?id=1Qz9UL89MWJ0ipfBsrqF_kSF068VWP9UY" width="800px">

## Development
This section are adapted from the official React Native documentation (version 0.74):
- [Setting up development environment](https://reactnative.dev/docs/set-up-your-environment)
- [Create and run the app](https://reactnative.dev/docs/getting-started-without-a-framework)

### Setting Up Development Environment
1. [Install Chocolatey](https://chocolatey.org/install#install-step2). Run PowerShell as administrator, then run the following command:
	
	`Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))`

2. Install Node JS and Java Development Kit (JDK) using Chocolatey. Open command prompt as administrator, then run the following command:
	
	`choco install -y nodejs-lts microsoft-openjdk17`
	
	If you have other version of Node or JDK installed from previous projects, you can uninstall it by running:
 
	`choco uninstall nodejs-lts microsoft-openjdk17`

3. [Download and install Android Studio](https://developer.android.com/studio)

4. Install Android SDK. Open Android Studio, then open SDK Manager. 
	
	<img src="https://drive.usercontent.google.com/download?id=16fq0k1UHTvaPjMptXneFfL_KTlM4s_qb" width="800px">
	
	In the SDK Manager:
	1. Select "SDK Platforms" tab, then check the "Show Package Details" box. Check the following items under the "Android 14.0 ("UpsideDownCake")" entry:
		- Android SDK Platform 34
		- Intel x86_64 Atom System Image
		
		There are several "Android 14.0 ("UpsideDownCake")" entries. Make sure that you only check the items as shown below and unchecked everything else in the "SDK Platforms" tab.
		
		<img src="https://drive.usercontent.google.com/download?id=1J961HfJDq7u4iSOZID_5G1G7wIDuYtvh" width="800px">
	
	2. Select "SDK Tools" tab, then check the "Show Package Details" box. Under the "Android SDK Build-Tools 35" entry, check the "34.0.0" box. Uncheck everything else under the "Android SDK Build-Tools 35" entry. 
		
		<img src="https://drive.usercontent.google.com/download?id=1w-qhpdE3nj0ZJRbiMgcywrXbiqrNv5uv" width="800px">
		
		Under the "NDK (Side by side)" entry, check the "26.1.10909125" box.
		
		<img src="https://drive.usercontent.google.com/download?id=10Y_PGYzMaiqw3DTI2JksyuY3wEfljAoU" width="800px">
	
	3. Apply the changes.
	
5. Add and edit environment variables.
	1. Press Windows key, search "environment variables", then click on the "Edit the system environment variables".
		
		<img src="https://drive.usercontent.google.com/download?id=11fujmZtrN7hvlna2lfD-VMgrVVP5snT7" width="640px">
	
	2. Click the "Environment Variables..." button.
		
		<img src="https://drive.usercontent.google.com/download?id=1k2VWD6csrEVar2Dqlv7jjR1HXYzECl4q" width="480px">
			
	3. In the user variables section, select the "New..." button. 
		
		<img src="https://drive.usercontent.google.com/download?id=1QCeZP55n00l3mDeHHmqyiJHuBTIX7r9z" width="480px">
	
	4. Input these following values:
		- Variable name: `ANDROID_HOME`
		- Variable value: `%LOCALAPPDATA%\Android\Sdk`
		
		<img src="https://drive.usercontent.google.com/download?id=1skuwA8EFOWzAMB5b63ZoyBXh6thmTFul" width="640px">
	
	5. Click the "OK" button.
		
	6. In the system variables section, select the "Path" variable, then click the "Edit..." button.
		
		<img src="https://drive.usercontent.google.com/download?id=1CjkzBVU6BiwrpWiGRLG8MOrOEAC18hAQ" width="480px">
		
	7. Click the "New" button, then add `%LOCALAPPDATA%\Android\Sdk\platform-tools`.
		
		<img src="https://drive.usercontent.google.com/download?id=18pSQSYmv-0tN-oQ6upN_Mz57jZuM97nO" width="480px">
		
	8. Click the "OK" buttons.
		
		<img src="https://drive.usercontent.google.com/download?id=129vbC75sMdZqCT-OJD8AsbZ6-wdFP8At" width="480px">
		
		<img src="https://drive.usercontent.google.com/download?id=1w_f_zmaJUUQV7gqkW9dvmy5OG9ximcIF" width="480px">

6. Open command prompt, then run the following command to create a React Native app in the current directory:
	
	`npx @react-native-community/cli@latest init barscan`

7. Prepare a physical Android device. The app uses camera so it is recommended that you use physical device instead of virtual one.
	1. Enable USB debugging on. The following are steps to enable it in Xiaomi POCO F3:
		1. Go to your phone settings, then tap "About phone".
			
			<img src="https://drive.usercontent.google.com/download?id=1c_GMzFFiMIHSFFbdwwovL-brOVYYnlO7" width="360px">
		
		2. Tap "OS version (for POCO)" seven times.
			
			<img src="https://drive.usercontent.google.com/download?id=1e9qaw5C68eM7qdF9XZgB4haois4NCCnp" width="360px">
		
		3. Go back, then select "Additional settings"
			
			<img src="https://drive.usercontent.google.com/download?id=1B3VkMQHG46Z5339t20aAWP97vZoMN4Ce" width="360px">
		
		4. Select "Developer options".
			
			<img src="https://drive.usercontent.google.com/download?id=1iET4KwTKNmfDtYbS4zmWY0lqt4vhxHTc" width="360px">
		
		5. Turn on "USB debugging", "Install via USB", and "USB debugging (Security settings)".
			
			<img src="https://drive.usercontent.google.com/download?id=1QUqjnc3habXX_ZagZPTxB3MvxHcETUbg" width="360px">
		
	2. Plug in your device via USB to your development machine.
	
	3. Run `adb devices` in command prompt. You will see your device in the list if it is connected successfully.
	
		```
		List of devices attached
		310bfb0 device
		```
	
8. Start Metro development server. Open command prompt in your project folder, then run `npm start`.

9. Open new command prompt inside your project folder, then run `npm run android`.

10. You will probably get the following error:
	
	<img src="https://drive.usercontent.google.com/download?id=1IlI5-m8ktF3gYyZAJfhq3GYx_0-AqUWs" width="800px">
	
	If you don't get the error, skip this step. If you do, open `barscan/android/gradle/wrapper/gradle-wrapper.properties` file, then change the following line:
	
	`distributionUrl=https\://services.gradle.org/distributions/gradle-8.6-all.zip`
	
	to 
	
	`distributionUrl=https\://services.gradle.org/distributions/gradle-8.5-all.zip`
	
	Reference: <https://github.com/gradle/gradle/issues/27844#issuecomment-2078200254>

### Add Dependencies

1. Add expo camera to the project dependency. The following installation steps are taken from [Expo installation page](https://docs.expo.dev/bare/installing-expo-modules/) and [Expo Camera library's readme](https://github.com/expo/expo/tree/sdk-51/packages/expo-camera#installation-in-bare-react-native-projects).

	1. Open command prompt in the project folder then run `npx install-expo-modules@latest`.
		
		This will automatically install Expo and make changes to the following files to configure the Expo modules:
		- barscan/android/app/src/main/java/com/barscan/MainActivity.kt
		- barscan/android/app/src/main/java/com/barscan/MainApplication.kt
		- barscan/android/settings.gradle
		- barscan/ios/barscan/AppDelegate.h
		- barscan/ios/Podfile
		
		Ignore the pod installation error.
		
		<img src="https://drive.usercontent.google.com/download?id=19LgZTkpkwtBoAlKFM0-YKRUpGBoQkiYU" width="640px">
	
	2. Run the following command to add Expo Camera to your app `npx expo install expo-camera`.
	
	3. Add camera permission to `barscan/android/app/src/main/AndroidManifest.xml` file as shown below:
		
		```xml
		<manifest xmlns:android="http://schemas.android.com/apk/res/android">
				
				<uses-permission android:name="android.permission.CAMERA" /> <!--  add this -->
				
				<uses-permission android:name="android.permission.INTERNET" /> 
				
				<application
					android:name=".MainApplication"
					android:label="@string/app_name"
					android:icon="@mipmap/ic_launcher"
					android:roundIcon="@mipmap/ic_launcher_round"
					android:allowBackup="false"
					android:theme="@style/AppTheme">
					<activity
						android:name=".MainActivity"
						android:label="@string/app_name"
						android:configChanges="keyboard|keyboardHidden|orientation|screenLayout|screenSize|smallestScreenSize|uiMode"
						android:launchMode="singleTask"
						android:windowSoftInputMode="adjustResize"
						android:exported="true">
						<intent-filter>
								<action android:name="android.intent.action.MAIN" />
								<category android:name="android.intent.category.LAUNCHER" />
						</intent-filter>
					</activity>
				</application>
		</manifest>
		```
	
	4. Add a new maven block in `barscan/android/build.gradle` file as shown below:
	
	```gradle
	buildscript {
			ext {
					buildToolsVersion = "34.0.0"
					minSdkVersion = 23
					compileSdkVersion = 34
					targetSdkVersion = 34
					ndkVersion = "26.1.10909125"
					kotlinVersion = "1.9.22"
			}
			repositories {
					google()
					mavenCentral()
			}
			dependencies {
					classpath("com.android.tools.build:gradle")
					classpath("com.facebook.react:react-native-gradle-plugin")
					classpath("org.jetbrains.kotlin:kotlin-gradle-plugin")
			}
	}
	
	// add this whole block
	allprojects {
			repositories {
					maven {
							url "$rootDir/../node_modules/expo-camera/android/maven"
					}
			}
	}
	
	apply plugin: "com.facebook.react.rootproject"
	```
	
	> Expo BarCodeScanner [usage reference](https://docs.expo.dev/versions/latest/sdk/bar-code-scanner/#usage)

2. Add React Navigation to the project dependency.

	1. Open command prompt in the project folder then run:
		
		`npm install @react-navigation/native react-native-screens react-native-safe-area-context` 
	
	2. Add an import statement and a method to the MainActivity class in `barscan/android/app/src/main/java/com/barscan/MainActivity.kt`:
		
		```kt
		package com.barscan
		import expo.modules.ReactActivityDelegateWrapper
		import android.os.Bundle; // add this
		
		// ...
		
		class MainActivity : ReactActivity() {
			
			// ...
						
			// add this
			override fun onCreate(savedInstanceState: Bundle?) {
				super.onCreate(null)
			}
		}
		```
	
	3. Run `npm install @react-navigation/native-stack`.
		
		> React Navigation [usage reference](https://reactnavigation.org/docs/getting-started/)

3. Add React Native Async Storage to the project dependency. Open command prompt in the project folder, then run:
	
	`npm install @react-native-async-storage/async-storage`
	
	> React Native Async Storage [usage reference](https://react-native-async-storage.github.io/async-storage/docs/usage)
	
4. Add React Native Snackbar to the project dependency. Open command prompt in the project folder, then run:
	
	`npm install react-native-snackbar`
	
	> React Native Snackbar [usage reference](https://www.npmjs.com/package/react-native-snackbar#how-it-works) 
	
### Other
To allow the app to make HTTP requests (instead of only HTTPS), edit the `barscan/android/app/src/main/AndroidManifest.xml` file as shown below:

```xml
<!-- ... -->

	<application
		android:name=".MainApplication"
		android:label="@string/app_name"
		android:icon="@mipmap/ic_launcher"
		android:roundIcon="@mipmap/ic_launcher_round"
		android:allowBackup="false"
		android:theme="@style/AppTheme"
		android:usesCleartextTraffic="true"> <!-- add this -->
		
		<!-- ... -->
		
	</application>

<!-- ... -->
```

After generating the template app and installing the dependencies, you can copy these folders and files to your project to add the app functionality: 
- `barscan/components`
- `barscan/assets`
- `barscan/utils`
- `barscan/App.tsx`