---
title: What is this?
description: A lightweight React Native library that detects shake gestures on iOS and Android.
---

`react-native-shake` detects shake gestures on both iOS and Android. It supports React Native's **New Architecture** (Turbo Modules) as well as the **old/legacy architecture**, ships full TypeScript definitions, and has no heavy dependencies.

```tsx
import RNShake from 'react-native-shake';

const subscription = RNShake.addListener(() => {
  console.log('Device shaken!');
});

subscription.remove();
```

> Works best on **real devices** - shake detection is limited in simulators/emulators.

## Requirements

| | Minimum |
|---|---|
| iOS | 13.0+ |
| Android | API 21+ (Android 5.0) |
| React Native | 0.68+ |

## Quick links

- [Getting Started](./getting-started.md)
- [Usage](./usage.md)
- [API Reference](./api.md)
- [Troubleshooting](./troubleshooting.md)

## Installation

```bash
npm install react-native-shake
# or
yarn add react-native-shake
```

### iOS

```bash
cd ios && pod install
```

### Android

No additional configuration required - the library links automatically via autolinking (React Native 0.60+).

## Links

- [GitHub](https://github.com/Doko-Demo-Doa/react-native-shake)
- [npm](https://www.npmjs.com/package/react-native-shake)
- License: MIT
