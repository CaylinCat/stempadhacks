"use client";

import { useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

export default function Page2() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfText, setPdfText] = useState<string>("");

  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js";
    
    const storedFile = localStorage.getItem("pdfFile");
    if (storedFile) {
      const file = dataURLtoFile(storedFile, "uploaded-file.pdf");
      setPdfFile(file);
      extractTextFromPDF(file);
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

  const extractTextFromPDF = (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      try {
        const pdfDoc = await pdfjsLib.getDocument(arrayBuffer).promise;
        const numPages = pdfDoc.numPages;
        const textPromises = [];

        for (let i = 1; i <= numPages; i++) {
          textPromises.push(
            pdfDoc.getPage(i).then((page) => {
              return page.getTextContent().then((textContent) => {
                return textContent.items.map((item: any) => item.str).join(" ");
              });
            })
          );
        }

        const textArray = await Promise.all(textPromises);
        setPdfText(textArray.join("\n"));
      } catch (error) {
        console.error("Error extracting text from PDF:", error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const generateNotes = async (text: string) => {
    const response = await fetch("/api/chatgpt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();
    return data.notes;
  };

  return (
    <div>
      <h1>Page 2: PDF Upload</h1>
      {pdfFile ? (
        <div>
          <p>File: {pdfFile.name}</p>
          <embed src={URL.createObjectURL(pdfFile)} width="600" height="400" />
          <div>
            <h2>Extracted Text</h2>
            <pre>{pdfText}</pre>
          </div>
          <div>
            <h2>Generated Notes</h2>
            <button onClick={() => generateNotes(pdfText)}>Generate Notes</button>
          </div>
        </div>
      ) : (
        <p>No file uploaded.</p>
      )}
    </div>
  );
}
