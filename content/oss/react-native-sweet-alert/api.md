---
title: API Reference
description: Full API surface for react-native-sweet-alert.
---

## `SweetAlert.showAlert(options)`

Shows a native alert dialog. Returns a promise that resolves to `{ confirmed: boolean }` once the user dismisses it - `confirmed` reflects which button was pressed (or `false` if dismissed via `cancellable` tap-outside).

```js
const result = await SweetAlert.showAlert({
  style: 'success',
  title: 'Great job!',
  subTitle: 'Everything went smoothly.',
  confirmButtonTitle: 'OK',
});
```

### Options

| Option | Type | Notes |
|---|---|---|
| `style` | `string` | Required. `success`/`error`/`warning`/`normal`/`progress` |
| `title` | `string` | |
| `subTitle` | `string` | |
| `confirmButtonTitle` | `string` | |
| `confirmButtonColor` | `string` | Hex color, e.g. `#4A90D9` |
| `otherButtonTitle` | `string` | Omit to show a single-button alert |
| `otherButtonColor` | `string` | Hex color |
| `cancellable` | `boolean` | Tap outside to dismiss |
| `progress` | `number` | 0-100; `progress` style only. Omit for indeterminate |
| `progressBarColor` | `string` | `progress` style only |
| `progressCircleRadius` | `number` | `progress` style only, in dp/pt |
| `progressBarWidth` | `number` | `progress` style only, in dp/pt |
| `progressRimWidth` | `number` | `progress` style only, in dp/pt (Android) |
| `progressSpinSpeed` | `number` | `progress` style only (Android) |

## `SweetAlert.setProgress(value)`

Updates the progress value (0-100) of the currently displayed `progress`-style alert.

```js
SweetAlert.setProgress(50);
```

## `SweetAlert.dismissAlert()`

Programmatically dismisses the currently displayed alert.

```js
SweetAlert.dismissAlert();
```
