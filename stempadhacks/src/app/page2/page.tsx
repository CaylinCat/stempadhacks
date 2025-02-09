"use client";

import { useEffect, useState } from "react";

export default function Page2() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  useEffect(() => {
    const storedFile = localStorage.getItem("pdfFile");
    if (storedFile) {
      const file = dataURLtoFile(storedFile, "uploaded-file.pdf");
      setPdfFile(file);
    }
  }, []);

  const dataURLtoFile = (dataurl: string, filename: string) => {
    const arr = dataurl.split(",");
    
    if (arr.length !== 2) {
      throw new Error("Invalid data URL");
    }
  
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
      throw new Error("Invalid MIME type");
    }
  
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
  
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
  
    return new File([u8arr], filename, { type: mime });
  };

  return (
    <div>
      <h1>Page 2: PDF Upload</h1>
      {pdfFile ? (
        <div>
          <p>File: {pdfFile.name}</p>
          <embed src={URL.createObjectURL(pdfFile)} width="600" height="400" />
        </div>
      ) : (
        <p>No file uploaded.</p>
      )}
    </div>
  );
}
