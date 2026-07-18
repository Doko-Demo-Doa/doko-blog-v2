---
title: Getting Started
description: Install react-native-sweet-alert and show your first alert.
---

## Install

```bash
npm install react-native-sweet-alert
```

Autolinking handles the rest - no manual bridging headers, no `AndroidManifest.xml` edits. Because this library is built on the New Architecture (TurboModules) with no legacy-bridge fallback, make sure the New Architecture is enabled in your app.

## Requirements

- React Native 0.86+ with the New Architecture enabled
- iOS 15+, Android API 24+

## Your first alert

```js
import SweetAlert from 'react-native-sweet-alert';

const result = await SweetAlert.showAlert({
  style: 'success',
  title: 'Great job!',
  subTitle: 'Everything went smoothly.',
  confirmButtonTitle: 'OK',
});

// result.confirmed is `true`/`false` depending on which button was pressed.
```

See [Usage](./usage.md) for the other alert styles, and the [API Reference](./api.md) for the full options table.

## Example app

The repo ships a runnable Expo app exercising every alert style, under [`example/`](https://github.com/Doko-Demo-Doa/react-native-sweet-alert/tree/master/example). From the repo root:

```bash
pnpm install
pnpm example ios     # or: pnpm example android
```
