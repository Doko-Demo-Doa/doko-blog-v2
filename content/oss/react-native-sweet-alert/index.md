---
title: What is this?
description: Cute, native alert dialogs for React Native — success, error, warning, normal, and progress styles.
---

`react-native-sweet-alert` gives you native SweetAlert-style dialogs (ported from the native Android and iOS SweetAlert libraries) - success, error, warning, normal, and progress styles - built on the **New Architecture** (TurboModules).

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

## Features

- **Five alert styles** - `success`, `error`, `warning`, `normal`, `progress`
- **Progress style** - determinate (with a `setProgress()` ticker) or indeterminate spinner
- **Promise-based API** - `await showAlert(options)` resolves `{ confirmed: boolean }`
- **Cancellable** - optional tap-outside-to-dismiss on any style
- **Themeable** - per-alert hex colors for confirm/other buttons and the progress bar
- **Dark mode aware** - card background and text adapt automatically on both platforms
- **New Architecture only** - a Codegen spec, no legacy bridge fallback
- **Fully typed** - written in TypeScript, no `@types` package needed

## Requirements

- React Native 0.86+ with the **New Architecture** enabled - there is no legacy-bridge fallback
- iOS 15+, Android API 24+

## Quick links

- [Getting Started](./getting-started.md)
- [Usage](./usage.md)
- [API Reference](./api.md)
- [Troubleshooting](./troubleshooting.md)

## Installation

```bash
npm install react-native-sweet-alert
```

Autolinking handles the rest - no manual bridging headers, no `AndroidManifest.xml` edits.

## Links

- [GitHub](https://github.com/Doko-Demo-Doa/react-native-sweet-alert)
- [npm](https://www.npmjs.com/package/react-native-sweet-alert)
- License: MIT
