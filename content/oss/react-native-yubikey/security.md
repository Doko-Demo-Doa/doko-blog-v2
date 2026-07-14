---
title: Security Notes
description: Practical security guidance for using react-native-yubikit
---

These are general best practices for building authentication flows around this library. The library itself does not enforce any of them - it's a thin bridge to native YubiKit sessions, so the correctness of your auth flow is entirely on your app and server.

## Server-side verification is mandatory for FIDO2

`Fido.makeCredential` / `Fido.getAssertion` return WebAuthn-shaped attestation/assertion objects. Never trust these client-side - send them to your server and verify:

- The challenge in the response matches a challenge your server generated and hasn't already been consumed.
- The `effectiveDomain` / relying-party ID matches what your server expects.
- The attestation signature and (for assertions) the signature counter, using a real WebAuthn server-side verification library rather than hand-rolled checks.

```typescript
async function registerWithServer(device, effectiveDomain, options) {
  const credential = await Fido.makeCredential(device.handle, options, effectiveDomain, pin);

  // never accept locally - verify server-side
  const response = await fetch('/api/fido2/register-complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credential),
  });

  return response.json();
}
```

## PIN and password handling

- Don't log PINs, passwords, or OATH access keys. Clear local variables holding them as soon as you're done (`pin = ''` after use) - there's no built-in secure-memory wrapper for these values.
- `Oath` and `Piv` PINs/passwords are plain strings sent across the RN bridge as-is - only call these functions over a connection you trust (i.e. a physically present device), and don't cache the raw PIN anywhere in JS state longer than needed for the current operation.
- Respect the platform-reported retry counters (`Piv.getPinAttempts`, `Oath` unlock return values) instead of silently retrying a wrong PIN/password - repeated bad attempts can lock the applet.

## Transport security

- Always use HTTPS for any server round-trip involving credential/attestation data, OTP codes, or session tokens.
- If your app validates OATH/OTP codes against a server, treat the code as a bearer secret in transit - don't put it in query strings or logs.

## Rate limiting and lockout awareness

Implement server-side rate limiting on any endpoint that verifies an OTP, OATH code, or FIDO2 assertion, independent of the hardware-enforced PIN/PUK retry limits on the key itself. The key's own lockout (e.g. PIV PIN/PUK attempt counters) protects the hardware element, but it doesn't protect your server from being hammered with replayed or brute-forced values.

## Session and credential storage

Store any session tokens your server issues after a successful YubiKey-backed login using platform-native secure storage (Keychain on iOS, Keystore-backed storage on Android) via a library like `expo-secure-store` or `react-native-keychain` - not `AsyncStorage` and not JS memory that could leak into crash reports or bundled state.

## Don't leak information in error messages

This library's own errors are one of a handful of generic codes (`CONNECTION_ERROR`, `OATH_ERROR`, `PIV_ERROR`, `FIDO_ERROR`, etc. - see [Usage](./usage.md)) with an SDK-provided message string. Be deliberate about what you surface to end users from these - "Invalid PIN" is fine, but don't propagate low-level SDK messages that might reveal internal state to a UI a bystander could see over someone's shoulder.

## Known platform gaps that affect your security design

- **No OpenPGP on iOS** - if your threat model depends on OpenPGP signing/decryption as a factor, that flow can only run on Android with this library; plan an iOS fallback or Android-only rollout.
- **No FIDO2 credential management on iOS** - you can't enumerate or delete resident credentials from an iOS app using this library; do that from an Android app or a server-side admin flow instead.
- **No classic U2F (CTAP1)** - if you need to support very old FIDO U2F-only keys, this library can't authenticate them; only CTAP2-capable keys work with `Fido`.

## Related

- [Usage Examples](./usage.md) for the exact function signatures referenced above
- [Troubleshooting](./troubleshooting.md) for the full error-code list
