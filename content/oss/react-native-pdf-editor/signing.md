---
title: PAdES Signing
description: Sign PDFs with external keys using a signer-agnostic API.
---

Signing lives on a separate entry point:

```ts
import { createSigner, signPdf } from '@doko/react-native-pdf-editor/signing';
```

The library does not own your private key. Instead, it prepares the PDF hash, asks your `Signer` to sign it, and injects the returned signature into the PDF.

That means your signer can be backed by:

- YubiKey PIV
- HSM or PKCS#11
- GoTrust or another hardware token
- Cloud KMS
- Remote signing service
- Software key for development and tests

The PDF library is the document chef. Your key is the locked spice cabinet.

## Basic signing

```ts
import { createSigner, signPdf } from '@doko/react-native-pdf-editor/signing';

const signer = createSigner({
  keyAlgorithm: 'RSA',
  certificateChain: [leafCertBase64Der, intermediateCertBase64Der],
  rawSign: async (payloadBase64, algorithm) => {
    return signDigestWithYourKey(payloadBase64, algorithm);
  },
});

await signPdf(signer, {
  inputPath: '/path/to/input.pdf',
  outputPath: '/path/to/signed.pdf',
  conformanceLevel: 'B-B',
});
```

Every byte payload is base64. Certificates are base64 DER, not PEM.

## Conformance levels

```ts
type PadesConformanceLevel = 'B-B' | 'B-T' | 'B-LT' | 'B-LTA';
```

| Level | Meaning | Extra requirements |
|---|---|---|
| `B-B` | Basic PAdES signature | Signature only |
| `B-T` | Adds RFC3161 timestamp | `signer.timestamp` |
| `B-LT` | Adds long-term validation data in DSS | timestamp + validation data |
| `B-LTA` | Adds archival document timestamp | timestamp + validation data + LTA timestamp round |

`signPdf` orchestrates the multi-step flow for you.

## Signer interface

```ts
interface Signer {
  getCertificateChain(): Promise<string[]>;
  sign(digestBase64: string, algorithm: DigestAlgorithm): Promise<string>;
  timestamp?(messageImprintBase64: string, algorithm: DigestAlgorithm): Promise<string>;
}
```

`getCertificateChain()` must return the end-entity certificate first:

```ts
[leafCertificateBase64Der, ...intermediateCertificatesBase64Der]
```

Do not include the root certificate in `certificateChain`. Pass it separately as `rootCertificate` if needed.

## Root certificate

```ts
await signPdf(signer, {
  inputPath,
  outputPath,
  conformanceLevel: 'B-B',
  rootCertificate: rootCertificateBase64Der,
});
```

`rootCertificate` is supported on both iOS and Android when using PoDoFo 0.0.12 or newer.

## Digest algorithms

```ts
type DigestAlgorithm = 'SHA256' | 'SHA384' | 'SHA512';
```

Default is `SHA256`:

```ts
await signPdf(signer, {
  inputPath,
  outputPath,
  conformanceLevel: 'B-B',
  hashAlgorithm: 'SHA384',
});
```

For RSA PKCS#1 v1.5 signers that expect a full ASN.1 `DigestInfo`, use the exported prefix map:

```ts
import { RSA_PKCS1_DIGEST_INFO_PREFIX_HEX } from '@doko/react-native-pdf-editor/signing';
```

ECDSA signers usually sign the raw digest directly.

## Timestamping

For `B-T`, `B-LT`, and `B-LTA`, implement `timestamp`:

```ts
const signer = createSigner({
  keyAlgorithm: 'RSA',
  certificateChain,
  rawSign,
  timestamp: async (messageImprintBase64, algorithm) => {
    return fetchTimestampToken(messageImprintBase64, algorithm);
  },
});
```

Return a base64-encoded RFC3161 TimeStampResp.

## Validation data for B-LT/B-LTA

```ts
await signPdf(signer, {
  inputPath,
  outputPath,
  conformanceLevel: 'B-LT',
  validationData: {
    certificates: [certBase64Der],
    crls: [crlBase64Der],
    ocsps: [ocspBase64Der],
  },
});
```

The library can help build OCSP requests and extract certificate URLs through the lower-level `PdfSigningSession`, but it does not perform HTTP fetching or decide trust policy for you.

## Lower-level signing session

Use `PdfEditorFactory.createSigningSession` if you need manual control:

```ts
const session = PdfEditorFactory.createSigningSession({
  conformanceLevel: 'B-B',
  hashAlgorithm: 'SHA256',
  inputPath,
  outputPath,
  endCertificate,
  certificateChain,
  rootCertificate,
});

const digest = await session.beginSigning();
const signature = await signDigest(digest);
await session.finishSigning(signature);
```

Most apps should use `signPdf` unless they need to drive OCSP/CRL/TSA helpers themselves.
