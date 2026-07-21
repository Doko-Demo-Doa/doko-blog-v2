---
title: Drawing
description: Draw text, images, and simple vector shapes onto PDF pages.
---

Drawing is done with a `PdfPainter` created from a page.

```ts
const page = doc.createPage(612, 792);
const painter = page.createPainter();

// draw...

painter.finishDrawing();
```

Call `finishDrawing()` once. Without it, the page content stream may be incomplete.

## Coordinates

PDF page coordinates use points and a bottom-left origin. On a `612 x 792` page:

- `x = 0, y = 0` is bottom-left
- `x = 612, y = 792` is top-right
- text at `y = 720` is near the top

If you are coming from React Native layout coordinates, this is the part where your mental y-axis politely flips over.

## Text

```ts
const font = doc.getStandard14Font('Helvetica');

painter.setFont(font, 18);
painter.drawText('Hello PDF', 50, 720);
```

You must set a font before drawing text.

## Standard fonts

Supported standard 14 font names:

```ts
type Standard14FontName =
  | 'TimesRoman'
  | 'TimesItalic'
  | 'TimesBold'
  | 'TimesBoldItalic'
  | 'Helvetica'
  | 'HelveticaOblique'
  | 'HelveticaBold'
  | 'HelveticaBoldOblique'
  | 'Courier'
  | 'CourierOblique'
  | 'CourierBold'
  | 'CourierBoldOblique'
  | 'Symbol'
  | 'ZapfDingbats';
```

Standard fonts do not need embedding.

## Custom fonts

From a file path:

```ts
const font = doc.loadFont('/path/to/font.ttf');
painter.setFont(font, 16);
```

From an in-memory buffer:

```ts
const font = doc.loadFontFromBuffer(fontArrayBuffer);
painter.setFont(font, 16);
```

Custom fonts are embedded so viewers can render the document correctly.

## Images

Create an image from encoded image bytes, then draw it:

```ts
const image = doc.createImageFromBuffer(imageArrayBuffer);

painter.drawImage(image, 50, 500);
painter.drawImage(image, 300, 500, 0.5, 0.5);
```

The buffer should contain an encoded image format supported by the native image loader, such as PNG or JPEG.

## Shapes

```ts
painter.drawLine(50, 650, 560, 650);
painter.drawRectangle(50, 580, 120, 40, false);
painter.drawRectangle(200, 580, 120, 40, true);
painter.drawCircle(420, 600, 20, false);
```

The last argument on rectangles and circles controls whether the shape is filled.

## Colors

```ts
painter.setStrokingColorRGB(0, 0, 0);
painter.setNonStrokingColorRGB(0.1, 0.3, 0.8);
```

Color components are numbers in the `0..1` range.

- Stroking color affects lines and outlines.
- Non-stroking color affects fills and text.

## Graphics state

Use `save()` and `restore()` to isolate temporary color or drawing state:

```ts
painter.save();
painter.setNonStrokingColorRGB(1, 0, 0);
painter.drawRectangle(50, 50, 100, 100, true);
painter.restore();
```

## Current limits

The painter binding intentionally exposes a practical subset today: text, images, basic shapes, colors, and graphics state. Advanced PDF drawing operators, transparency, clipping, paths, gradients, and text layout helpers are not exposed yet.
