# API Protection

You should use this option if you wish to protect access to your APIs using an Approov token. We recommend this approach where it is possible to modify the backend API implementation to perform the token verification. 


## REQUIREMENTS

* [Approov CLI](https://approov.io/docs/latest/approov-cli-tool-reference/) - please follow the [Installation](https://approov.io/docs/latest/approov-installation/) instructions.
* To use Approov in a Mendix App you need to proxy the request to be able to check the Approov token before it reaches the Mendix Runtime backend. An example of a easy to deploy and setup are:
    + [Cloudaflare workers](https://github.com/approov/quickstart-cloudflare_approov-worker)
    + [AWS API Gateway](https://github.com/approov/quickstart-aws-api-gateway-v2)
    + [Google Cloud API Gateway](https://github.com/approov/quickstart-google-cloud-api-gateway_cloud-run)
    + [Azure API Manegement Platform](https://github.com/approov/quickstart-azure-api-management)
    + [Nginx Plus Reverse Proxy](https://github.com/approov/quickstart-nginx-plus_approov-dynamic-module)
    + [Mulesoft API Gateway](https://github.com/approov/quickstart-mulesoft-api-gateway)
    + [Kong API Gateway](https://github.com/approov/quickstart-kong_approov-plugin)


You will need to implement a proxy in addition to the steps in this frontend guide. If none of the proxy is an option for you then plase contact us to discuss another approach.


## ADDING API DOMAINS

In order for Approov tokens to be added by the interceptor for particular API domains it is necessary to inform Approov about them. Execute the following command:

```
approov api -add your.api.domain.com
```

Approov tokens will then be added automatically to any requests to that domain (using the `Approov-Token` header, by default).

Note that this will also add a public key certicate pin for connections to the domain to ensure that no Man-in-the-Middle attacks on your app's communication are possible. Please read [Managing Pins](https://approov.io/docs/latest/approov-usage-documentation/#public-key-pinning-configuration) to understand this in more detail.

> **NOTE:** By default a symmetric account key is used to sign the Approov token (HS256 algorithm), so that all API domains will share the same signing secret. Alternatively, it is possible to use a [keyset key](https://approov.io/docs/latest/approov-usage-documentation/#managing-key-sets) which may differ for each API domain and for which a wide range of different signing algorithms and key types are available. This requires you to first [add a new key](https://approov.io/docs/latest/approov-usage-documentation/#adding-a-new-key), and then specify it when [adding each API domain](https://approov.io/docs/latest/approov-usage-documentation/#keyset-key-api-addition). Note that this will impact how you verify the token on your API backend.


## REGISTERING APPS

In order for Approov to recognize the app as being valid it needs to be registered with the service. Change directory to the top level of your app project and then register the app with Approov:

For Android:

```
approov registration -add C:\Users\User1\AndroidStudioProjects\path\to\apk
```

For iOS it is necessary to explicitly build an `.ipa` using the command `flutter build ipa`. This will provide the path of the `.ipa` that you can then register, e.g:

```
approov registration -add build\ios\ipa\YourApp.ipa
```

Remember if you are using bitcode then you must also use the `-bitcode` option with the registration.

> **IMPORTANT:** The registration takes about 30 seconds to propagate across the Approov Cloud Infrastructure, therefore don't try to run the app again before this time has elapsed. During development of your app you can ensure the device [always passes](https://approov.io/docs/latest/approov-usage-documentation/#adding-a-device-security-policy) so you do not have to register the APK each time you modify it.

[Managing Registrations](https://approov.io/docs/latest/approov-usage-documentation/#managing-registrations) provides more details for app registrations, especially for releases to the Play Store. Note that you may also need to apply specific [Android Obfuscation](https://approov.io/docs/latest/approov-usage-documentation/#android-obfuscation) rules for your app when releasing it.


## FURTHER OPTIONS

See [Exploring Other Approov Features](https://approov.io/docs/latest/approov-usage-documentation/#exploring-other-approov-features) for information about additional Approov features you may wish to try.

### Changing Approov Token Header Name

The default header name of `Approov-Token` can be changed as follows:

```Dart
ApproovService.setApproovHeader("Authorization", "Bearer ")
```

The first parameter is the new header name and the second a prefix to be added to the Approov token. This is primarily for integrations where the Approov Token JWT might need to be prefixed with `Bearer` and passed in the `Authorization` header.

### Token Binding

If want to use [Token Binding](https://approov.io/docs/latest/approov-usage-documentation/#token-binding) then set the header holding the value to be used for binding as follows:

```Dart
ApproovService.setBindingHeader("Authorization")
```

In this case it means that the value of `Authorization` holds the token value to be bound. This only needs to be called once. On subsequent requests the value of the specified header is read and its value set as the token binding value. Note that you should only select a header that is normally always present and the value does not typically change from request to request, as each change requires a new Approov token to be fetched.

### Prefetching

If you wish to reduce the latency associated with fetching the first Approov token, then construct an `ApproovClient` soon after app initialization (to provide the configuration string) and then call:

```Dart
ApproovService.prefetch()
```

This initiates the process of fetching an Approov token as a background task, so that a cached token is available immediately when subsequently needed, or at least the fetch time is reduced. Note that there is no point in performing a prefetch if you are using token binding.
