---
title: Encryption
description: Password-protect PDFs and inspect encryption settings.
---

## Check whether a file is encrypted

```ts
import { PdfDocument } from '@doko/react-native-pdf-editor';

const encrypted = await PdfDocument.isEncrypted('/path/to/file.pdf');
```

This checks a file path without you needing to keep a document open.

## Open an encrypted PDF

```ts
const doc = await PdfDocument.open('/path/to/protected.pdf', 'user-password');
```

If the password is wrong, the native load call rejects.

## Encrypt a document

```ts
const doc = await PdfDocument.open('/path/to/source.pdf');

doc.setEncrypted('user-password', 'owner-password');
await doc.save('/path/to/protected.pdf');
```

The current binding uses PoDoFo's default modern encryption for newly protected documents: AES-256, PDF 2.0 revision 6.

## Permissions

Permissions are optional. Omitted flags default to `true`.

```ts
doc.setEncrypted('open-me', 'owner-secret', {
  print: true,
  copy: false,
  edit: false,
  editNotes: false,
  fillAndSign: true,
  accessible: true,
  docAssembly: false,
  highPrint: false,
});
```

Supported permission flags:

| Flag | Meaning |
|---|---|
| `print` | Allow printing |
| `edit` | Allow general document modification |
| `copy` | Allow text and graphic extraction |
| `editNotes` | Allow annotations/form edits |
| `fillAndSign` | Allow filling forms and signature fields |
| `accessible` | Allow accessibility extraction |
| `docAssembly` | Allow document assembly operations |
| `highPrint` | Allow high-resolution printing |

PDF permissions are advisory in the PDF security model. Viewers and processors decide how strictly to honor them.

## Inspect encryption info

```ts
const info = doc.getEncryptionInfo();

if (info) {
  console.log(info.algorithm);
  console.log(info.keyLengthBits);
  console.log(info.revision);
  console.log(info.permissions.copy);
}
```

The shape is:

```ts
interface PdfEncryptionInfo {
  algorithm: string;
  keyLengthBits: number;
  revision: number;
  metadataEncrypted: boolean;
  parsed: boolean;
  ownerPasswordSet: boolean;
  permissions: PdfEncryptionPermissions;
}
```

`getEncryptionInfo()` returns `undefined` for unencrypted documents.

## About older encrypted PDFs

PoDoFo may report older algorithms such as RC4 or AESv2 when inspecting an existing PDF. That is about the source file's security dictionary, not the algorithm used when you call `setEncrypted()` on a new output.
