---
title: Happy Eyeballs
author: Kuon
tags: [english, react-native]
---

Years ago, when I was a junior developer at a certain devshop company, around 2019. There was an issue related to slow networking fetching, or at least that was what's written on the title of corresponding Jira ticket. Happened on the Project Manager's phone, a Samsung Galaxy one. I don't remember the model, but it was a phablet, and Samsung is infamous for their heavily Android-modified with questionable changes, compared to upstream Android repository.

Looking at the ticket detail, it seemed the issue only happened the first time it's launched. Not quite a "slowness", but more like the network request stucked at something, with no fallback, no timeout. The loading indicator is just there, menacingly.

To add more to the weirdness, it only happened when using office's wifi, which was provided by FPT (a popular domestic ISP), using a semi-proprietary router. It did not happen on cellular connection.

## Why?

After digging more onto the issue, with hours of debugging. No result. ADB only reported that there was just a network timeout request. No stack trace, no real error message. Turn off the wifi and use cellular data, it worked. Got the phone outside and connected to a cafe's public wifi, it also worked. Connect to another random wifi, it didn't.

"What was the culprit?". If it was _that easy_ to answer the question. Was the problem on server-side? Pretty sure it was not. The server was just a VPS instance, properly configured and one of the team member tried to make a throwaway app to connect to that server's API endpoints, it worked, on his phone, which was also an Android one.

It never happened on iOS.

In the afternoon, at a latter date, when it was almost the end of working hour. An idea popped up in my head:

> What if the request wasn't routed to the server, at all?

Things turned out to be very interesting.

## Happy eye-balls

Back to the present. Several days ago I found this Wikipedia article: https://en.wikipedia.org/wiki/Happy_Eyeballs

It's a fallback mechanism for applications that uses both IPv6 and IPv4.

Back then, IPv6 was not so popular in Vietnam, at least not explicitly. The router that was used, was semi-proprietary, and did not resolve the DNS properly. Reading up to this point, you may realize something: The server only had IPv4, behind a domain. Many tools can be used to check against this. Such as: https://dnschecker.org/ipv6-compatibility-checker.php

How did I prove my theory? I already knew React Native uses [OkHttp](https://square.github.io/okhttp/) under the hood. It is a great HTTP client library from Square. Looking at the `build.gradle.kts` [file](https://github.com/facebook/react-native/blob/main/packages/react-native/ReactAndroid/build.gradle.kts) (formerly `build.gradle`), we can see:

```kotlin
  api(libs.okhttp3.urlconnection)
  api(libs.okhttp3)
  api(libs.okio)
```

So... is it possible to customize the http client to resolve the DNS properly?

## OkHttp client DNS comes to play

Yes it is. React Native exposes `OkHttpClientProvider` to do that. Here's how it looks like in Java, and is used in `MainApplication` class:

```java title="MainApplication.java"
import com.yourapp;

import com.facebook.react.modules.network.OkHttpClientProvider; // Import this.

...

public class MainApplication extends Application implements ReactApplication {
  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {

  ...

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
    OkHttpClientProvider.setOkHttpClientFactory(new CustomNetworkModule()); // Add this line
  }
}
```

For `CustomNetworkModule`, it's a combination of `OkHttpClientFactory` subclass and `Dns` subclass. Take a look at the `Dns` first, because it is the crucial part to change how DNS resolving in OkHttp works. Following is written in Kotlin (so you can copy and paste easily):

```kotlin title="CustomDNS.kt"
package yourapp.customnetwork

import okhttp3.Dns
import java.net.Inet4Address
import java.net.InetAddress

class CustomDNS : Dns {
  override fun lookup(hostname: String): MutableList<InetAddress> {
    val addresses: MutableList<InetAddress> = InetAddress.getAllByName(hostname).toMutableList()
    if (addresses.size == 0) {
      Dns.SYSTEM.lookup(hostname)
    }

    val result: ArrayList<InetAddress> = ArrayList<InetAddress>()
    for (address in addresses) {
      if (address is Inet4Address) result.add(address)
    }

    for (address in addresses) {
      if (address !is Inet4Address) result.add(address)
    }

    return result
  }
}
```

As you can see, the `ArrayList<InetAddress>` is initialized and `Inet4Address` is checked against first, before anything else. This makes sure the IPv4 is prioritized.

But it can't be used as-is. A glue must be provided to get it working with React Native's OkHttp client. There comes the `CustomNetworkModule` class:

```kotlin title="CustomNetworkModule.kt"
package yourapp.customnetwork

import com.facebook.react.modules.network.OkHttpClientFactory
import com.facebook.react.modules.network.ReactCookieJarContainer
import okhttp3.OkHttpClient
import java.security.SecureRandom
import java.security.cert.X509Certificate
import java.util.concurrent.TimeUnit
import javax.net.ssl.*

class CustomNetworkModule : OkHttpClientFactory {
  override fun createNewNetworkModuleClient(): OkHttpClient {
    val trustAllCerts = arrayOf<TrustManager>(
      object : X509TrustManager {
        override fun getAcceptedIssuers(): Array<X509Certificate> {
          return emptyArray()
        }

        override fun checkClientTrusted(
          certs: Array<X509Certificate>, authType: String
        ) {
        }

        override fun checkServerTrusted(
          certs: Array<X509Certificate>, authType: String
        ) {
        }
      }
    )

    try {
      val sc = SSLContext.getInstance("SSL")
      sc.init(null, trustAllCerts, SecureRandom())
      val sslSocketFactory: SSLSocketFactory = sc.socketFactory

      return OkHttpClient.Builder()
        .dns(CustomDNS())
        .connectTimeout(10, TimeUnit.SECONDS)
        .sslSocketFactory(sslSocketFactory, trustAllCerts[0] as X509TrustManager)
        .hostnameVerifier(HostnameVerifier { hostname, session ->
          true
        })
        .cookieJar(ReactCookieJarContainer())
        .build()
    } catch (e: Exception) {
      return OkHttpClient.Builder()
        .dns(CustomDNS())
        .cookieJar(ReactCookieJarContainer())
        .build()
    }
  }
}
```

Some interfaces have to be implemented. Adjust it to match your needs. After writing the code, compiled it and ran, the infinite timeout was no more.
The issue can also be resolved by upgrading OkHttp library (which is v5 at the moment):

```groovy
implementation("com.squareup.okhttp3:okhttp:5.1.0")
implementation("com.squareup.okhttp3:logging-interceptor:5.1.0")
implementation("com.squareup.okhttp3:okhttp-urlconnection:5.1.0")
```

Do you still need this? It depends on who you are targeting. Many countries in UAE have problems with [resolving DNS from Cloudflare](https://github.com/facebook/react-native/issues/32730), and this trick can help in such cases. It also doesn't decrease network performance of your app.

Thanks to Square for the great library, and to my brain at that time, for not being stuck all the time.
