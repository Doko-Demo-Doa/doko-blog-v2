---
title: Getting Started
description: Create, edit, save, render, and sign your first PDF.
---

This page shows the normal flow: create or open a document, modify it, save it, and optionally render or sign the saved file.

## Create a PDF

PDF coordinates use points. A US Letter page is commonly `612 x 792` points. The origin is bottom-left.

```ts
import { PdfDocument } from '@doko/react-native-pdf-editor';

const doc = PdfDocument.create();
const page = doc.createPage(612, 792);

const painter = page.createPainter();
const font = doc.getStandard14Font('Helvetica');

painter.setFont(font, 22);
painter.drawText('Invoice #1001', 50, 730);
painter.setFont(font, 12);
painter.drawText('Thank you for your business.', 50, 700);
painter.drawLine(50, 685, 560, 685);
painter.finishDrawing();

await doc.save('/path/to/invoice.pdf');
```

Always call `finishDrawing()` when you are done with a painter. PoDoFo expects drawing sessions to be explicitly closed before the content stream is complete.

## Open an existing PDF

```ts
import { PdfDocument } from '@doko/react-native-pdf-editor';

const doc = await PdfDocument.open('/path/to/source.pdf');
console.log(doc.pageCount);

const page = doc.getPage(0);
page.setRotation(90);

await doc.save('/path/to/rotated.pdf');
```

Encrypted documents can be opened with a password:

```ts
const doc = await PdfDocument.open('/path/to/protected.pdf', 'user-password');
```

## Render a saved page to an image

Rendering reads from a file path. If you edited an in-memory document, save it first.

```ts
import { PdfRenderer } from '@doko/react-native-pdf-editor';

const bitmap = await PdfRenderer.renderPageToBitmap({
  path: '/path/to/invoice.pdf',
  pageIndex: 0,
  scale: 2,
});

await PdfRenderer.writeBitmapToImage(bitmap, {
  outputPath: '/path/to/invoice-preview.png',
  format: 'png',
});
```

`bitmap.data` is an `ArrayBuffer` with raw RGBA8888 pixels. For sharing or displaying through normal image components, write it to PNG or JPEG first.

## Copy pages into a new document

```ts
const source = await PdfDocument.open('/path/to/big.pdf');
const output = PdfDocument.create();

output.appendPageRangeFrom(source, 0, 10);
await output.save('/path/to/first-ten-pages.pdf');
```

For very large PDFs, prefer processing smaller batches and saving each output file. PoDoFo is lazy about streams, but it is not a magical streaming splitter. It is good software, not a portal.

## Sign a PDF

Signing uses a separate entry point:

```ts
import { createSigner, signPdf } from '@doko/react-native-pdf-editor/signing';

const signer = createSigner({
  keyAlgorithm: 'RSA',
  certificateChain: [leafCertificateBase64Der, intermediateCertificateBase64Der],
  rawSign: async (payloadBase64, algorithm) => {
    return signWithYourKey(payloadBase64, algorithm);
  },
});

await signPdf(signer, {
  inputPath: '/path/to/invoice.pdf',
  outputPath: '/path/to/invoice-signed.pdf',
  conformanceLevel: 'B-B',
});
```

The `Signer` can be backed by anything that can sign a digest: YubiKey, HSM, cloud KMS, remote service, or a development-only software key.
