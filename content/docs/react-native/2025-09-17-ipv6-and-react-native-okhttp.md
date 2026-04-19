---
title: Happy Eyeballs
author: Kuon
tags: [english, react-native]
---

Years ago, when I was a junior developer at a certain dev shop around 2019, there was an issue related to slow network requests, or at least that's what was written in the title of the corresponding Jira ticket. It happened on the Project Manager's phone, a Samsung Galaxy One. I don't remember the model, but it was a phablet, and Samsung is infamous for their heavily modified Android ROMs with questionable changes compared to the upstream Android repository.

Looking at the ticket details, it seemed the issue only happened the first time the app was launched. It wasn't quite "slowness," but more like the network request was stuck on something, with no fallback and no timeout. The loading indicator just sat there menacingly.

To add to the weirdness, it only happened when using the office Wi-Fi, which was provided by FPT (a popular domestic ISP) through a semi-proprietary router. It did not happen on cellular connections.

## Why?

After digging deeper into the issue for hours with no results, ADB only reported a network timeout. There were no stack traces or real error messages. Turning off Wi-Fi and using cellular data worked. Taking the phone outside and connecting to a café's public Wi-Fi also worked. Connecting to another random Wi-Fi did not work.

"What was the culprit?" That was easy to answer, wasn't it? Was the problem on the server side? I was pretty sure it wasn't. The server was just a VPS instance, properly configured, and one of the team members tried to make a throwaway app to connect to that server's API endpoints. It worked on his phone, which was also an Android device.

It never happened on iOS.

In the afternoon, at a later date, when it was almost the end of the working day, an idea popped into my head:

> What if the request wasn't routed to the server at all?

Things turned out to be very interesting.

## Happy Eyeballs

Back to the present. Several days ago, I found this Wikipedia article: https://en.wikipedia.org/wiki/Happy_Eyeballs

It's a fallback mechanism for applications that use both IPv6 and IPv4.

Back then, IPv6 was not very popular in Vietnam, at least not explicitly. The router that was used was semi-proprietary and did not resolve DNS properly. Reading up to this point, you may realize something: the server only had IPv4, behind a domain. Many tools can be used to check against this. Such as: https://dnschecker.org/ipv6-compatibility-checker.php

How did I prove my theory? I already knew React Native uses [OkHttp](https://square.github.io/okhttp/) under the hood. It is a great HTTP client library from Square. Looking at the `build.gradle.kts` [file](https://github.com/facebook/react-native/blob/main/packages/react-native/ReactAndroid/build.gradle.kts) (formerly `build.gradle`), we can see:

```kotlin
  api(libs.okhttp3.urlconnection)
  api(libs.okhttp3)
  api(libs.okio)
```

So... is it possible to customize the HTTP client to resolve DNS properly?

## OkHttp Client DNS Comes to Play

Yes, it is. React Native exposes `OkHttpClientProvider` to do that. Here's how to do it in Java, used in the `MainApplication` class:

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

For `CustomNetworkModule`, it's a combination of `OkHttpClientFactory` and `Dns` subclasses. Take a look at `Dns` first, because it's the crucial part to change how DNS resolution works in OkHttp. Here's how it's written in Kotlin (so you can easily copy and paste):

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

As you can see, the `ArrayList<InetAddress>` is initialized and `Inet4Address` is checked first. This ensures IPv4 is prioritized.

But it can't be used as-is. Some glue code must be provided to get it working with React Native's OkHttp client. That's where the `CustomNetworkModule` class comes in:

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

Some interfaces have to be implemented. Adjust it to match your needs. After writing and compiling the code, I ran it, and the infinite timeout was gone.

The issue can also be resolved by upgrading the OkHttp library (which is v5 at the moment):

```groovy
implementation("com.squareup.okhttp3:okhttp:5.1.0")
implementation("com.squareup.okhttp3:logging-interceptor:5.1.0")
implementation("com.squareup.okhttp3:okhttp-urlconnection:5.1.0")
```

Do you still need this? It depends on who you are targeting. Many countries in the UAE have problems with [resolving DNS from Cloudflare](https://github.com/facebook/react-native/issues/32730), and this trick can help in such cases. It also doesn't decrease your app's network performance.

Thanks to Square for the great library, and to my brain back then, for not being stuck all the time.