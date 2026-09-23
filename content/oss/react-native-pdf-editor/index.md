---
title: What is this?
description: Native PDF editing, rendering, encryption, and PAdES signing for React Native.
---

`@doko/react-native-pdf-editor` is a React Native library for creating, editing, rendering, encrypting, and digitally signing PDF files on iOS and Android. Built with Nitro Modules, New Architecture only.

It's built on top of my fork of [PoDoFo](https://github.com/Doko-Demo-Doa/podofo), a C++ 17 PDF manipulation library. PDF is processed in C++ side for best performance while keeping it cross-platform.

However it's just a PDF processing lib. It doesn't provide PDF view component as there are many great libs out there can do the job better.

## What it can do

| Area            | Supported today                                                      |
| --------------- | -------------------------------------------------------------------- |
| Documents       | Create, open, save, merge, split/copy page ranges                    |
| Pages           | Add, remove, rotate, resize, reorder                                 |
| Drawing         | Text, images, lines, rectangles, circles, colors, graphics state     |
| Fonts           | PDF standard 14 fonts, custom font files, in-memory font buffers     |
| Images          | Embed encoded image buffers and draw them on pages                   |
| Annotations     | Create/read common annotation base data: type, rect, contents        |
| Forms           | Text boxes, checkboxes, field inspection                             |
| Metadata        | Title, author, subject, creator                                      |
| Encryption      | AES-256 encryption, passwords, permissions, encryption inspection    |
| Rendering       | Render saved PDF pages to RGBA bitmap, write PNG/JPEG                |
| Text extraction | Extract page text entries, optionally filtered by regex              |
| Signing         | Signer-agnostic PAdES B-B, B-T, B-LT, B-LTA                          |
| Verification    | Check signature byte-range integrity, without trust-chain validation |

## What it is not

- Not a PDF viewer UI.
- Not a full PDF content parser that returns every text/image/vector element as structured JS objects.
- Not a trust-store or certificate-revocation validation framework.
- Not old-bridge compatible.

For viewing PDFs, pair it with a dedicated PDF viewer; this library is the toolbox for editing them.

## Package entry points

```ts
import { PdfDocument, PdfRenderer } from "@doko/react-native-pdf-editor";
import { signPdf, createSigner } from "@doko/react-native-pdf-editor/signing";
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

The library is still alpha. I try to minimize the API changes and, ideally, make the API set stable at v1.0.0.

## Links

- [GitHub](https://github.com/Doko-Demo-Doa/react-native-pdf-editor)
- [npm](https://www.npmjs.com/package/@doko/react-native-pdf-editor)
- [PoDoFo fork](https://github.com/Doko-Demo-Doa/podofo)
