---
title: Usage Examples
description: Real code examples using the actual module APIs
---

All examples assume you've already run discovery and have a `device: YubiKeyDevice` from a `Core.addYubiKeyListener` event or `Core.getDiscoveredDevices()`. Every module function below takes `device.handle` as its first argument - the modules manage their own connection internally, so you don't normally need `Core.requestConnection` unless you're doing raw APDU work.

## Core - discovery, raw APDU

```typescript
import { Core } from '@doko/react-native-yubikit';

const subscription = Core.addYubiKeyListener((event) => {
  if (event.type === 'attached') {
    handleDevice(event.device);
  }
});

Core.startUsbDiscovery({ handlePermissions: true });

// Raw APDU escape hatch - only needed for low-level access
async function sendRawApdu(device) {
  const connectionHandle = await Core.requestConnection(device.handle, 'SmartCardConnection');
  try {
    const response = await Core.sendApdu(connectionHandle, base64Apdu);
    return response;
  } finally {
    Core.closeConnection(connectionHandle);
  }
}
```

`ConnectionType` is one of `'SmartCardConnection' | 'OtpConnection' | 'FidoConnection'`.

## Support - device info

```typescript
import { Support } from '@doko/react-native-yubikit';

async function describe(device) {
  const info = await Support.readInfo(device.handle);
  const name = Support.getName(info); // synchronous - not a Promise
  console.log(name, info.serialNumber, info.version);
}
```

## Management - device config

```typescript
import { Management } from '@doko/react-native-yubikit';

async function readConfig(device) {
  const info = await Management.getDeviceInfo(device.handle);
  return info;
}

async function writeConfig(device, config) {
  await Management.updateDeviceConfig(device.handle, config, /* reboot */ false);
}
```

`Management.setMode` and `Management.deviceReset` are Android-first: `setMode` rejects on iOS entirely (use `updateDeviceConfig` instead), and `deviceReset` on iOS only works on YubiKey Bio - Multi-Protocol Edition running firmware 5.6+.

## Oath - TOTP/HOTP codes

```typescript
import { Oath } from '@doko/react-native-yubikit';

async function listCodes(device) {
  const credentials = await Oath.getCredentials(device.handle);
  const codes = await Oath.calculateCodes(device.handle);
  return codes;
}

async function addCredential(device, credentialData) {
  // requireTouch: whether a physical touch is required to calculate this code
  return Oath.putCredential(device.handle, credentialData, /* requireTouch */ false);
}

async function removeCredential(device, credentialId) {
  await Oath.deleteCredential(device.handle, credentialId);
}
```

If the OATH application is password-protected, unlock it first:

```typescript
const unlocked = await Oath.unlockWithPassword(device.handle, userPassword);
if (!unlocked) {
  // wrong password
}
```

Full parity on both platforms.

## Piv - certificates and signing

```typescript
import { Piv } from '@doko/react-native-yubikit';

async function signWithPiv(device, slot, keyType, payload) {
  await Piv.verifyPin(device.handle, userPin);
  return Piv.rawSignOrDecrypt(device.handle, slot, keyType, payload);
}

async function generateAndAttest(device, slot) {
  const publicKey = await Piv.generateKey(
    device.handle,
    slot,
    'ECCP256',
    'DEFAULT', // pin policy
    'DEFAULT', // touch policy
  );
  const attestation = await Piv.attestKey(device.handle, slot);
  return { publicKey, attestation };
}
```

On iOS, `rawSignOrDecrypt` does **not** support `RSA3072`/`RSA4096` even though `generateKey` can create keys of those sizes there - if you need to sign/decrypt with those key sizes, do it on Android, or generate a smaller RSA key or an EC key instead on iOS.

## OpenPgp - Android only

```typescript
import { OpenPgp } from '@doko/react-native-yubikit';
import { Platform } from 'react-native';

async function pgpSign(device, payload) {
  if (Platform.OS !== 'android') {
    throw new Error('OpenPGP is not available on iOS - the YubiKit iOS SDK has no OpenPGP session');
  }
  await OpenPgp.verifyUserPin(device.handle, userPin);
  return OpenPgp.sign(device.handle, payload);
}
```

Every `OpenPgp.*` function rejects with `OPENPGP_ERROR: "Not implemented on iOS"` if called on iOS. Guard for platform before calling into this module, rather than catching the rejection.

## YubiOtp - challenge-response and slot programming

```typescript
import { YubiOtp } from '@doko/react-native-yubikit';
import { Platform } from 'react-native';

// Works on both platforms
async function challengeResponse(device, slot, challenge) {
  return YubiOtp.calculateHmacSha1(device.handle, slot, challenge);
}

// Android only - iOS rejects with "Not implemented on iOS"
async function programSlot(device, slot, configuration) {
  if (Platform.OS !== 'android') {
    throw new Error('OTP slot programming is not available on iOS');
  }
  await YubiOtp.putConfiguration(device.handle, slot, configuration);
}
```

`OtpSlot` is `'ONE' | 'TWO'`. On iOS, only `calculateHmacSha1` works - `getConfigurationState`, `getVersion`, `getSerialNumber`, `swapConfigurations`, `deleteConfiguration`, `putConfiguration`, `updateConfiguration`, and `setNdefConfiguration` are Android-only.

## Fido - FIDO2/WebAuthn

```typescript
import { Fido } from '@doko/react-native-yubikit';

async function register(device, options, effectiveDomain, pin) {
  return Fido.makeCredential(device.handle, options, effectiveDomain, pin);
}

async function authenticate(device, options, effectiveDomain, pin) {
  return Fido.getAssertion(device.handle, options, effectiveDomain, pin);
}
```

`options` mirrors the WebAuthn `PublicKeyCredentialCreationOptions` / `PublicKeyCredentialRequestOptions` shapes (check the exported types for the exact fields), with binary values like `challenge`, `user.id`, and credential IDs passed as base64 strings rather than `ArrayBuffer`s, since the bridge only carries plain objects and base64 strings.

Credential management is Android-only:

```typescript
import { Platform } from 'react-native';

async function listResidentCredentials(device, rpId, pin) {
  if (Platform.OS !== 'android') {
    throw new Error('FIDO2 credential management is not available on iOS');
  }
  return Fido.getCredentials(device.handle, rpId, pin);
}
```

There is no classic FIDO U2F (CTAP1) API in this library - only CTAP2 via `makeCredential`/`getAssertion`.

## Error handling

Rejections aren't a custom error class - catch them like any RN promise rejection and inspect the message string. Native code uses a fixed set of error-code prefixes per module family: `CONNECTION_ERROR`, `APDU_ERROR`, `MANAGEMENT_ERROR`, `OATH_ERROR`, `PIV_ERROR`, `OPENPGP_ERROR`, `YUBIOTP_ERROR`, `FIDO_ERROR`, `SUPPORT_ERROR`. There's no finer-grained code for things like "wrong PIN" or "touch timeout" - you have to read the message text.

```typescript
try {
  await Piv.verifyPin(device.handle, pin);
} catch (error) {
  console.error('PIV error:', String(error));
}
```

On Android, some programmer-error conditions (unknown connection type, missing Activity for NFC) throw plain Kotlin exceptions rather than going through the reject path - these will surface as unhandled native exceptions if not caught by your own try/catch.

## Related

- [Getting Started](./getting-started.md) for the discovery-first mental model
- [Security Notes](./security.md) for PIN/password handling guidance
- [Troubleshooting](./troubleshooting.md) for known platform gaps and error codes
