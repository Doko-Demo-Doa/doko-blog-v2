---
title: References & Resources
description: Links to the library, underlying SDKs, and relevant standards
---

## This library

- Package: `@doko/react-native-yubikit` on npm
- Repository: `https://github.com/Doko-Demo-Doah/react-native-yubikit`
- The repository's own `README.md` and `DRAFT_PLAN.md` are the most accurate source of truth for platform-support details - if anything on this site ever disagrees with the repo, trust the repo.

## Underlying native SDKs

This library wraps these SDKs directly - it doesn't reimplement any cryptography or protocol logic itself:

- [YubiKit iOS](https://developers.yubico.com/yubikit-ios/) - pinned to SDK 4.7.0 via a Podfile override (see [Installation](./installation))
- [YubiKit Android](https://developers.yubico.com/yubikit-android/) - SDK 3.1.0

## Standards implemented

- [FIDO2 / CTAP2 Specification](https://fidoalliance.org/fido2/) - via `Fido.makeCredential` / `Fido.getAssertion`
- [WebAuthn Level 2](https://www.w3.org/TR/webauthn-2/) - the shape of `Fido`'s options/credential types
- [RFC 4226 - HOTP](https://tools.ietf.org/html/rfc4226) and [RFC 6238 - TOTP](https://tools.ietf.org/html/rfc6238) - via the `Oath` module
- NIST SP 800-73-4 (PIV) - via the `Piv` module
- OpenPGP card specification - via the `OpenPgp` module (Android only)

Not implemented by this library: classic FIDO U2F/CTAP1, QR-code scanning, NFC static-OTP tag reading. See the [index page](./index) for the full feature-coverage table.

## Apple developer docs (for the manual iOS setup steps)

- [Core NFC framework](https://developer.apple.com/documentation/corenfc) - for the `NFCReaderUsageDescription` / capability setup in [Installation](./installation)
- [Apple MFi Program](https://developer.apple.com/mfi/) - background on the Lightning accessory certification the YubiKey 5Ci uses

## Android developer docs

- [Android USB Host API](https://developer.android.com/guide/topics/connectivity/usb/host) - background on how USB permission is actually granted at runtime (not via a manifest permission)
- [Android NFC overview](https://developer.android.com/guide/topics/connectivity/nfc)

## Security guidance

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [NIST Digital Identity Guidelines (SP 800-63-3)](https://pages.nist.gov/800-63-3/)

## Yubico general resources

- [Yubico Developer Portal](https://developers.yubico.com/)
- [YubiKey product comparison](https://www.yubico.com/products/compare/)
- [Yubico Support](https://www.yubico.com/support/)

## Glossary

- **FIDO2 / CTAP2** - the passwordless authentication standard this library implements via `Fido`
- **WebAuthn** - the browser-facing API whose credential/option shapes `Fido`'s types mirror
- **TurboModule** - React Native's New Architecture native-module mechanism this library is built on exclusively
- **OATH** - TOTP/HOTP credential standard, implemented via the `Oath` module
- **PIV** - certificate-based smart-card standard (NIST SP 800-73-4), implemented via the `Piv` module
- **MFi** - Apple's "Made for iPhone" accessory certification; the YubiKey 5Ci uses it for its Lightning connector
- **APDU** - Application Protocol Data Unit, the low-level command format `Core.sendApdu` sends directly to the smart-card applet

## Related pages

- [What is this?](./index)
- [Requirements](./requirements)
- [Installation](./installation)
- [Usage Examples](./usage)
- [Troubleshooting](./troubleshooting)
