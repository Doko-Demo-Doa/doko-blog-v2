---
title: What is this?
description: Yubikey SDK wrapper library for React Native, available for iOS and Android.
---

`@doko/react-native-yubikit` wraps Yubico's native YubiKit SDKs (YubiKit iOS and YubiKit Android) as a React Native **TurboModule**, so you can talk to a YubiKey from JS/TypeScript without writing any native code yourself.

The library is split into 8 independent native modules, exposed as namespaces from a single package:

```ts
import { Core, Support, Management, Oath, Piv, OpenPgp, YubiOtp, Fido } from '@doko/react-native-yubikit';
```

There is no `YubiKeyReader` class, no React hook shipped by the library, and no default export — everything is a plain exported function grouped by namespace, plus the types from `src/types.ts` re-exported at the top level.

## Feature coverage

| Module | Purpose | iOS | Android |
|---|---|---|---|
| `Core` | Device discovery (USB + NFC), connection handling, raw APDU | Full | Full |
| `Support` | Reading device info / friendly device name | Full | Full |
| `Management` | Reading/writing device config, enabled capabilities | Partial (`setMode` unavailable) | Full |
| `Oath` | TOTP/HOTP credential management | Full | Full |
| `Piv` | Certificates, key generation, sign/decrypt (PIV) | Partial (no RSA3072/4096 raw sign/decrypt) | Full |
| `OpenPgp` | OpenPGP key/cert management, sign/decrypt/auth | **Not available** | Full |
| `YubiOtp` | OTP slot programming, challenge-response | Partial (only `calculateHmacSha1`) | Full |
| `Fido` | FIDO2/WebAuthn registration & authentication | Partial (no credential management) | Full |

Android has full parity across every module. iOS is missing OpenPGP entirely, YubiOTP slot programming, and FIDO2 resident-credential management — these gaps come from the underlying YubiKit iOS SDK, not from this wrapper.

There is **no classic FIDO U2F (CTAP1) API** — only FIDO2/CTAP2 (`Fido.makeCredential` / `Fido.getAssertion`). There's also no QR-code scanning and no NFC static-OTP tag reading exposed on either platform.

## Requirements at a glance

- React Native 0.74+ with the **New Architecture enabled** (Fabric/TurboModules) — there is no old-bridge fallback
- iOS 16.4+ recommended (USB-C smart card connections require iOS 16+; Lightning/accessory YubiKeys work on older iOS)
- Android `minSdkVersion` 24

See [Requirements](./requirements) for the full breakdown, and [Installation](./installation) for the real setup steps (including a required Podfile override for iOS).

## Quick links

- [Getting Started](./getting-started)
- [Requirements](./requirements)
- [Installation](./installation)
- [Connectivity: USB, NFC & Accessory](./mfi-lightning)
- [Usage Examples](./usage)
- [Security Notes](./security)
- [Advanced Patterns](./advanced)
- [Troubleshooting](./troubleshooting)
- [References](./references)

## Installation

```bash
npm install @doko/react-native-yubikit
# or
yarn add @doko/react-native-yubikit
```

Then follow [Installation](./installation) — iOS in particular needs a Podfile override, since the CocoaPods-trunk `YubiKit` pod is older than what this library requires.
