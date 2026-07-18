---
title: Troubleshooting
description: Common issues when integrating react-native-sweet-alert.
---

## Build fails / module not found

This library is **New Architecture only** - there's no legacy-bridge fallback. Make sure the New Architecture is enabled in your app before installing (React Native 0.86+ ships it as the only supported architecture).

## Progress bar doesn't update

Make sure you're calling `SweetAlert.setProgress(value)` against the currently displayed `progress`-style alert - it has no effect if no progress alert is showing, and `value` should be a number between `0` and `100`.

## Alert shows a spinner instead of a progress bar

An indeterminate spinner is shown whenever `progress` is omitted from the `showAlert` options. Pass an initial `progress` value (e.g. `0`) to get the determinate bar instead.

## Colors don't match dark mode

Card background and text adapt to dark mode automatically on both platforms. Custom colors you pass (`confirmButtonColor`, `otherButtonColor`, `progressBarColor`) are applied as-is and are not adjusted for dark mode - pick values that work in both themes if your app supports both.

## Still stuck?

Open an issue on [GitHub](https://github.com/Doko-Demo-Doa/react-native-sweet-alert/issues).
