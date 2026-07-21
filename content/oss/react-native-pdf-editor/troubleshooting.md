---
title: Troubleshooting
description: Common setup, build, and runtime issues.
---

## Android build fails because `minSdkVersion` is too low

Raise your app's minimum SDK to 26. The `podofo-android` artifact requires it.

## The module is undefined or cannot be loaded

Check that:

- your app uses React Native's New Architecture
- `react-native-nitro-modules` is installed
- iOS Pods were installed after adding the package
- you are using a native development build, not Expo Go

## iOS build cannot find generated Nitro headers

Run Nitrogen and then refresh Pods:

```bash
node node_modules/nitrogen/lib/index.js
cd ios
pod install
```

If you are in the example app, run `pod install` from `example/ios`.

## `pnpm nitrogen` hangs or package-manager verification fails

You can call the local binary directly:

```bash
node node_modules/nitrogen/lib/index.js
```

This bypasses package-manager version switching and still generates `nitrogen/generated`.

## Rendering does not include my latest edits

`PdfRenderer` renders from a file path. Save first:

```ts
await doc.save(path);
const bitmap = await PdfRenderer.renderPageToBitmap({ path, pageIndex: 0 });
```

## Text appears at the wrong vertical position

PDF coordinates start at the bottom-left. React Native layout coordinates start at the top-left. Your y-axis is upside down, not your destiny.

## Text extraction misses text

Possible reasons:

- the page is scanned image content with no OCR layer
- text is stored in a way the current extraction binding does not decode
- the content stream order is not visual reading order
- your regex pattern filters it out

## `getText()` or `isChecked()` throws

Those methods are field-type specific. Check `field.fieldType` first:

```ts
if (field.fieldType === 'TextBox') {
  field.getText();
}
```

## Signature verification returns `ValidNoTrust`

That is a successful byte-range integrity check, but not full certificate trust validation. You still need to validate certificate chain, trusted roots, validity dates, revocation, and your own business policy.

## Signature verification returns `CouldNotVerify`

Common causes:

- field has no signature value
- malformed signature contents
- missing or invalid `/ByteRange`
- verifying against a different file path than the signed PDF

Use `field.getSignatureInfo()` first and skip fields where `hasSignatureValue` is false.

## Android `rootCertificate` support

`rootCertificate` requires PoDoFo 0.0.12 or newer. The current library version is wired for that constructor. If you manually override the Android PoDoFo artifact to an older version, Android signing with `rootCertificate` can throw.

## Large PDFs use too much memory

PoDoFo loads the document structure and lazily loads streams, but page copying is not a true streaming split operation. For very large PDFs:

- process small page ranges
- save each output document separately
- release output documents between batches
- consider reopening the source for each batch if memory is more important than speed
- avoid returning huge buffers to JS

The safe rule: keep big binary work native and file-based.

## `painter.finishDrawing()` was forgotten

Call it once when done drawing. If content is missing or the output is malformed after drawing, this is one of the first things to check.

## Still stuck?

Open an issue on [GitHub](https://github.com/Doko-Demo-Doa/react-native-pdf-editor/issues) with:

- React Native version
- platform and OS version
- package version
- whether New Architecture is enabled
- native build log
- minimal code snippet
- a sample PDF if the issue depends on a specific file
