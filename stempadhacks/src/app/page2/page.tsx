"use client";

import { useEffect, useState } from "react";

export default function Page2() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [gradeLevel, setGradeLevel] = useState('');
  const [pdfData, setPdfData] = useState<any>(null);

  useEffect(() => {
    const storedFile = localStorage.getItem("pdfFile");
    if (storedFile) {
      const file = dataURLtoFile(storedFile, "uploaded-file.pdf");
      setPdfFile(file);
    }
  }, []);

  useEffect(() => {
    const savedGradeLevel = localStorage.getItem('gradeLevel');
    if (savedGradeLevel) {
      setGradeLevel(savedGradeLevel);
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

  const handleFileUpload = async () => {
    if (pdfFile) {
      const fileReader = new FileReader();
      fileReader.onload = async function () {
        const fileAsBase64 = fileReader.result as string;
  
        // Send the base64 string to the new API route for parsing
        const response = await fetch("/api/parsePdf", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pdfFile: fileAsBase64.split(",")[1] }),  // Send the base64 part only
        });
  
        if (response.ok) {
          const data = await response.json();
          setPdfData(data.content);  // Set the parsed data
        } else {
          console.error("Error parsing PDF");
        }
      };
      fileReader.readAsDataURL(pdfFile);
    }
  };

  useEffect(() => {
    if (pdfFile) {
      handleFileUpload();  // Trigger the API call when a file is uploaded
    }
  }, [pdfFile]);

  return (
    <div>
      <h1>Page 2: PDF Upload</h1>
      {gradeLevel ? (
        <div>
          <p>Grade Level: {gradeLevel}</p>
        </div>
      ) : (
        <p>No file uploaded.</p>
      )}
      {pdfFile ? (
        <div>
          <p>File: {pdfFile.name}</p>
          <embed src={URL.createObjectURL(pdfFile)} width="600" height="400" />
        </div>
      ) : (
        <p>No file uploaded.</p>
      )}

      {pdfData && (
        <div>
          <h2>Parsed PDF Data</h2>
          <pre>{JSON.stringify(pdfData, null, 2)}</pre>  {/* Display parsed JSON */}
        </div>
      )}
    </div>
  );
}