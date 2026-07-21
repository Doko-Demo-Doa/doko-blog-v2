---
title: Forms, Annotations, and Metadata
description: Work with AcroForm fields, annotations, and document metadata.
---

## Metadata

```ts
const doc = await PdfDocument.open('/path/to/document.pdf');

console.log(doc.getTitle());
console.log(doc.getAuthor());
console.log(doc.getSubject());
console.log(doc.getCreator());
```

Update metadata:

```ts
doc.setTitle('Quarterly Report');
doc.setAuthor('Doko Demo Doa');
doc.setSubject('Numbers, but polite');
doc.setCreator('My React Native app');

await doc.save('/path/to/updated.pdf');
```

Pass `undefined` to clear a value.

## Form fields

The document exposes AcroForm fields through `fieldCount` and `getFieldAt`:

```ts
for (let index = 0; index < doc.fieldCount; index++) {
  const field = doc.getFieldAt(index);
  console.log(field.fullName, field.fieldType);
}
```

Supported field types are reported as:

```ts
type PdfFieldType =
  | 'Unknown'
  | 'PushButton'
  | 'CheckBox'
  | 'RadioButton'
  | 'TextBox'
  | 'ComboBox'
  | 'ListBox'
  | 'Signature';
```

Only text boxes, checkboxes/radio buttons, and signature inspection/verification have bound behavior today.

## Text boxes

Create and set a text box:

```ts
const field = doc.createTextBox('customer.name');
field.setText('Ada Lovelace');
```

Read existing text boxes:

```ts
if (field.fieldType === 'TextBox') {
  console.log(field.getText());
}
```

`getText()` and `setText()` throw if called on a non-text field.

## Checkboxes and radio buttons

```ts
const checkbox = doc.createCheckBox('acceptedTerms');
checkbox.setChecked(true);
```

For existing fields:

```ts
if (field.fieldType === 'CheckBox' || field.fieldType === 'RadioButton') {
  console.log(field.isChecked());
}
```

`isChecked()` and `setChecked()` throw if called on the wrong field type.

## Signature fields

Signature fields can be inspected and cryptographically checked against the PDF bytes. See [Signature Verification](./signature-verification.md).

The library does not currently create interactive signature fields as a general form-editing operation. PAdES signing creates the signature field it needs internally.

## Annotations

Pages expose annotation count and base annotation access:

```ts
const page = doc.getPage(0);

for (let index = 0; index < page.getAnnotationCount(); index++) {
  const annotation = page.getAnnotationAt(index);
  console.log(annotation.annotationType, annotation.getContents());
}
```

Create an annotation:

```ts
const note = page.createAnnotation('FreeText', 50, 650, 200, 80);
note.setContents('Please review this section.');
```

Move or resize it:

```ts
note.setRect(60, 640, 220, 90);
```

Read the rectangle:

```ts
const rect = note.getRect();
```

## Annotation types

The type union mirrors PoDoFo's annotation names, including common types such as `Text`, `Link`, `FreeText`, `Line`, `Square`, `Circle`, `Highlight`, `Underline`, `StrikeOut`, `Stamp`, `Ink`, `Widget`, and more.

Only the base API is bound today: type, rectangle, and contents. Type-specific behavior like link destinations or line endpoints is not exposed yet.
