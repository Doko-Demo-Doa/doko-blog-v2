---
title: Installation
description: Real, verified installation steps for react-native-yubikit
---

## 1. Install the package

```bash
npm install @doko/react-native-yubikit
# or
yarn add @doko/react-native-yubikit
```

The published package name is scoped: `@doko/react-native-yubikit`. Import from that name, not from `react-native-yubikit` unscoped (an unscoped import only resolves inside this library's own monorepo/example app via workspace linking — it will not resolve in your app).

## 2. Make sure the New Architecture is enabled

This library ships only as TurboModules — there's no bridge fallback.

- **Android:** `newArchEnabled=true` in `android/gradle.properties`.
- **iOS:** Fabric/TurboModules enabled in your Podfile (the default for a New-Architecture RN 0.74+ project).

## 3. iOS setup

### 3.1 Override the `YubiKit` pod version

The CocoaPods-trunk `YubiKit` pod is older (4.4.0) than what this library requires (4.7.0+). Add an explicit git-based override to your `ios/Podfile`, before running `pod install`:

```ruby
target 'YourApp' do
  # ... existing config ...

  pod 'YubiKit', :git => 'https://github.com/Yubico/yubikit-ios.git', :tag => '4.7.0'

  # ... use_native_modules!, etc ...
end
```

If you're using Expo with config plugins, you can automate this override with a plugin that patches the generated Podfile after prebuild — that's exactly what this library's own example app does internally. Without this override, `pod install` will silently resolve the older 4.4.0 SDK and the native build will fail to compile against APIs this library needs (PIV slot/bio metadata, key deletion, FIDO2 `minPinLength`, `Management.deviceReset`, etc).

### 3.2 Install pods

```bash
cd ios
pod install
cd ..
```

### 3.3 Set the deployment target

Use iOS 16.4+ if you want USB-C "smart card" connections to work (`YKFSmartCardConnection` requires iOS 16+). Lightning/MFi accessory connections work on older iOS.

### 3.4 Add NFC configuration (manual — not automated by the library)

If you want NFC discovery, add to `Info.plist`:

```xml
<key>NFCReaderUsageDescription</key>
<string>This app uses NFC to communicate with your YubiKey</string>
<key>com.apple.developer.nfc.readersession.formats</key>
<array>
  <string>TAG</string>
</array>
```

And enable the **"Near Field Communication Tag Reading"** capability in Xcode (Signing & Capabilities → + Capability). Depending on how your app reads NFC tags, you may also need `com.apple.developer.nfc.readersession.iso7816.select-identifiers` — check Apple's Core NFC documentation for your exact use case.

None of this is added automatically by the library or its podspec — you have to do it yourself in your app target.

## 4. Android setup

### 4.1 Nothing to add to `build.gradle` manually

The library's own `android/build.gradle` already declares its YubiKit Android SDK 3.1.0 dependencies and is picked up automatically through autolinking/Codegen. You just need your app's `minSdkVersion` to be 24+ and `compileSdkVersion` to be 36 (to match what the library compiles against).

### 4.2 Nothing to add to `AndroidManifest.xml` manually

The library's own manifest already declares:

```xml
<uses-feature android:name="android.hardware.usb.host" android:required="false" />
<uses-permission android:name="android.permission.NFC" />
```

These merge into your app automatically via the manifest merger. You do **not** need to add NFC permissions yourself, and you should **not** add a `USB_PERMISSION` entry — it isn't a real Android permission constant. USB host access on Android is granted at runtime through `UsbManager`'s own permission-request flow (handled internally by the YubiKit Android SDK), not through a manifest declaration.

## 5. Verify the install

```typescript
import { Core } from '@doko/react-native-yubikit';

// Start USB discovery and see if a listener fires when you plug something in
const subscription = Core.addYubiKeyListener((event) => {
  console.log('YubiKey event:', event);
});

Core.startUsbDiscovery({ handlePermissions: true });
```

Plug in (or NFC-tap) a YubiKey on a real device — the simulator/emulator cannot exercise USB or NFC. You should see an `'attached'` event.

## Next steps

- [Getting Started](./getting-started)
- [Connectivity: USB, NFC & Accessory](./mfi-lightning)
- [Usage Examples](./usage)
