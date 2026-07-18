---
title: Usage
description: Usage patterns for each react-native-sweet-alert style.
---

## Basic alert

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

## Alert styles

`style` is one of `'success' | 'error' | 'warning' | 'normal' | 'progress'`.

```js
await SweetAlert.showAlert({
  style: 'warning',
  title: 'Are you sure?',
  subTitle: "This can't be undone.",
  confirmButtonTitle: 'Delete',
  confirmButtonColor: '#F27474',
  otherButtonTitle: 'Cancel',
  otherButtonColor: '#8CC152',
});
```

Set `cancellable: true` to let the user dismiss the alert by tapping outside it (resolves with `{ confirmed: false }`).

Omit `otherButtonTitle` to show a single-button alert.

## Progress style

```js
await SweetAlert.showAlert({
  style: 'progress',
  title: 'Uploading…',
  progress: 0, // omit for an indeterminate spinner
  progressBarColor: '#4A90D9',
  progressCircleRadius: 36,
  progressBarWidth: 6,
  progressRimWidth: 6,
});

SweetAlert.setProgress(50); // update the same alert's progress later
SweetAlert.dismissAlert(); // dismiss it programmatically when done
```

Omitting `progress` shows an indeterminate spinner instead of a determinate bar.

## Theming

Confirm/other buttons and the progress bar accept per-alert hex colors (`confirmButtonColor`, `otherButtonColor`, `progressBarColor`). Card background and text adapt to dark mode automatically on both platforms - no extra configuration needed.
