---
title: Requirements
description: Platform, architecture, and native dependency requirements.
---

## Minimum versions

| Requirement | Minimum |
|---|---|
| React Native | 0.79+ with the New Architecture enabled |
| Nitro Modules | `react-native-nitro-modules` installed in the app |
| iOS | 15.1+ |
| Android | API 26+ |

The package is **New Architecture only**. There is no old bridge fallback.

## Why Android API 26?

The published `podofo-android` AAR declares `minSdkVersion` 26. If your app is lower than that, Android's manifest merger will fail before your PDF gets a chance to be majestic.

Set your app's minimum SDK to 26 or higher.

For Expo-managed apps, that usually means `expo-build-properties`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "minSdkVersion": 26
          }
        }
      ]
    ]
  }
}
```

## Native stack

| Platform | Implementation path |
|---|---|
| iOS | Nitro C++ bindings directly to PoDoFo core, plus platform render/image APIs |
| Android | Kotlin Nitro implementation over `podofo-android` JNI wrapper, plus Android render/image APIs |

Rendering does not use PoDoFo. It uses platform renderers:

- iOS: Core Graphics (`CGPDFDocument`, `CGPDFPage`)
- Android: `android.graphics.pdf.PdfRenderer`

That distinction matters because rendering reads from a file path, not from an unsaved in-memory `PdfDocument`. Save first, render second. PDFs enjoy being written down before being photographed.

## Platform support table

| Feature | Android | iOS |
|---|---|---|
| Document create/open/save | Full | Full |
| Page add/remove/rotate/resize/reorder | Full | Full |
| Merge and copy page ranges | Full | Full |
| Painter: text/images/shapes/colors | Full | Full |
| Custom fonts from path or buffer | Full | Full |
| Annotations base API | Full | Full |
| AcroForm text boxes and checkboxes | Full | Full |
| Radio/combo/list/signature field editing | Not bound | Not bound |
| Signature field inspection and verification | Full | Full |
| Encryption and encryption inspection | Full | Full |
| PAdES signing B-B/B-T/B-LT/B-LTA | Full | Full |
| Page rendering and text extraction | Full | Full |

Android and iOS are not permanently frozen in this shape. The Android surface is expected to keep catching up as the underlying JNI wrapper expands.
