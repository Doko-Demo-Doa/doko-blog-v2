---
title: Installation
description: Install the package and configure iOS and Android.
---

## Install packages

```bash
npm install @doko/react-native-pdf-editor react-native-nitro-modules
# or
yarn add @doko/react-native-pdf-editor react-native-nitro-modules
# or
pnpm add @doko/react-native-pdf-editor react-native-nitro-modules
```

`react-native-nitro-modules` is required. This package is implemented as a Nitro Module, not a classic native module.

## Enable the New Architecture

Your app must use React Native's New Architecture. Check your React Native version and project settings first. If your app still depends on the old bridge, this library will not load.

## iOS

Run CocoaPods install from your app's iOS directory:

```bash
cd ios
pod install
```

The podspec downloads the PoDoFo xcframework release used by this library. If you change the package version or the PoDoFo version, run `pod install` again so the generated Nitro headers and Pods project stay in sync.

## Android

Make sure your app's `minSdkVersion` is at least 26:

```groovy
android {
  defaultConfig {
    minSdkVersion 26
  }
}
```

The Android package pulls the published `io.github.doko-demo-doa:podofo-android` artifact.

## Expo apps

This is a native module, so Expo Go is not enough. Use a development build:

```bash
npx expo prebuild
npx expo run:ios
npx expo run:android
```

For Android, set `android.minSdkVersion` to 26 through `expo-build-properties` if needed.

## Import paths

Editing, rendering, encryption, metadata, fields, annotations:

```ts
import { PdfDocument, PdfRenderer } from '@doko/react-native-pdf-editor';
```

Signing helpers:

```ts
import { signPdf, createSigner } from '@doko/react-native-pdf-editor/signing';
```

## Verify installation

Create and save one PDF:

```ts
import { PdfDocument } from '@doko/react-native-pdf-editor';

const doc = PdfDocument.create();
const page = doc.createPage(612, 792);
const painter = page.createPainter();
const font = doc.getStandard14Font('Helvetica');

painter.setFont(font, 24);
painter.drawText('It works. The PDF has entered the chat.', 50, 700);
painter.finishDrawing();

await doc.save('/path/to/output.pdf');
```
