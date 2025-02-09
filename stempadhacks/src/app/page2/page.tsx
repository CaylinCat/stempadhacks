"use client";

import { useEffect, useState } from "react";

export default function Page2() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [gradeLevel, setGradeLevel] = useState('');
  const [pdfData, setPdfData] = useState<string>('');  // Store parsed text
  const [jsonData, setJsonData] = useState<any>(null);  // Store raw JSON data
  const [loading, setLoading] = useState(false);  // Track loading state

  useEffect(() => {
    // Check localStorage for existing file and grade level
    const storedFile = localStorage.getItem("pdfFile");
    if (storedFile) {
      const file = dataURLtoFile(storedFile, "uploaded-file.pdf");
      setPdfFile(file);
    }

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
      setLoading(true);  // Set loading state to true
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
          setJsonData(data); // Save raw JSON data from the API
          const parsedData = extractText(data); // Parse the text from the JSON data
          setPdfData(parsedData);  // Set the parsed data for display
        } else {
          console.error("Error parsing PDF");
        }
        setLoading(false);  // Set loading state to false after the fetch is complete
      };
      fileReader.readAsDataURL(pdfFile);
    }
  };

  // Define the structure of the Text and Page
  type TextObject = {
    A?: string;
    R: Array<{ T: string; S: number; TS: number[] }>;
    clr?: number;
    sw?: number;
    w?: number;
    x?: number;
    y?: number;
  };
  
  type Page = {
    Boxsets: any[];
    Fields: any[];
    Fills: any[];
    HLines: any[];
    Height: number;
    Texts: TextObject[];
  };

  const extractText = (jsonData: { content?: { Pages?: Array<{ Texts: Array<{ R: Array<{ T: string }> }> }> } }) => {
    const textArray: string[] = [];
  
    // Check if content and Pages exist and are in the correct format
    if (jsonData?.content?.Pages && Array.isArray(jsonData.content.Pages)) {
      jsonData.content.Pages.forEach((page, pageIndex) => {
        if (page?.Texts && Array.isArray(page.Texts)) {
          page.Texts.forEach((textObj, textIndex) => {
            if (textObj?.R && Array.isArray(textObj.R)) {
              textObj.R.forEach((rObj, rIndex) => {
                if (rObj?.T) {
                  textArray.push(decodeURIComponent(rObj.T)); // Decode the URL-encoded string
                }
              });
            }
          });
        }
      });
    } else {
      console.error('No Pages or incorrect structure in jsonData:', jsonData);
    }
  
    return textArray.join(' ');  // Join all text parts into one string
  };  

  useEffect(() => {
    if (pdfFile) {
      handleFileUpload();  // Trigger the API call when a file is uploaded
    }
  }, [pdfFile]);  // Trigger whenever pdfFile changes

  return (
    <div>
      <h1>Page 2: PDF Upload</h1>
      {gradeLevel && (
        <div>
          <p>Grade Level: {gradeLevel}</p>
        </div>
      )}

      {pdfFile ? (
        <div>
          <p>File: {pdfFile.name}</p>
          <embed src={URL.createObjectURL(pdfFile)} width="600" height="400" />
        </div>
      ) : (
        <p>No file uploaded.</p>
      )}

      {loading && <p>Loading...</p>}  {/* Show loading state */}
      
      {pdfData && (
        <div>
          <h2>Parsed PDF Data</h2>
          <pre>{pdfData}</pre>  {/* Display parsed text content */}
        </div>
      )}

      {jsonData && (
        <div>
          <h2>Raw PDF Data</h2>
          <pre>{JSON.stringify(jsonData, null, 2)}</pre>  {/* Display raw JSON data */}
        </div>
      )}
    </div>
  );
}
