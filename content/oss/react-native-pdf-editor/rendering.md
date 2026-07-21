---
title: Rendering and Text Extraction
description: Render saved PDF pages to images and extract page text.
---

Rendering is handled by `PdfRenderer`, not `PdfDocument`.

```ts
import { PdfRenderer } from '@doko/react-native-pdf-editor';
```

`PdfRenderer` works on files on disk. If you edited a document in memory, call `save()` before rendering.

## Render a page to bitmap

```ts
const bitmap = await PdfRenderer.renderPageToBitmap({
  path: '/path/to/document.pdf',
  pageIndex: 0,
  scale: 2,
});
```

The returned `PdfPageBitmap` has:

```ts
interface PdfPageBitmap {
  data: ArrayBuffer;
  width: number;
  height: number;
  bytesPerRow: number;
  format: string; // 'RGBA8888' today
}
```

Use `bytesPerRow`, not `width * 4`, when indexing into `data`. Native row alignment can be a tiny footnote that becomes a large bug if ignored.

## Write bitmap to PNG or JPEG

```ts
await PdfRenderer.writeBitmapToImage(bitmap, {
  outputPath: '/path/to/page.png',
  format: 'png',
});
```

Supported formats:

```ts
type PdfBitmapImageFormat = 'png' | 'jpeg';
```

This is the recommended path if you want to share a rendered page or show it through normal image tooling.

## Why not return PNG directly?

The renderer returns bitmap pixels because that is useful for previews, analysis, and custom pipelines. Image encoding is separate because it is native work too. The library avoids making JavaScript cosplay as an image codec.

## Text extraction

Text extraction lives on `PdfPage`:

```ts
const doc = await PdfDocument.open('/path/to/document.pdf');
const page = doc.getPage(0);

const entries = page.extractText();
```

Each entry has:

```ts
interface PdfTextEntry {
  text: string;
  x: number;
  y: number;
  length: number;
}
```

Coordinates are in PDF page units with a bottom-left origin.

## Filter text with a regex

```ts
const invoiceNumbers = page.extractText('INV-[0-9]+');
```

The pattern is passed as an ECMAScript-flavor regex string.

## Reading order caveat

`extractText()` returns text in PDF content-stream order, not guaranteed human reading order. Complex layouts, columns, rotated text, forms, and scanned PDFs may need additional processing. If the PDF is just a scanned image with no OCR text layer, there may be no text to extract.
