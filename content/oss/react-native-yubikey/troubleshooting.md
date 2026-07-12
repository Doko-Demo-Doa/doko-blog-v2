---
title: Troubleshooting
description: Common issues and solutions
---

## iOS Troubleshooting

### NFC Not Working

#### Problem: "NFC is not available"

**Possible Causes:**

1. Device doesn't support NFC (iPhone 6s or earlier)
2. NFC is disabled in device settings
3. NFCReaderUsageDescription missing from Info.plist
4. Running on simulator instead of real device

**Solutions:**

```typescript
// Check device compatibility
const reader = new YubiKeyReader();
const nfcAvailable = await reader.isNFCAvailable();

if (!nfcAvailable) {
  console.log("NFC not available on this device");
  // Offer alternative authentication method
}
```

- Verify iPhone model: iPhone 7 or later
- Go to Settings → NFC and enable it
- Check `Info.plist` contains:
  ```xml
  <key>NFCReaderUsageDescription</key>
  <string>Your app needs NFC to read YubiKey</string>
  ```
- Test on real device, not simulator

#### Problem: "CoreNFC framework not found"

**Solution:**

1. Open Xcode: `open ios/YourApp.xcworkspace`
2. Select your project
3. Go to **Build Phases** → **Link Binary With Libraries**
4. Click **+** and add `CoreNFC.framework`
5. Rebuild project

#### Problem: "Near Field Communication Tag Reading capability not enabled"

**Solution:**

1. In Xcode, select your target
2. Go to **Signing & Capabilities**
3. Click **+ Capability**
4. Search for "Near Field Communication Tag Reading"
5. Add the capability
6. Rebuild

### MFi Connection Issues (iOS)

#### Problem: "YubiKey 5Ci not recognized"

**Possible Causes:**

1. Key not fully inserted
2. Firmware outdated
3. Temporary connection glitch
4. Device doesn't support MFi

**Solutions:**

```typescript
// Verify MFi support
const reader = new YubiKeyReader();
const mfiSupport = await reader.hasMFiSupport();

if (!mfiSupport) {
  console.log("This device does not support MFi accessories");
}
```

- Remove and re-insert the YubiKey 5Ci firmly
- Verify iOS version is 13.0 or later
- Check UISupportedExternalAccessoryProtocols in Info.plist:
  ```xml
  <key>UISupportedExternalAccessoryProtocols</key>
  <array>
    <string>com.yubico.mfi</string>
  </array>
  ```
- Update YubiKey firmware to latest version
- Restart the app

#### Problem: "MFi device connected but operations fail"

**Solution:**

```typescript
import { Platform } from "react-native";

async function handleMFiConnection() {
  const reader = new YubiKeyReader();

  try {
    const devices = await reader.getMFiDevices();

    if (devices.length === 0) {
      console.log("No MFi devices found");
      return;
    }

    // Explicitly select device
    await reader.selectMFiDevice(devices[0]);

    // Wait a moment for connection to stabilize
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Try operation
    const result = await reader.readOTP({ timeout: 30000 });
    console.log("Success:", result.code);
  } catch (error) {
    console.error("MFi operation failed:", error);

    // Try reconnecting
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // Retry
  }
}
```

### Build Issues (iOS)

#### Problem: "CocoaPods install failed"

**Solution:**

```bash
cd ios
rm -rf Pods Podfile.lock .xcworkspace
pod install --repo-update
cd ..

# Rebuild
npm run ios
```

#### Problem: "Symbol not found for architecture arm64"

**Cause:** Binary is incompatible with device architecture

**Solution:**

```bash
# Clean build
cd ios
xcodebuild clean -workspace YourApp.xcworkspace -scheme YourApp
cd ..

# Rebuild for specific device
npx react-native run-ios --device "iPhone 12"
```

## Android Troubleshooting

### NFC Not Working

#### Problem: "NFC permission denied"

**Solution:**

```typescript
import { PermissionsAndroid, Platform } from "react-native";

async function requestNFCPermission() {
  if (Platform.OS !== "android" || Platform.Version < 23) {
    return true;
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.NFC,
      {
        title: "NFC Permission",
        message: "App needs NFC access",
        buttonPositive: "OK",
      },
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.error("Permission request failed:", err);
    return false;
  }
}

// Call before any NFC operation
const hasPermission = await requestNFCPermission();
if (!hasPermission) {
  alert("NFC permission is required");
}
```

- Verify permission in AndroidManifest.xml
- Check "NFC" is enabled in device settings (Settings → More → NFC)
- Grant permission in app permissions

#### Problem: "NFC feature not available"

**Solution:**

Verify device has NFC hardware:

```bash
# Check via adb
adb shell pm list features | grep nfc
# Should output: android.hardware.nfc
```

If not present, device doesn't support NFC.

#### Problem: "NFC times out frequently"

**Solution:**

```typescript
const reader = new YubiKeyReader({
  nfcScanTimeout: 45000, // Increase from 30s to 45s
});

// Or per operation
const otp = await reader.readOTP({
  timeout: 45000,
});
```

Try also:

- Hold YubiKey closer to NFC antenna (usually top of phone)
- Disable battery saver mode
- Restart app and try again

### USB OTG Not Working

#### Problem: "USB device not detected"

**Solution:**

```typescript
import { Platform } from "react-native";

async function checkUSBDevices() {
  const reader = new YubiKeyReader();

  const devices = await reader.getConnectedUSBDevices();
  console.log("Connected USB devices:", devices.length);

  if (devices.length === 0) {
    console.log("No USB devices found");
    return;
  }

  // Select first device
  await reader.selectUSBDevice(devices[0]);
}
```

- Verify USB OTG adapter is working (try with other device)
- Check Android supports USB OTG (most devices with API 24+)
- Try different USB port (if phone has multiple)
- Restart phone

#### Problem: "USB permission dialog doesn't appear"

**Cause:** App doesn't have USB permission

**Solution:**

Add to AndroidManifest.xml:

```xml
<uses-permission android:name="android.permission.USB_PERMISSION" />
```

Request permission:

```typescript
async function requestUSBPermission(device) {
  const hasPermission = await reader.requestUSBPermission(device);
  return hasPermission;
}
```

### Build Issues (Android)

#### Problem: "Gradle build failed: duplicate class"

**Solution:**

Check for conflicting dependencies:

```bash
cd android
./gradlew dependencies
cd ..
```

Update build.gradle:

```groovy
android {
  // ... config ...
}

configurations {
  all {
    resolutionStrategy.force 'com.google.guava:guava:31.1-android'
  }
}
```

#### Problem: "Java version mismatch"

**Solution:**

Ensure Java 11+ is installed:

```bash
java -version
# Should show Java 11+
```

In build.gradle:

```groovy
android {
  compileOptions {
    sourceCompatibility = JavaVersion.VERSION_11
    targetCompatibility = JavaVersion.VERSION_11
  }
}
```

#### Problem: "MinSdkVersion is too low"

**Solution:**

Update in build.gradle:

```groovy
android {
  defaultConfig {
    minSdkVersion 24 // At least API 24
    targetSdkVersion 33 // Use latest
  }
}
```

### Permissions Issues (Android)

#### Problem: "Requested permission not granted"

**Checklist:**

1. Permission is in AndroidManifest.xml:

   ```xml
   <uses-permission android:name="android.permission.NFC" />
   ```

2. For runtime permissions (API 23+):

   ```typescript
   const granted = await PermissionsAndroid.request(
     PermissionsAndroid.PERMISSIONS.NFC,
   );
   ```

3. Permission is listed in "Dangerous Permissions"
4. User has actually granted permission

## Cross-Platform Issues

### FIDO2 Errors

#### Problem: "Challenge mismatch"

**Cause:** Challenge sent from server doesn't match received in attestation

**Solution:**

```typescript
// Server-side verification
const clientChallenge = Buffer.from(base64url.decode(clientDataJSON.challenge));
const serverChallenge = Buffer.from(challenge);

if (!clientChallenge.equals(serverChallenge)) {
  throw new Error("Challenge mismatch");
}
```

Ensure:

- Challenge is properly base64url encoded
- Same challenge is used for registration and verification
- Challenge is not reused

#### Problem: "Attestation format not supported"

**Solution:**

```typescript
// Ensure server supports the attestation format returned by YubiKey
const registration = await reader.fido2Register({
  attestation: "direct", // YubiKey supports 'direct' format
  // Don't use 'none' if you need attestation verification
});

// Server verifies attestation format
if (clientDataJSON.type !== "webauthn.create") {
  throw new Error("Invalid attestation type");
}
```

### General Debugging

#### Enable Logging

```typescript
const reader = new YubiKeyReader({
  enableLogging: true,
  logLevel: "debug", // 'error', 'warn', 'info', 'debug'
});

// Logs will be printed to console
```

#### Check Device Status

```typescript
async function debugDeviceStatus() {
  const reader = new YubiKeyReader();

  const status = {
    nfc: await reader.isNFCAvailable(),
    mfi: await reader.hasMFiSupport(),
    version: await reader.getLibraryVersion(),
    platform: Platform.OS,
    osVersion: Platform.Version,
  };

  console.log("Device Status:", status);
  return status;
}
```

#### Test with Sample App

Use the included sample app to isolate issues:

```bash
# Test with basic OTP reading
npm run example

# Test with FIDO2
npm run example -- --fido2
```

### Getting Help

If you're still experiencing issues:

1. **Check the logs:**

   ```bash
   # iOS
   open /var/log/system.log

   # Android
   adb logcat | grep -i yubikey
   ```

2. **Verify YubiKey:**
   - Update to latest firmware
   - Test with official Yubico app
   - Try with different YubiKey model if available

3. **Report issue with:**
   - Device model and OS version
   - Complete error message with stack trace
   - Steps to reproduce
   - YubiKey model and firmware version
   - Code snippet showing the problem

## Common Error Messages

| Error                   | Cause                             | Solution                                     |
| ----------------------- | --------------------------------- | -------------------------------------------- |
| `NFC_NOT_AVAILABLE`     | Device doesn't support NFC        | Use iPhone 7+ or compatible Android with NFC |
| `TIMEOUT`               | User didn't scan key in time      | Increase timeout or ask user to scan again   |
| `USER_CANCELLED`        | User cancelled operation          | Normal - no action needed                    |
| `INVALID_KEY`           | YubiKey not recognized            | Restart app, update firmware                 |
| `PROTOCOL_ERROR`        | Communication failure             | Retry operation                              |
| `DEVICE_ERROR`          | YubiKey hardware error            | Try power cycling key                        |
| `PERMISSION_DENIED`     | Missing permission                | Grant NFC/USB permission                     |
| `UNSUPPORTED_OPERATION` | Operation not supported on device | Check device requirements                    |

## References

- [Getting Started](./getting-started)
- [Installation Guide](./installation)
- [Requirements](./requirements)
- [Official YubiKit iOS Docs](https://developers.yubico.com/yubikit-ios/)
- [Official YubiKit Android Docs](https://developers.yubico.com/yubikit-android/)
