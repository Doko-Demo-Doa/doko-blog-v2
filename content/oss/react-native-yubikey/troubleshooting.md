---
title: Troubleshooting
description: Real error codes and known platform gaps
---

## Error codes

The library uses a fixed set of native error-code prefixes, identical on both platforms. There's no finer-grained per-operation code (no `PIN_INVALID`, `TOUCH_TIMEOUT`, `LOCKED`, etc.) - you have to read the message string that comes with the rejection.

| Code | Module | Notes |
|---|---|---|
| `CONNECTION_ERROR` | Core | No device found for handle, connection timeout |
| `APDU_ERROR` | Core.sendApdu | Raw APDU failure |
| `MANAGEMENT_ERROR` | Management | Includes the "Not implemented on iOS" stub for `setMode` |
| `OATH_ERROR` | Oath | |
| `PIV_ERROR` | Piv | |
| `OPENPGP_ERROR` | OpenPgp | Every call rejects with this on iOS - "Not implemented on iOS" |
| `YUBIOTP_ERROR` | YubiOtp | Most calls reject with this on iOS except `calculateHmacSha1` |
| `FIDO_ERROR` | Fido | |
| `SUPPORT_ERROR` | Support | |

```typescript
try {
  await Oath.calculateCodes(device.handle);
} catch (error) {
  console.error(String(error)); // no custom error class - inspect the message
}
```

On Android, some programmer-error conditions bypass the reject path entirely and throw plain Kotlin exceptions instead (e.g. `IllegalStateException("No current Activity for NFC discovery")`, `IllegalArgumentException("Unknown connection type: ...")`). These surface as unhandled native exceptions if you're not catching around the call site.

## "OPENPGP_ERROR: Not implemented on iOS"

This is expected - the YubiKit iOS SDK has no OpenPGP session at all. Every `OpenPgp.*` function rejects on iOS unconditionally. There is no workaround within this library; OpenPGP only works on Android. Guard the call with a platform check instead of trying to recover from the rejection (see [Usage](./usage)).

## "YUBIOTP_ERROR: Not implemented on iOS" for most YubiOtp calls

Only `YubiOtp.calculateHmacSha1` works on iOS. Everything else in that module (`getConfigurationState`, `getVersion`, `getSerialNumber`, `swapConfigurations`, `deleteConfiguration`, `putConfiguration`, `updateConfiguration`, `setNdefConfiguration`) is Android-only, because the iOS YubiKit SDK only exposes HMAC-SHA1 challenge-response, not OTP slot programming.

## `Management.setMode` rejects on iOS

There's no iOS SDK equivalent to `setMode`. Use `Management.updateDeviceConfig` instead - it covers the same ground on iOS.

## `Management.deviceReset` fails on most iOS devices

On iOS, this only works for YubiKey Bio - Multi-Protocol Edition running firmware 5.6+. There's no general factory-reset API in the iOS SDK for other models. This isn't a bug in the wrapper - it's a real limitation of what YubiKit iOS exposes.

## `Piv.rawSignOrDecrypt` fails with RSA3072/RSA4096 on iOS

`Piv.generateKey` can create RSA3072/RSA4096 keys on iOS, but `rawSignOrDecrypt` can't sign or decrypt with them there - the iOS SDK's padding helper only handles RSA1024/RSA2048. If you need to operate with those larger key sizes, do it on Android, or generate a smaller RSA key / an EC key on iOS instead.

## FIDO2 credential management calls fail on iOS

`Fido.getCredentialCount`, `getRpIdList`, `getCredentials`, `deleteCredential`, and `updateUserInformation` aren't available on iOS - the iOS YubiKit SDK doesn't expose FIDO2 resident-credential management. Only `getInfo`, `makeCredential`, `getAssertion`, and `reset` work on iOS.

## Discovery config options seem to do nothing on iOS

`Core.startUsbDiscovery(config)` / `Core.startNfcDiscovery(config)` accept a config object on both platforms, but the iOS native code currently ignores every field on it - `handlePermissions`, `timeout`, `disableNfcDiscoverySound`, etc. only take effect on Android. Don't build iOS UX that depends on a custom NFC timeout or discovery sound setting actually applying.

## Build fails against the CocoaPods `YubiKit` pod

If your build fails with missing symbols (PIV slot/bio metadata, key deletion, FIDO2 `minPinLength`, `Management.deviceReset`), you likely have the CocoaPods-trunk `YubiKit` pod (4.4.0), which is older than what this library needs. You must override your Podfile to pull YubiKit iOS SDK 4.7.0 from GitHub directly - see [Installation](./installation) for the exact snippet. Run `pod install` again after adding the override.

## NFC doesn't work on iOS at all

Check that you've manually added `NFCReaderUsageDescription` and the "Near Field Communication Tag Reading" capability - neither is added automatically by the library or its podspec. See [Installation](./installation).

## New Architecture not enabled

This library ships only as TurboModules with no old-bridge fallback. If autolinking fails to find the native modules, verify:

- Android: `newArchEnabled=true` in `android/gradle.properties`
- iOS: Fabric/TurboModules enabled in your Podfile

## Testing on a simulator/emulator

USB and NFC can't be exercised on the iOS Simulator or the Android Emulator - always test on a real device with a real YubiKey.

## Don't add a `USB_PERMISSION` Android manifest entry

This isn't a real Android permission constant, and adding it does nothing. USB host permission on Android is requested at runtime via `UsbManager`'s own permission flow, handled internally when you call `Core.startUsbDiscovery({ handlePermissions: true })`.

## Related

- [Requirements](./requirements) for the full compatibility matrix
- [Usage Examples](./usage) for the real function signatures
- [Connectivity](./mfi-lightning) for transport-specific behavior
