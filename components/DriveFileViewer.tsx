import React from "react";

// MIME tipovi koje Google Drive može da prikazuje
const previewMimeTypes = [
  "application/pdf",
  "application/vnd.google-apps.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.oasis.opendocument.spreadsheet",
  "application/vnd.google-apps.spreadsheet"
];

type DriveFileViewerProps = {
  fileId: string;
  fileName?: string;
  mimeType?: string;
};

export function DriveFileViewer({ fileId, fileName, mimeType }: DriveFileViewerProps) {
  const canPreview = !mimeType || previewMimeTypes.includes(mimeType);

  const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
  const openUrl = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;

  return (
    <div style={{ width: "100%", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <a href={openUrl} target="_blank" rel="noopener" style={{ textDecoration: "none" }}>
          📖 Otvori u Drive
        </a>
        <a href={downloadUrl} target="_blank" rel="noopener" download={fileName || "fajl"}>
          ⬇️ Preuzmi fajl
        </a>
      </div>
      {canPreview ? (
        <iframe
          src={previewUrl}
          width="100%"
          height={600}
          title={fileName || "File preview"}
          style={{ border: "1px solid #ddd" }}
          allow="autoplay"
        />
      ) : (
        <p>Pregled ovog tipa fajla nije moguć, koristi otvaranje/preuzimanje.</p>
      )}
    </div>
  );
}
