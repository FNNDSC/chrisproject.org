# DICOM De-Identification

DICOM anonymization (a type of de-identification) is the commonest workflow in
_ChRIS_. This page describes the DICOM anonymization pipeline.

## Background

The [DICOM file format](https://nipy.org/nibabel/dicom/dicom_intro.html) is
the international standard for how medical images are produced, transmitted,
and stored. Hence, de-identification of DICOM data is the first step of any
imaging research analysis.

Protected health information (PHI) can be found in DICOM files in three forms:

- **Metadata** as DICOM tags, e.g. PatientName, PatientSex, PatientBirthDate, etc.
- **Burned text**, where PHI appears as text in the image (the PixelData).
- **Identifiable anatomy** e.g. the face which is present on head MRI scans.

Currently, metadata anonymization and burned text removal are available as _ChRIS_ pipelines.

### DICOM Tag Anonymization

PHI found in DICOM tags can be anonymized by deleting those tags. This can be done:

- Manually
- Automatically, using an "allow-list" (i.e. remove all tags except for a few)
- Automatically, using a "deny-list" (i.e. keep all tags except for a few)

:::tip

Generally, "allow-list" approaches are considered safer. The risk of accidental
PHI leakage is lower using an "allow-list" policy because it is stricter.

:::

## DICOM De-Identification in _ChRIS_

The following _ChRIS_ plugins are available:

| Plugin Name | Description |
|-------------|-------------|
| [pl-dicomize](https://github.com/FNNDSC/pl-dicomize) | Among its multiple purposes, does DICOM anonymization by removing _all_ DICOM tags except for the image data. |
| [pl-dicom_headerEdit](https://github.com/FNNDSC/pl-dicom_headerEdit) | Edits specified DICOM tags. This is a "deny-list" approach. |
| [pl-dcm_textlocr](https://github.com/FNNDSC/pl-dcm_txtlocr) | Detects burned text PHI using optical-character recognition (OCR). |
| [pl-image_textRemove](https://github.com/FNNDSC/pl-image_textRemove) | Detects and removes burned-in text from images using OCR. |

These plugins are the building blocks of our DICOM de-identification pipelines.
We have many pipelines tailored for specific workflows (e.g. ultrasound
anonymization, anon &rarr; analyze &rarr; upload, ...),
please <a href="mailto:fnndsc_atlas-dl@childrens.harvard.edu">contact us</a>
for more information.

