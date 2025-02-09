"use client";

import { useEffect, useState } from "react";
import { pdfToText } from "pdf-ts";

export default function Page2() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [gradeLevel, setGradeLevel] = useState('');
  const [pdfText, setPdfText] = useState<string>("");

  useEffect(() => {
    const storedFile = localStorage.getItem("pdfFile");
    if (storedFile) {
      const file = dataURLtoFile(storedFile, "uploaded-file.pdf");
      setPdfFile(file);
      extractPdfText(file);  // Extract the text when the file is set
    }
  }, []);

  useEffect(() => {
    // Retrieve grade level from localStorage
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

  // Function to convert file to Uint8Array and extract text
  const extractPdfText = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer(); // Read the file as an ArrayBuffer
      const uint8Array = new Uint8Array(arrayBuffer); // Convert ArrayBuffer to Uint8Array
      const text = await pdfToText(uint8Array); // Pass the Uint8Array to pdfToText
      setPdfText(text); // Set the extracted text in state
      console.log(text);
      console.log("hello");
    } catch (error) {
      console.error("Error extracting text from PDF", error);
    }
  };

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
          <div>
            <h3>Extracted Text from PDF:</h3>
            <pre>{pdfText}</pre> {/* Display the extracted text */}
          </div>
        </div>
      ) : (
        <p>No file uploaded.</p>
      )}
    </div>
  );
}