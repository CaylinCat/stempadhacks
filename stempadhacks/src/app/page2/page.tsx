"use client";

import { useEffect, useState } from "react";
import { getDocument } from "pdfjs-dist"; // Import the getDocument function directly
import { GlobalWorkerOptions } from "pdfjs-dist"; // Import GlobalWorkerOptions

export default function Page2() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfText, setPdfText] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    // Set the worker source for PDF.js
    GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js`;

    const storedFile = localStorage.getItem("pdfFile");
    if (storedFile) {
      const file = dataURLtoFile(storedFile, "uploaded-file.pdf");
      setPdfFile(file);
      extractTextFromPDF(file); // Extract text when file is set
    }
  }, []);

  const dataURLtoFile = (dataurl: string, filename: string): File => {
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

  const extractTextFromPDF = (file: File): void => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const typedArray = new Uint8Array(e.target!.result as ArrayBuffer);
      const pdf = await getDocument(typedArray).promise; // Use getDocument here

      let fullText = "";
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const textItems = (textContent.items as any[]).map((item) => item.str); // Cast to any[] if necessary
        fullText += textItems.join(" ");
      }

      setPdfText(fullText); // Store the extracted text
      generateNotes(fullText); // Generate notes after extracting text
    };
    reader.readAsArrayBuffer(file);
  };

  const generateNotes = async (text: string): Promise<void> => {
    // Send the extracted text to ChatGPT API to generate notes (adjust prompt as needed)
    const response = await fetch("/api/chatgpt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (response.ok) {
      const result = await response.json();
      setNotes(result.notes);
    } else {
      setNotes("Error generating notes.");
    }
  };

  return (
    <div>
      <h1>Page 2: PDF Upload</h1>
      {pdfFile ? (
        <div>
          <p>File: {pdfFile.name}</p>
          <embed src={URL.createObjectURL(pdfFile)} width="600" height="400" />
          <h2>Extracted Content</h2>
          <p>{pdfText.slice(0, 500)}...</p> {/* Show first 500 characters of the extracted text */}
          <h2>Generated Notes</h2>
          <p>{notes || "Waiting for notes..."}</p>
        </div>
      ) : (
        <p>No file uploaded.</p>
      )}
    </div>
  );
}
