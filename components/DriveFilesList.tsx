import React, { useEffect, useState } from "react";
import { DriveFileViewer } from "./DriveFileViewer";

type DriveFile = {
  fileId: string;
  fileName?: string;
  mimeType?: string;
};

export function DriveFilesList() {
  const [files, setFiles] = useState<DriveFile[]>([]);

  useEffect(() => {
    // Prilagodi putanju ako koristiš public folder, npr: "/gdrive-files.json"
    fetch("/data/gdrive-files.json")
      .then((r) => r.json())
      .then(setFiles)
      .catch(() => setFiles([]));
  }, []);

  if (files.length === 0) {
    return <div>Nema fajlova za prikaz.</div>;
  }

  return (
    <div>
      <h2>Google Drive fajlovi</h2>
      {files.map((f) => (
        <div key={f.fileId} style={{ marginBottom: 40 }}>
          <DriveFileViewer
            fileId={f.fileId}
            fileName={f.fileName}
            mimeType={f.mimeType}
          />
        </div>
      ))}
    </div>
  );
}
