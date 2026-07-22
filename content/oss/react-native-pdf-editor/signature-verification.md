---
title: Signature Verification
description: Inspect signature fields and verify signed byte ranges.
---

Signature verification is exposed on `PdfField` for fields whose `fieldType` is `Signature`.

This verification checks whether the signature cryptographically matches the PDF bytes covered by `/ByteRange`. It does **not** validate certificate trust chains, trusted roots, CRLs, OCSP, or legal identity. In other words: it can tell you whether the signed bytes still match the signature, not whether you should trust the signer with your lunch money.

## Inspect signatures

```ts
const doc = await PdfDocument.open("/path/to/signed.pdf");

for (let index = 0; index < doc.fieldCount; index++) {
  const field = doc.getFieldAt(index);
  if (field.fieldType !== "Signature") continue;

  const info = field.getSignatureInfo();
  if (!info.hasSignatureValue) continue;

  console.log(field.fullName, info.signerName, info.signingDate);
}
```

`getSignatureInfo()` returns:

```ts
interface PdfSignatureInfo {
  hasSignatureValue: boolean;
  filter?: string;
  subFilter?: string;
  type?: string;
  signerName?: string;
  reason?: string;
  location?: string;
  contactInfo?: string;
  signingDate?: string;
  byteRange?: number[];
}
```

These are dictionary-level facts declared by the PDF signature field.

## Verify byte-range integrity

```ts
const status = await field.verifySignature("/path/to/signed.pdf");
```

Status values:

```ts
type PdfSignatureVerificationStatus =
  | "CouldNotVerify"
  | "Invalid"
  | "ValidNoTrust";
```

| Status           | Meaning                                                                                           |
| ---------------- | ------------------------------------------------------------------------------------------------- |
| `ValidNoTrust`   | The signature is cryptographically valid over the signed bytes. Certificate trust is not checked. |
| `Invalid`        | The signature does not match the signed bytes, or the CMS signature is invalid.                   |
| `CouldNotVerify` | The signature could not be checked, for example missing byte range or malformed contents.         |

> `Invalid` is a real cryptographic failure, not just an untrusted certificate. Common causes are verifying a modified PDF, signing the wrong payload shape for your key/HSM/KMS, returning truncated signature bytes, or using an older signing artifact with a known RSA signature-size bug. If you sign with RSA-2048 or larger, use PoDoFo 0.0.16 or newer.

## Full example

```ts
import { PdfDocument } from "@doko/react-native-pdf-editor";

async function readSignatures(path: string) {
  const doc = await PdfDocument.open(path);
  const signatures = [];

  for (let index = 0; index < doc.fieldCount; index++) {
    const field = doc.getFieldAt(index);
    if (field.fieldType !== "Signature") continue;

    const info = field.getSignatureInfo();
    if (!info.hasSignatureValue) continue;

    const status = await field.verifySignature(path);
    signatures.push({
      fieldName: field.fullName,
      status,
      ...info,
    });
  }

  return signatures;
}
```

## Trust validation is separate

To make a trust decision, your app still needs policy-specific validation:

- build and validate the certificate chain
- check trusted roots
- check certificate validity time
- check key usage / extended key usage
- check revocation through CRL or OCSP
- apply your business rules

PoDoFo exposes useful signing and parsing primitives, but it does not decide who your app should trust. That decision belongs to your product and security model.
