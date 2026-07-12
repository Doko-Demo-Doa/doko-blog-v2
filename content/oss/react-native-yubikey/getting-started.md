---
title: Getting Started
description: Real quick-start guide for react-native-yubikit
---

## Install

```bash
npm install @doko/react-native-yubikit
# or
yarn add @doko/react-native-yubikit
```

Then complete the platform setup in [Installation](./installation) — iOS needs a Podfile override before it will build.

## The mental model

The library doesn't give you a single `YubiKeyReader` class. Instead you:

1. Start discovery (`Core.startUsbDiscovery` / `Core.startNfcDiscovery`).
2. Listen for `attached` / `detached` / `error` events (`Core.addYubiKeyListener`).
3. Once you have a device's `handle`, call functions from the module you need (`Oath`, `Piv`, `OpenPgp`, `YubiOtp`, `Fido`, `Management`, `Support`) directly with that `handle` — the modules manage their own connection internally.
4. `Core.requestConnection` / `Core.sendApdu` / `Core.closeConnection` are a lower-level escape hatch for raw APDU access; you don't need them for normal OATH/PIV/FIDO2/etc. usage.

## Discover a device

```typescript
import { Core } from '@doko/react-native-yubikit';
import type { YubiKeyDevice, YubiKeyEvent } from '@doko/react-native-yubikit';

const subscription = Core.addYubiKeyListener((event: YubiKeyEvent) => {
  switch (event.type) {
    case 'attached':
      console.log('YubiKey attached:', event.device);
      break;
    case 'detached':
      console.log('YubiKey detached:', event.handle);
      break;
    case 'error':
      console.error('Discovery error:', event.error);
      break;
  }
});

// USB discovery — requests OS-level permission on Android automatically
Core.startUsbDiscovery({ handlePermissions: true });

// NFC discovery (needs the Info.plist / capability setup from Installation, on iOS)
Core.startNfcDiscovery();

// later, e.g. on unmount:
Core.stopUsbDiscovery();
Core.stopNfcDiscovery();
subscription.remove();
```

You can also poll for whatever is already connected:

```typescript
const devices: YubiKeyDevice[] = Core.getDiscoveredDevices();
```

## Read basic device info

```typescript
import { Support } from '@doko/react-native-yubikit';

async function describeDevice(device: YubiKeyDevice) {
  const info = await Support.readInfo(device.handle);
  const name = Support.getName(info); // synchronous, not a Promise
  console.log(`${name} — serial ${info.serialNumber}`);
}
```

## Read OATH (TOTP/HOTP) codes

```typescript
import { Oath } from '@doko/react-native-yubikit';

async function readCodes(device: YubiKeyDevice) {
  const codes = await Oath.calculateCodes(device.handle);
  console.log(codes);
}
```

## FIDO2 registration and authentication

```typescript
import { Fido } from '@doko/react-native-yubikit';

async function register(device: YubiKeyDevice) {
  const credential = await Fido.makeCredential(
    device.handle,
    {
      rp: { id: 'example.com', name: 'Example App' },
      user: { id: base64UserId, name: 'user@example.com', displayName: 'User' },
      challenge: base64Challenge,
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
      // see the PublicKeyCredentialCreationOptions type for the full WebAuthn-shaped
      // option set — binary fields (challenge, user.id, credential ids) are base64
      // strings on this bridge, not ArrayBuffers
    },
    'example.com', // effectiveDomain
    pin, // optional — only needed if user verification requires a PIN
  );

  // send `credential` to your server for verification
}
```

`Fido.getAssertion` follows the same shape for authentication. Credential management functions (`getCredentialCount`, `getRpIdList`, `getCredentials`, `deleteCredential`, `updateUserInformation`) only work on Android — the iOS SDK doesn't expose them.

## Error handling

There's no custom error class — rejections are plain RN bridge errors with a `.message`, tagged with one of a fixed set of native error codes (`CONNECTION_ERROR`, `APDU_ERROR`, `MANAGEMENT_ERROR`, `OATH_ERROR`, `PIV_ERROR`, `OPENPGP_ERROR`, `YUBIOTP_ERROR`, `FIDO_ERROR`, `SUPPORT_ERROR`):

```typescript
try {
  const codes = await Oath.calculateCodes(device.handle);
} catch (error) {
  console.error('OATH read failed:', String(error));
}
```

## Next steps

- [Requirements](./requirements)
- [Connectivity: USB, NFC & Accessory](./mfi-lightning)
- [Usage Examples](./usage)
- [Troubleshooting](./troubleshooting)
