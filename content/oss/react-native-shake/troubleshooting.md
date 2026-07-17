---
title: Troubleshooting
description: Common issues when integrating react-native-shake.
---

## Shake events aren't firing

- **Test on a real device.** Shake detection depends on actual accelerometer input, which simulators/emulators emulate poorly or not at all.
- Make sure `addListener` was called and the returned subscription hasn't been removed.
- On Android, try lowering the sensitivity with `RNShake.configure(0.75)` to confirm the listener itself works before tuning further.

## `configure` doesn't seem to do anything on iOS

This is expected - `configure` is **Android only**. iOS relies on the system's built-in shake gesture, which isn't configurable from the app.

## Listener still fires after unmount

Make sure you call `.remove()` on the `EmitterSubscription` returned by `addListener`, typically in a `useEffect` cleanup function or `componentWillUnmount`. Alternatively, call `RNShake.removeAllListeners()` to clear everything at once.

## iOS build fails after install

Re-run pod install:

```bash
cd ios && pod install
```

## Still stuck?

Open an issue on [GitHub](https://github.com/Doko-Demo-Doa/react-native-shake/issues).
