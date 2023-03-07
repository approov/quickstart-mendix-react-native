# APPROOV MENDIX APP EXAMPLE

This a Mendix native mobile app example to show how to integrate Approov in an a mobile app developed with the Mendix platform where you wish to secure API calls with Approov. This hand-on example provides a step-by-step of integrating Approov into an app using a simple Counter that can be increased based on a request to the Mendix Backend Runtime that can be secured with Approov. It also shows how third-party API calls can be protect with Approov.


## WHAT YOU WILL NEED

* Access to a trial or paid Approov account. If you don't have one you can subscribe to a [30 days Approov trial (no credit card)](https://approov.io/signup/).
* The `approov` command line tool [installed](https://approov.io/docs/latest/approov-installation/) with access to your account
* Mendix Studio Pro 9.18.4
* [Android Studio](https://developer.android.com/studio) installed (Android Studio Electric 2022.1.1 is used in this guide) or Xcode
* The contents of this repo


## BUILDING THE MENDIX NATIVE MOBILE APP

First, clone this repo into a location on your computer:

```console
https://github.com/approov/quickstart-mendix-react-native.git
```

Now, open Mendix Studio Pro and in the `Open App` pop-up select the option `Open App Locally` and select the file `ApprooovDemo.mpr` at the root of `example/approov-mendix-studio-pro` folder of the cloned repo.

![Open Mendix App in the Mendix Studio Pro](/readme-images/open-app.png)

Next, from the top menu bar select `App > Build Native Mobile App`:

![Open the menu Build native mobile app in Mendix Studio Pro](/readme-images/build-native-mobile-app.png)

Now, in the pop-up window select the `Configure app for local building`:

![Configure app for local building popup](/readme-images/configure-app-for-local-build.png)

Next, in the pop-up window select `Build type` from the left pane and then on `1.` configure the directory where you want to save and configure your native mobile app for Android and iOS, for example `C:\Users\User1\AndroidStudioProjects\YourMendixApp`. In `2.` deselect any option that is currently selected:

![In the open popup configure the the build type for the native mobile app](/readme-images/build-type.png)

Now, from the left pane select `Configure app locally` and then in `App configuration` enter a version number, for example `0.2.0`. For now you don't need to change the `Runtime URL` field:

![In the pop-up configure the app version number](/readme-images/configure-app-version-number.png)

Next, hit the `Configure locally` button on the the bottom right and wait for the build process to finish:

![Popup with the message that the build finished](/readme-images/build-finished.png)

Finally, when the build process is finished you need to switch to Android Studio or Xcode to continue following this example.


## RUNNING THE MENDIX APP WITHOUT APPROOV

Now that you have built a Mendix native mobile app project its time to build and run it on Android Studio and/or Xcode as you usually do for any other mobile app.

When the mobile app launches you will see first a login screen:

![Login screen](/readme-images/login-screen.png)

Hit that `Login` button and you should see the `Counter` screen from where you are free to play with incrementing the counter from the client and from the server. The API calls being made to the Mendix Backend Runtime are not secured with Approov at this stage, therefore they can be intercepted and manipulated with a MitM attack and/or with an Instrumentation Framework.

![Counter screen](/readme-images/counter-screen.png)

You can also explore the `Countries` tab and if you click on it you will see an empty screen:

![Empty countries screen](/readme-images/empty-countries-list.png)

If you click in the button at the bottom you get this list of countries:

![Countries screen](/readme-images/countries-list.png)

This list is retrieved from a third-party by doing an API request to `https://restcountries.com/v3.1/all`, that it's a free service not requiring an API key to access it, but if an API key would be required to access such a service and you would have to pay for it, then an attacker can have your API key extracted from the mobile app and have it reused outside of it. For example, in another app, on a bot, or even in manual API requests made with cURL or other tools, but you may only know about this API key leak when paying the bill or being rate limited by the third-party API service provider.

In the next section you will see how Approov can be integrated in a Mendix native mobile app to secure the API requests to the Mendix Backend Runtime and to any third-party API services to keep your App and API(s) secure from being tampered, have secrets stolen, and other sensitive data extracted by attackers.


## ADD THE APPROOV DEPENDENCY

In this section we assume that you have built the Mendix native mobile app from your Mendix project as instructed in the previous steps, thus all instructions from now on are based on the output generated by this build, thus all actions we instruct you to take must be done inside the folder where this build is located, not on the folder for your Mendix project or in your Mendix Studio Pro editor.

The Approov integration is available via the [`@approov/react-native-approov`](https://www.npmjs.com/package/@approov/react-native-approov) NPM package. This package is actually an open source wrapper layer that allows you to easily use Approov with `Mendix`. This has a further dependency to the closed source [Android Approov SDK](https://github.com/approov/approov-android-sdk) and [iOS Approov SDK](https://github.com/approov/approov-ios-sdk) packages. Those are automatically added as dependencies for the platform specific targets.

Now, run your Node package manager to install the latest version for the Approov dependency:

```console
npm install --save @approov/react-native-approov
```

The `package.json` file at the root of your Mendix native mobile app project should have now the Approov dependency listed:

```json
 "dependencies": {
    "@approov/react-native-approov": "3.1.1",
    "@mendix/native": "~1.0.0",
    ...
 },
```

> **ALERT:** Don't use an Approov version below `3.1.1` on your Mendix Mobile App, otherwise it will not work.


## ENSURE THE API IS ADDED

In order for Approov tokens to be generated for the Mendix Backend Runtime it is necessary to inform Approov about the domain of the API. Once you cannot add to the Mendix Backend Runtime the necessary code to check the Approov token, you will need to proxy all the requests made from the Mendix mobile app through a proxy. To this example we will use Cloudflare workers as a Reverse Proxy, but you can use any other reverse proxy in your project, provided you can add custom code to it.

From a terminal use the Approov CLI tool and execute the following: 

```console
approov api -add mendix.approov.workers.dev
```

> **NOTE:** The API domain `mendix.approov.workers.dev` it's live and you can use it to follow along this example, but in your Mendix mobile app integration you will need to setup yourself a reverse proxy.

Tokens for this domain will be automatically signed with the specific secret for this domain, rather than the normal one for your account.


## MODIFY THE APP TO USE APPROOV

Open the `Styling\native\main.js` native theme file on your Mendix Studio Pro, and then comment out and uncomment the lines as instructed on the file, and the final code should look like this:

```js
// *** COMMENT OUT THE LINE BELOW TO USE APPROOV ***
// export {}

// *** UNCOMMENT THE LINES BELOW TO USE APPROOV ***
import { NativeModules } from 'react-native'
const { ApproovService } = NativeModules

try {
    ApproovService.initialize("<enter-your-config-string-here>")
} catch (e) {
    // Approov doesn't attest mobile apps that are running against an API backend in localhost.
    // The try/catch block will allow you to continue developing as usual with your localhost 
    // instance of the Mendix Backend Runtime. 
    // You want or not to add some logging here. 
    // If you decide to show a pop-up to the user then don't use the exception message.
}

export {ApproovService}
```

The `<enter-your-config-string-here>` is a custom string that configures your Approov account access. This will have been provided in your Approov onboarding email. This initializes Approov when the app is first created. Please note that you must provide the `Config String` every time you initialize an `ApproovService` but the underlying SDK only actually initializes the library once. While the string isn't a secret you shouldn't commit it into git.

Next, you need to rebuild your Mobile native mobile app project from Mendix Studio Pro by following again the steps at [BUILDING THE MENDIX NATIVE MOBILE APP](#building-the-mendix-native-mobile-app) but this time you need to change the Mendix Runtime URL to point to the reverse proxy at `https://mendix.approov.workers.dev ` to have the mobile app going through the reverse proxy to have the Approov token checked and to only forward API requests to the Mendix Backend Runtime on a successfully Approov token validation:

![Configure the app version number with Approov integrated](/readme-images/configure-app-version-with-approov.png)

Now that you have rebuild the Mendix native mobile app project the `ApproovService` React Native package will handle any API request in the same way as usual in your mobile app, but with the additional features provided by the `Approov SDK`. The only additional requirement when using the `ApproovService` is providing an initialization string during object creation.

Depending on the native platform you are targeting, Android, iOS or both, you need to build the Mendix native mobile app in Android Studio and/or Xcode. This will ensure that the APK for Android and the IPA file for iOS are built and up to date with the latest changes, the addition of the Approov Service.

Next, try to run the mobile app and you should be present with an error. This is because now the App is protected with Approov, but once it isn't yet registered with the Approov Cloud Service it wasn't able to attest successfully, therefore it's getting invalid Approov tokens and consequently the API request is being denied at `https://mendix.approov.workers.dev`. To fix this its necessary to register the APK and/or IPA file with the Approov Cloud Service, which we will in the next step.


## REGISTER YOUR APP WITH APPROOV

In order for Approov to recognize the mobile app as being valid it needs to be registered with the Approov cloud service. Change directory to the top level of your Mendix native mobile app folder and then register the app with Approov:

```console
approov registration -add android\app\build\outputs\apk\debug\app-debug.apk
```

Note, some versions of Android Studio save the app in `app\build\intermediates\apk\debug\app-debug.apk`.

> **IMPORTANT:** The registration takes up to 30 seconds to propagate across the Approov Cloud Infrastructure, therefore don't try to run the app again before this time has elapsed. During development of your app you can ensure your device [always passes](https://approov.io/docs/latest/approov-usage-documentation/#adding-a-device-security-policy) so you do not have to register the APK each time you modify it.

[Managing Registrations](https://approov.io/docs/latest/approov-usage-documentation/#managing-registrations) provides more details for app registrations, especially for releases to the Play Store. Note that you may also need to apply specific [Android Obfuscation](https://approov.io/docs/latest/approov-usage-documentation/#android-obfuscation) rules for your app when releasing it.

For iOS it is necessary to explicitly build an `.ipa` in order to register it with Approov:

```console
approov registration -add build\ios\ipa\YourApp.ipa
```

Remember if you are using bitcode then you must also use the `-bitcode` option with the registration.


## MENDIX APP WITH APPROOV API PROTECTION

Now, without making any changes to the mobile app, relaunch it again and then play around with incrementing the counter or just by loading the Countries list, and everything should work as usual.

This means that the app is getting a validly signed Approov token to present to the shapes endpoint.

> **NOTE:** Running the app on an emulator will not provide valid Approov tokens. You will need to always pass the device (see below).


## WHAT IF THE MOBILE APP DOESN'T WORK

If the mobile app displays an error or doesn't start then there are some things you can try. Remember this may be because the device you are using has some characteristics that cause rejection for the currently set [Security Policy](https://approov.io/docs/latest/approov-usage-documentation/#security-policies) on your account:

* Ensure that the version of the app you are running is exactly the one you registered with Approov. Also, if you are running the app from a debugger then valid tokens are not issued.
* Look at the [`logcat`](https://developer.android.com/studio/command-line/logcat) output from the device. Information about any Approov token fetched or an error is output at the `DEBUG` level. You can easily [check](https://approov.io/docs/latest/approov-usage-documentation/#loggable-tokens) the validity and find out any reason for a failure.
* Consider using an [Annotation Policy](https://approov.io/docs/latest/approov-usage-documentation/#annotation-policies) during initial development to directly see why the device is not being issued with a valid token.
* Use `approov metrics` to see [Live Metrics](https://approov.io/docs/latest/approov-usage-documentation/#live-metrics) of the cause of failure.
* You can use a debugger or emulator and get valid Approov tokens on a specific device by ensuring it [always passes](https://approov.io/docs/latest/approov-usage-documentation/#adding-a-device-security-policy). As a shortcut, when you are first setting up, you can add a [device security policy](https://approov.io/docs/latest/approov-usage-documentation/#adding-a-device-security-policy) using the `latest` shortcut as discussed so that the `device ID` doesn't need to be extracted from the logs or an Approov token.
