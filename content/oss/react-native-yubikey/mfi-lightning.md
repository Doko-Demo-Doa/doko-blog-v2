---
title: MFi & Lightning Devices
description: Comprehensive guide to YubiKey 5Ci and Lightning-supported devices
---

## What is MFi?

MFi (Made for iPhone) is Apple's certification program for hardware accessories. The YubiKey 5Ci is the first YubiKey officially certified as an MFi accessory, specifically designed for seamless iPhone and iPad integration.

## YubiKey 5Ci Specifications

The YubiKey 5Ci is engineered for optimal iPhone integration:

- **Connection:** Lightning connector with USB 2.0 signaling
- **Compatible with:** iPhone 6s and later, iPad Pro, iPad Air, iPad (4th gen+)
- **Physical Dimensions:** 47.3 × 18 × 9.8 mm
- **Weight:** 3 grams
- **Dual-mode:** Works with both iOS apps and desktop browsers via adapter
- **Material:** Hardened stainless steel with polycarbonate components
- **IP Rating:** IP65 water and dust resistant

## Supported Protocols on MFi Devices

### FIDO2 / WebAuthn

Modern passwordless authentication standard recommended by NIST and FIDO Alliance.

```typescript
// Register with FIDO2
const attestation = await reader.fido2Register({
  relyingParty: {
    id: 'example.com',
    name: 'Example App',
  },
  user: {
    id: userId,
    name: userEmail,
    displayName: userName,
  },
  challenge: base64urlChallenge,
  pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
  timeout: 60000,
  attestation: 'direct',
});

// Authenticate with FIDO2
const assertion = await reader.fido2Authenticate({
  relyingPartyId: 'example.com',
  challenge: base64urlChallenge,
  allowCredentials: savedCredentials,
  timeout: 60000,
  userVerification: 'preferred',
});
```

**Benefits:**
- ✅ Passwordless authentication
- ✅ Phishing-resistant
- ✅ Works on web and mobile
- ✅ Strong cryptographic keys
- ✅ User verification (Touch ID compatible)

### FIDO U2F

Legacy two-factor authentication protocol. Recommended for older systems that support FIDO but not FIDO2.

```typescript
const u2fRegister = await reader.fido2Register({
  pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
  // ... other options
  attestation: 'fido-u2f',
});
```

**Use Cases:**
- ✅ Legacy 2FA implementations
- ✅ High security requirements
- ✅ Enterprise deployments

### OpenPGP

PGP/GPG support for signing, encryption, and authentication.

```typescript
const signature = await reader.openPGPSign({
  data: messageToSign,
  keyId: pgpKeyId,
  pin: userPIN,
});

const decrypted = await reader.openPGPDecrypt({
  encryptedData: encryptedMessage,
  pin: userPIN,
});
```

**Use Cases:**
- ✅ Email encryption (S/MIME)
- ✅ Document signing
- ✅ Secure communications
- ✅ Developer key management

### PIV (Personal Identity Verification)

Certificate-based authentication per NIST SP 800-73-4.

```typescript
const certificate = await reader.pivGetCertificate({
  slotId: 0x9C, // Signature key
});

const signature = await reader.pivSign({
  data: dataToSign,
  keyRef: 0x9C,
  pin: userPIN,
});
```

**Use Cases:**
- ✅ Government/enterprise authentication
- ✅ Certificate-based VPN
- ✅ Digital signatures
- ✅ High-assurance identity

## Lightning Connection Flow

```
User inserts YubiKey 5Ci into iPhone Lightning port
                    ↓
iOS detects MFi accessory
                    ↓
App queries accessory capabilities
                    ↓
Accessory reports supported protocols
                    ↓
App communicates via standard USB protocols
                    ↓
YubiKit handles cryptographic operations
                    ↓
Result returned to app
```

## iOS MFi Implementation

### Detecting MFi Connection

```typescript
import { YubiKeyReader } from 'react-native-yubikey';
import { Platform } from 'react-native';

const reader = new YubiKeyReader();

if (Platform.OS === 'ios') {
  // Check for MFi support
  const hasMFi = await reader.hasMFiSupport();
  
  // Get connected MFi devices
  const devices = await reader.getMFiDevices();
  console.log(`Connected MFi devices: ${devices.length}`);
  
  // Monitor connection changes
  reader.on('mfiDeviceConnected', (device) => {
    console.log('YubiKey connected:', device.name);
  });
  
  reader.on('mfiDeviceDisconnected', (device) => {
    console.log('YubiKey disconnected:', device.name);
  });
}
```

### Handling MFi Events

```typescript
import { YubiKeyReader } from 'react-native-yubikey';

const reader = new YubiKeyReader();

// Listen for accessory connected
reader.on('mfiDeviceConnected', async (device) => {
  console.log(`YubiKey 5Ci connected: ${device.serialNumber}`);
  
  // Auto-select if desired
  await reader.selectMFiDevice(device);
  
  // Enable features UI
  setYubiKeyAvailable(true);
});

// Listen for accessory disconnected
reader.on('mfiDeviceDisconnected', (device) => {
  console.log(`YubiKey disconnected: ${device.serialNumber}`);
  setYubiKeyAvailable(false);
});

// Listen for errors
reader.on('mfiError', (error) => {
  console.error('MFi Error:', error.message);
});
```

## iPad Support

YubiKey 5Ci works seamlessly with iPad models:

- **iPad Pro** - All models
- **iPad Air** - 3rd generation and later
- **iPad** - 5th generation and later
- **iPad mini** - 4th generation and later

```typescript
import { Platform } from 'react-native';

// Check if running on iPad with MFi support
const isIPadWithMFi = async () => {
  if (Platform.OS !== 'ios') return false;
  
  const hasMFi = await reader.hasMFiSupport();
  const isLargeDevice = await reader.isLargeDevice(); // iPad detection
  
  return hasMFi && isLargeDevice;
};
```

## iPhone 15 USB-C Transition

iPhone 15 and later support USB-C natively, opening new possibilities:

```typescript
import { Platform } from 'react-native';

const reader = new YubiKeyReader();

if (Platform.OS === 'ios') {
  // Check iOS version
  const iosVersion = await reader.getIOSVersion();
  
  if (parseFloat(iosVersion) >= 15.1) {
    // USB-C YubiKeys may become available
    const hasUSBCSupport = await reader.hasUSBCSupport();
    console.log('USB-C YubiKey support:', hasUSBCSupport);
  }
}
```

## Desktop Bridged Authentication

For users without compatible devices, implement desktop bridged enrollment:

```typescript
// 1. User generates secret on desktop app
// 2. Desktop encodes secret in QR code
// 3. Mobile app scans QR code using YubiKit

const scannedSecret = await reader.scanQRCode({
  timeout: 30000,
  hint: 'Scan the QR code from your desktop to set up 2FA',
});

// Send scanned secret to server for enrollment
const response = await fetch('/api/enroll-2fa', {
  method: 'POST',
  body: JSON.stringify({ secret: scannedSecret }),
});
```

## Benefits of MFi for iOS Developers

### Direct Hardware Access
- Full YubiKey capability access without adapters
- Native Lightning integration
- Consistent performance

### Enhanced Security
- Closer integration with iOS security architecture
- Leverage Secure Enclave for key operations
- Biometric authentication integration

### Better User Experience
- Instant recognition when key is inserted
- No driver installation required
- Automatic feature discovery

### Official Support
- Yubico actively maintains MFi compatibility
- Regular firmware updates
- Dedicated testing and QA

## Important Considerations

### Device Accessibility

> **Current Limitation:** Lightning is the only native connector on most iPhones. USB-C support is coming with iPhone 15 series, but Apple's timeline for broader adoption is uncertain.

### Adapter Workarounds

While YubiKey 5 can work with iPhone via USB-C to Lightning adapter, the official MFi 5Ci is recommended for:
- Optimal reliability
- Consistent performance
- Official support from Yubico
- Cleaner user experience

### Session Persistence

Unlike NFC which requires repeated scanning, MFi connections persist:

```typescript
// MFi sessions stay active until disconnected
const reader = new YubiKeyReader();
let mfiDevice = null;

reader.on('mfiDeviceConnected', async (device) => {
  mfiDevice = device;
  // Perform multiple operations without reconnecting
  
  const otp1 = await reader.readOTP();
  const otp2 = await reader.readOTP();
  // Both work without removing/reinserting key
});
```

### Charging Considerations

> **Design Note:** Inserting YubiKey 5Ci blocks the Lightning port, preventing simultaneous charging. Users may need to:
- Use wireless charging while authenticating
- Perform authentication before charging
- Consider workflow impact for long sessions

## Migration Guide from USB Adapter to MFi

If you currently support USB adapter:

```typescript
import { Platform } from 'react-native';

async function getPreferredConnectionMethod() {
  if (Platform.OS !== 'ios') {
    return 'usb-otg'; // Android uses USB OTG
  }
  
  // Check for native MFi support
  const hasMFi = await reader.hasMFiSupport();
  if (hasMFi) {
    return 'mfi-lightning'; // Preferred on iOS 13+
  }
  
  // Fallback to NFC
  const hasNFC = await reader.isNFCAvailable();
  if (hasNFC) {
    return 'nfc';
  }
  
  // Last resort: USB adapter
  return 'usb-adapter';
}

// Use preferred method
const method = await getPreferredConnectionMethod();
switch (method) {
  case 'mfi-lightning':
    // Use MFi flow
    break;
  case 'nfc':
    // Use NFC flow
    break;
  case 'usb-adapter':
    // Use USB adapter flow
    break;
}
```

## Security Model

MFi accessories follow Apple's security guidelines:

- Hardware-backed cryptography
- Tamper-evident casing
- Secure element integration
- Regular security audits

## References

- [YubiKey 5Ci Product Page](https://www.yubico.com/products/yubikey-5-series/)
- [Apple MFi Program](https://developer.apple.com/mfi/)
- [FIDO2 Specification](https://fidoalliance.org/fido2/)
- [YubiKit iOS Documentation](https://developers.yubico.com/yubikit-ios/)
