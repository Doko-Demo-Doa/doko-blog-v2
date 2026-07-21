---
title: References
description: Links, related projects, and implementation notes.
---

## Project links

- [react-native-pdf-editor on GitHub](https://github.com/Doko-Demo-Doa/react-native-pdf-editor)
- [npm package](https://www.npmjs.com/package/@doko/react-native-pdf-editor)
- [PoDoFo fork](https://github.com/Doko-Demo-Doa/podofo)
- [PoDoFo releases](https://github.com/Doko-Demo-Doa/podofo/releases)
- [Nitro Modules](https://nitro.margelo.com/)

## Related viewer libraries

This package edits/manipulates PDFs. It is not a viewer UI. For displaying PDFs, consider pairing it with a viewer package such as:

- [react-native-pdf-jsi](https://github.com/126punith/react-native-pdf-jsi)
- [react-native-pdf-viewer](https://github.com/alpha0010/react-native-pdf-viewer)
- [react-native-pdf](https://github.com/wonday/react-native-pdf)

## Useful PDF concepts

- **PDF points:** 72 points = 1 inch.
- **Page origin:** bottom-left.
- **MediaBox:** physical page dimensions.
- **CropBox:** visible page region.
- **AcroForm:** PDF form field system.
- **PAdES:** PDF Advanced Electronic Signatures.
- **DSS:** Document Security Store for long-term validation data.
- **RFC3161:** timestamp token standard.
- **ByteRange:** the PDF byte ranges covered by a signature.

## Signing notes

All certificate, CRL, OCSP, timestamp, digest, and signature payloads in the signing API are base64 strings.

Certificates should be base64 DER, not PEM. No headers, no footers, no line wrapping.

## Version notes

`rootCertificate` support on both platforms depends on PoDoFo 0.0.12 or newer.

The library is alpha. Prefer checking the exported TypeScript types and example app when upgrading.
