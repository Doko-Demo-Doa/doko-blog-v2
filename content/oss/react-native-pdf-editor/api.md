---
title: API Reference
description: Main public API surface for react-native-pdf-editor.
---

This is a practical reference, not generated TypeDoc. For exact signatures, trust the exported TypeScript types in your editor.

## Main entry point

```ts
import {
  PdfDocument,
  PdfRenderer,
  type PdfDocument as PdfDocumentInstance,
  type PdfPage,
  type PdfPainter,
  type PdfField,
  type PdfAnnotation,
} from '@doko/react-native-pdf-editor';
```

## `PdfDocument`

Static helpers:

```ts
PdfDocument.create(): PdfDocument
PdfDocument.open(path: string, password?: string): Promise<PdfDocument>
PdfDocument.isEncrypted(path: string): Promise<boolean>
```

Document instance:

```ts
readonly pageCount: number
getPage(index: number): PdfPage
createPage(width: number, height: number): PdfPage
createPageAt(index: number, width: number, height: number): PdfPage
removePageAt(index: number): void
appendPagesFrom(source: PdfDocument): void
appendPageRangeFrom(source: PdfDocument, pageIndex: number, pageCount: number): void
insertPageFrom(atIndex: number, source: PdfDocument, pageIndex: number): void
save(path: string): Promise<void>
```

Fonts and images:

```ts
getStandard14Font(name: Standard14FontName): PdfFont
loadFont(path: string): PdfFont
loadFontFromBuffer(data: ArrayBuffer): PdfFont
createImageFromBuffer(data: ArrayBuffer): PdfImage
```

Metadata:

```ts
getTitle(): string | undefined
setTitle(title: string | undefined): void
getAuthor(): string | undefined
setAuthor(author: string | undefined): void
getSubject(): string | undefined
setSubject(subject: string | undefined): void
getCreator(): string | undefined
setCreator(creator: string | undefined): void
```

Forms:

```ts
readonly fieldCount: number
getFieldAt(index: number): PdfField
createTextBox(name: string): PdfField
createCheckBox(name: string): PdfField
```

Encryption:

```ts
setEncrypted(userPassword: string, ownerPassword: string, permissions?: PdfPermissions): void
isEncrypted(): boolean
getEncryptionInfo(): PdfEncryptionInfo | undefined
```

## `PdfPage`

```ts
readonly width: number
readonly height: number
readonly index: number

getRotation(): number
setRotation(rotation: number): void
getMediaBox(): PdfRect
setMediaBox(x: number, y: number, width: number, height: number): void
getCropBox(): PdfRect
setCropBox(x: number, y: number, width: number, height: number): void
moveTo(newIndex: number): boolean

createPainter(): PdfPainter

getAnnotationCount(): number
getAnnotationAt(index: number): PdfAnnotation
createAnnotation(type: PdfAnnotationType, x: number, y: number, width: number, height: number): PdfAnnotation

extractText(pattern?: string): PdfTextEntry[]
```

## `PdfPainter`

```ts
setFont(font: PdfFont, fontSize: number): void
drawText(text: string, x: number, y: number): void
drawImage(image: PdfImage, x: number, y: number, scaleX?: number, scaleY?: number): void
drawLine(x1: number, y1: number, x2: number, y2: number): void
drawRectangle(x: number, y: number, width: number, height: number, fill: boolean): void
drawCircle(x: number, y: number, radius: number, fill: boolean): void
setStrokingColorRGB(red: number, green: number, blue: number): void
setNonStrokingColorRGB(red: number, green: number, blue: number): void
save(): void
restore(): void
finishDrawing(): void
```

## `PdfRenderer`

```ts
PdfRenderer.renderPageToBitmap(options: RenderPageOptions): Promise<PdfPageBitmap>
PdfRenderer.writeBitmapToImage(bitmap: PdfPageBitmap, options: WriteBitmapToImageOptions): Promise<void>
```

Types:

```ts
interface RenderPageOptions {
  path: string;
  pageIndex: number;
  scale?: number;
}

interface PdfPageBitmap {
  data: ArrayBuffer;
  width: number;
  height: number;
  bytesPerRow: number;
  format: string;
}

interface WriteBitmapToImageOptions {
  outputPath: string;
  format: 'png' | 'jpeg';
}
```

## `PdfField`

```ts
readonly fieldType: PdfFieldType
readonly fullName: string

getText(): string | undefined
setText(text: string | undefined): void
isChecked(): boolean
setChecked(checked: boolean): void
getSignatureInfo(): PdfSignatureInfo
verifySignature(documentPath: string): Promise<PdfSignatureVerificationStatus>
```

Field-specific methods throw if used on the wrong field type.

## `PdfAnnotation`

```ts
readonly annotationType: PdfAnnotationType
getRect(): PdfRect
setRect(x: number, y: number, width: number, height: number): void
getContents(): string | undefined
setContents(contents: string | undefined): void
```

## Signing entry point

```ts
import {
  signPdf,
  createSigner,
  DIGEST_ALGORITHM_OIDS,
  RSA_PKCS1_DIGEST_INFO_PREFIX_HEX,
  type Signer,
  type SignPdfOptions,
  type ValidationData,
} from '@doko/react-native-pdf-editor/signing';
```

High-level signing:

```ts
signPdf(signer: Signer, options: SignPdfOptions): Promise<void>
```

Signer:

```ts
interface Signer {
  getCertificateChain(): Promise<string[]>;
  sign(digestBase64: string, algorithm: DigestAlgorithm): Promise<string>;
  timestamp?(messageImprintBase64: string, algorithm: DigestAlgorithm): Promise<string>;
}
```

Options:

```ts
interface SignPdfOptions {
  inputPath: string;
  outputPath: string;
  conformanceLevel: 'B-B' | 'B-T' | 'B-LT' | 'B-LTA';
  hashAlgorithm?: 'SHA256' | 'SHA384' | 'SHA512';
  rootCertificate?: string;
  visibleTextSignature?: PdfVisibleTextSignatureOptions;
  visibleImageSignature?: PdfVisibleImageSignatureOptions;
  validationData?: ValidationData;
}
```

Visible text signatures:

```ts
interface PdfVisibleTextSignatureOptions {
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontName?: string;
  signerName?: string;
  reason?: string;
  location?: string;
  contactInfo?: string;
}
```

Visible image signatures:

```ts
type PdfVisibleSignatureImageFit = 'contain' | 'stretch';

interface PdfVisibleSignatureImageOptions {
  path?: string;
  base64?: string;
  bytes?: ArrayBuffer;
  fit?: PdfVisibleSignatureImageFit;
}

interface PdfVisibleImageSignatureOptions {
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  image: PdfVisibleSignatureImageOptions;
  signerName?: string;
  reason?: string;
  location?: string;
  contactInfo?: string;
}
```

For `PdfVisibleSignatureImageOptions`, pass exactly one image source: `path`, `base64`, or `bytes`.

## Lower-level signing session

Available through `PdfEditorFactory.createSigningSession(...)` for advanced workflows.

```ts
beginSigning(): Promise<string>
finishSigning(signatureBase64: string, timestampTokenBase64?: string, certificates?: string[], crls?: string[], ocsps?: string[]): Promise<void>
beginSigningLTA(): Promise<string>
finishSigningLTA(timestampTokenBase64: string, certificates?: string[], crls?: string[], ocsps?: string[]): Promise<void>
getCrlFromCertificate(certificateBase64: string): string
extractSignerCertFromTSR(tsrBase64: string): string
extractIssuerCertFromTSR(tsrBase64: string): string
getOCSPResponderUrl(certificateBase64: string, issuerCertificateBase64: string): string
buildOCSPRequest(certificateBase64: string, issuerCertificateBase64: string): string
getCertificateIssuerUrl(certificateBase64: string): string
```
