---
title: What is this?
description: Native PDF editing, rendering, encryption, and PAdES signing for React Native.
---

`@doko/react-native-pdf-editor` is a React Native library for creating, editing, rendering, encrypting, and digitally signing PDF files on iOS and Android.

It is built as a **New Architecture-only Nitro Module** and uses a modified [PoDoFo](https://github.com/Doko-Demo-Doa/podofo) fork for the core PDF model. iOS binds directly to the C++ core. Android uses Kotlin bindings over the published `podofo-android` JNI wrapper. The result is an API that feels like React Native, but does the heavy PDF work natively where it belongs. JavaScript is lovely. It should not be asked to chew a 200 MB scanned PDF for breakfast.

This is not a PDF viewer component. It does not mount a scrollable PDF reader on screen. It is for manipulating PDF files: generating reports, merging documents, filling simple fields, adding annotations, rendering pages to images, protecting files with passwords, and signing with external keys.

## What it can do

| Area | Supported today |
|---|---|
| Documents | Create, open, save, merge, split/copy page ranges |
| Pages | Add, remove, rotate, resize, reorder |
| Drawing | Text, images, lines, rectangles, circles, colors, graphics state |
| Fonts | PDF standard 14 fonts, custom font files, in-memory font buffers |
| Images | Embed encoded image buffers and draw them on pages |
| Annotations | Create/read common annotation base data: type, rect, contents |
| Forms | Text boxes, checkboxes, field inspection |
| Metadata | Title, author, subject, creator |
| Encryption | AES-256 encryption, passwords, permissions, encryption inspection |
| Rendering | Render saved PDF pages to RGBA bitmap, write PNG/JPEG |
| Text extraction | Extract page text entries, optionally filtered by regex |
| Signing | Signer-agnostic PAdES B-B, B-T, B-LT, B-LTA |
| Verification | Check signature byte-range integrity, without trust-chain validation |

## What it is not

- Not a PDF viewer UI.
- Not a full PDF content parser that returns every text/image/vector element as structured JS objects.
- Not a trust-store or certificate-revocation validation framework.
- Not old-bridge compatible.

For viewing PDFs, pair it with a dedicated PDF viewer. For editing PDFs, this library is the toolbox. The viewer can be the window; this is the wrench drawer.

## Package entry points

```ts
import { PdfDocument, PdfRenderer } from '@doko/react-native-pdf-editor';
import { signPdf, createSigner } from '@doko/react-native-pdf-editor/signing';
```

Signing is intentionally exposed from a separate `/signing` entry point so apps that only edit or render PDFs do not need to import the signing helpers and types.

## Quick links

- [Requirements](./requirements.md)
- [Installation](./installation.md)
- [Getting Started](./getting-started.md)
- [Document Editing](./document-editing.md)
- [Drawing](./drawing.md)
- [Rendering and Text Extraction](./rendering.md)
- [Forms, Annotations, and Metadata](./forms-annotations-metadata.md)
- [Encryption](./encryption.md)
- [PAdES Signing](./signing.md)
- [Signature Verification](./signature-verification.md)
- [API Reference](./api.md)
- [Troubleshooting](./troubleshooting.md)

## Status

The library is still alpha. The API is already useful, but some parts may change while the public shape is refined and Android/iOS parity continues to improve.

## Links

- [GitHub](https://github.com/Doko-Demo-Doa/react-native-pdf-editor)
- [npm](https://www.npmjs.com/package/@doko/react-native-pdf-editor)
- [PoDoFo fork](https://github.com/Doko-Demo-Doa/podofo)
