---
title: Document Editing
description: Open, create, save, merge, split, and reorder PDF pages.
---

## Create and save

```ts
import { PdfDocument } from '@doko/react-native-pdf-editor';

const doc = PdfDocument.create();
doc.createPage(612, 792);
await doc.save('/path/to/new.pdf');
```

`save(path)` writes the whole document to disk and returns a `Promise<void>`.

## Open

```ts
const doc = await PdfDocument.open('/path/to/source.pdf');
const encrypted = await PdfDocument.isEncrypted('/path/to/source.pdf');
```

For encrypted files:

```ts
const doc = await PdfDocument.open('/path/to/protected.pdf', 'password');
```

## Page access

```ts
const count = doc.pageCount;
const page = doc.getPage(0);

console.log(page.width, page.height, page.index);
```

`PdfPage` instances are owned by their document. If you remove or reorder pages, previously obtained page objects for shifted pages may no longer represent what you think they represent. Page handles are useful, but they are not friendship bracelets.

## Add and insert pages

```ts
doc.createPage(612, 792);
doc.createPageAt(0, 595, 842); // A4-ish, inserted at the front
```

## Remove pages

```ts
doc.removePageAt(2);
```

Page indices are 0-based.

## Rotate pages

```ts
const page = doc.getPage(0);
page.setRotation(90);

console.log(page.getRotation()); // 0, 90, 180, or 270
```

Rotation is clockwise and should be a multiple of 90 degrees.

## Resize pages

The MediaBox is the physical page size:

```ts
const page = doc.getPage(0);
page.setMediaBox(0, 0, 612, 792);
```

The CropBox is the visible region:

```ts
page.setCropBox(36, 36, 540, 720);
```

## Reorder pages

```ts
const page = doc.getPage(4);
const moved = page.moveTo(0);
```

`moveTo` returns `false` if the page was already at that index.

## Merge documents

```ts
const a = await PdfDocument.open('/path/to/a.pdf');
const b = await PdfDocument.open('/path/to/b.pdf');

const merged = PdfDocument.create();
merged.appendPagesFrom(a);
merged.appendPagesFrom(b);

await merged.save('/path/to/merged.pdf');
```

Do not append a document into itself. The native implementation rejects that.

## Split or copy page ranges

```ts
const source = await PdfDocument.open('/path/to/source.pdf');

const part = PdfDocument.create();
part.appendPageRangeFrom(source, 50, 25); // pages 50..74
await part.save('/path/to/pages-50-74.pdf');
```

For huge PDFs, create one output document per batch, save it, then let it be collected. Reopening the source for each batch can use less peak memory, at the cost of speed.

## Insert a page from another document

```ts
const source = await PdfDocument.open('/path/to/source.pdf');
const target = await PdfDocument.open('/path/to/target.pdf');

target.insertPageFrom(0, source, 3);
await target.save('/path/to/with-inserted-page.pdf');
```
