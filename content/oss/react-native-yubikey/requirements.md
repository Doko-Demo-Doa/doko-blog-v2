---
title: Requirements
description: System and device requirements for react-native-yubikit
---

## React Native

- **React Native 0.74+**, with the **New Architecture (Fabric/TurboModules) enabled**.
- There is no old-bridge/Paper support at all - the library is built exclusively as a set of TurboModules with Codegen specs. If your app hasn't turned on the New Architecture, none of this will link.
- The library ships its own `YubiKeyProvider` + `useYubiKey()` hook for discovery state (see [Getting Started](./getting-started.md)); you can still build a custom one around `Core.addYubiKeyListener` if you need different state shape (see [Advanced Patterns](./advanced.md)). The hook covers basic usage of `Core` module.

## iOS

- **Xcode** recent enough to build RN 0.74+/New Architecture apps.
- **Deployment target 16.4+ recommended.** USB-C "smart card" connections (`YKFSmartCardConnection`) are gated to iOS 16+ in the native code; Lightning/MFi accessory connections (`YKFAccessoryConnection`) work on older iOS versions supported by the underlying SDK.
- **CocoaPods:** the library depends on the `YubiKit` pod, but the version published to the CocoaPods trunk (currently 4.4.0) is **too old** - this library needs 4.7.0+ APIs (PIV slot/bio metadata, key deletion, FIDO2 `minPinLength`, `Management.deviceReset`). You must override the Podfile to pull YubiKit iOS SDK 4.7.0 directly from GitHub. See [Installation](./installation.md) for the exact snippet.
- **None of the transport-specific entitlements are added automatically.** Depending on which transports you need, you must manually add: the `com.yubico.ylp` external accessory protocol (Lightning/5Ci), the `com.apple.security.smartcard` entitlement (USB-C on iOS 16+), and the NFC reader-session capability plus `NFCReaderUsageDescription` and AID list (NFC). See [Installation](./installation.md) for the exact snippets - the library's own example app configures the NFC one (via `expo.ios.infoPlist`/`expo.ios.entitlements` in `example/app.json`), since NFC is what its own test hardware uses, but not the Lightning protocol string or smart-card entitlement.

## Android

- **`minSdkVersion` 24**, `compileSdkVersion` 36.
- Kotlin `2.0.21`, Java 17 source/target compatibility, AGP `8.7.2`.
- Bundles YubiKit Android SDK **3.1.0** (pinned - a newer 3.2.0 requires `compileSdk 37`/AGP 9.1+, which isn't compatible with current Expo/RN tooling used by this library).
- The library's own `AndroidManifest.xml` already declares `android.hardware.usb.host` (`required="false"`) and the `NFC` permission - these merge into your app automatically. **You do not need to add them yourself.**
- There is **no `USB_PERMISSION` Android permission string** - that's not a real Android permission constant. USB host access is granted at runtime through `UsbManager`'s own permission-request flow, not through a manifest `<uses-permission>` entry.

## Device compatibility

| Connection                | Platform                                                     | Notes                                                                                                                                            |
| ------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| USB-C ("smart card")      | iOS 16+, Android (minSdk 24+)                                | `YKFSmartCardConnection` on iOS                                                                                                                  |
| Lightning (MFi accessory) | iOS (any version supported by YubiKit 4.7.0)                 | `YKFAccessoryConnection` on iOS; the JS `Transport` type just reports `'usb'` - it doesn't distinguish Lightning-accessory from USB-C-smart-card |
| NFC                       | iOS (CoreNFC-capable devices), Android (NFC-capable devices) | Requires manual Info.plist / capability setup on iOS                                                                                             |
| USB OTG                   | Android only                                                 | Handled by YubiKit Android's own USB host + permission flow                                                                                      |

Any YubiKey with the relevant application (OATH, PIV, OpenPGP, YubiOTP, FIDO2) enabled should work, subject to the per-module iOS gaps listed on the [index page](./index.md). Because there's no CTAP1/U2F implementation, YubiKeys or security keys that only speak classic U2F (no CTAP2) won't work with the `Fido` module.

## Verification checklist

- [ ] React Native 0.74+ with New Architecture turned on (`newArchEnabled=true` on Android, Fabric enabled in the iOS Podfile)
- [ ] iOS Podfile overridden to pull `YubiKit` 4.7.0 from GitHub (not the CocoaPods-trunk version)
- [ ] iOS `Info.plist` has `NFCReaderUsageDescription` and the NFC reader-session capability, if you need NFC
- [ ] Android `minSdkVersion` is at least 24
- [ ] You are not manually declaring a `USB_PERMISSION` permission on Android - it isn't real
