---
title: Connectivity - USB, NFC & Accessory
description: How device discovery and connections actually work across transports
---

## Transports

`Core` discovers YubiKeys over two transports:

- **USB** - covers both Lightning/MFi accessory connections on iOS (`YKFAccessoryConnection`) and USB-C "smart card" connections on iOS 16+ (`YKFSmartCardConnection`), plus USB OTG on Android. The JS `Transport` type only reports `'usb'` for all of these - there's no way from JS to tell whether a given USB device is connected via Lightning-accessory or USB-C-smart-card on iOS.
- **NFC** - tap-to-connect on NFC-capable devices, on both platforms.

```typescript
type Transport = 'usb' | 'nfc';
```

There is no `hasMFiSupport()` check, no `getMFiDevices()`, and no separate "MFi connected/disconnected" event stream. Everything goes through the same `Core.addYubiKeyListener` event stream regardless of transport.

## Starting discovery

```typescript
import { Core } from '@doko/react-native-yubikit';

// USB (covers Lightning accessory + USB-C smart card on iOS, USB OTG on Android)
Core.startUsbDiscovery({ handlePermissions: true });

// NFC
Core.startNfcDiscovery({
  timeout: 20000,
  disableNfcDiscoverySound: false,
});

Core.stopUsbDiscovery();
Core.stopNfcDiscovery();
```

One real platform difference worth knowing: on iOS, the native code for `startUsbDiscovery` / `startNfcDiscovery` doesn't currently read any fields off the config object you pass in - options like `handlePermissions`, `timeout`, `disableNfcDiscoverySound` are honored on Android but silently ignored on iOS. Don't rely on iOS respecting a custom timeout or discovery-sound setting.

## Listening for devices

```typescript
import { Core } from '@doko/react-native-yubikit';
import type { YubiKeyEvent } from '@doko/react-native-yubikit';

const subscription = Core.addYubiKeyListener((event: YubiKeyEvent) => {
  if (event.type === 'attached') {
    // event.device: YubiKeyDevice - has a `handle` you pass to every other module
  } else if (event.type === 'detached') {
    // event.handle: string
  } else if (event.type === 'error') {
    // event.error: string - e.g. a failed NFC/smart-card connection attempt
  }
});

// later
subscription.remove();
```

## iOS: Lightning vs USB-C smart card

- **Lightning (5Ci, MFi accessory):** works via `YKFAccessoryConnection` on iOS versions supported by YubiKit iOS SDK 4.7.0 - no special iOS-version gate beyond what the SDK itself requires.
- **USB-C smart card (5C and similar over the native USB-C port):** requires iOS 16+, gated with `if (@available(iOS 16.0, *))` in the native connection code (`YKFSmartCardConnection`).

If you need to distinguish these in your UI, you can't do it from the JS `Transport`/device data alone - both surface as `'usb'`.

## Android: USB OTG

USB devices are discovered through the standard Android USB host APIs. Permission is requested at runtime by the YubiKit Android SDK itself when you call `Core.startUsbDiscovery({ handlePermissions: true })` - there's no manifest permission for this (see [Installation](./installation.md) for why `USB_PERMISSION` isn't a real Android permission string).

## iOS setup you still have to do yourself, per transport

Neither platform's transport support is fully "automatic." On iOS, depending on which transports you need:

- **Lightning (5Ci):** add `com.yubico.ylp` under `UISupportedExternalAccessoryProtocols` in `Info.plist`.
- **USB-C smart card (iOS 16+):** add the `com.apple.security.smartcard` entitlement.
- **NFC:** add `NFCReaderUsageDescription`, the NFC reader-session capability, and the AID list (`com.apple.developer.nfc.readersession.iso7816.select-identifiers`).

See [Installation](./installation.md) for the exact snippets. None of this is done by the library's podspec, and the library's own example app doesn't configure any of it either - its `Info.plist` has no NFC keys and its entitlements file is empty. On Android, the NFC permission is already merged in via the library's manifest, so no extra manifest work is required there.

## Related

- [Requirements](./requirements.md) for the device-compatibility table
- [Installation](./installation.md) for the exact Info.plist / Podfile steps
- [Usage Examples](./usage.md) for a full discover-then-operate flow
