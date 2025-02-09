"use client";

import { useEffect, useState } from "react";

export default function Page2() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [gradeLevel, setGradeLevel] = useState('');
  const [pdfData, setPdfData] = useState<string>(''); 
  const [jsonData, setJsonData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string>('');

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
      setLoading(true);
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
          setJsonData(data); 
          const parsedData = extractText(data);
          setPdfData(parsedData); 

          await generateSummary(parsedData); 
        } else {
          console.error("Error parsing PDF");
        }
        setLoading(false); 
      };
      fileReader.readAsDataURL(pdfFile);
    }
  };

  const extractText = (jsonData: { content?: { Pages?: Array<{ Texts: Array<{ R: Array<{ T: string }> }> }> } }) => {
    const textArray: string[] = [];
  
    if (jsonData?.content?.Pages && Array.isArray(jsonData.content.Pages)) {
      jsonData.content.Pages.forEach((page, pageIndex) => {
        if (page?.Texts && Array.isArray(page.Texts)) {
          page.Texts.forEach((textObj, textIndex) => {
            if (textObj?.R && Array.isArray(textObj.R)) {
              textObj.R.forEach((rObj, rIndex) => {
                if (rObj?.T) {
                  textArray.push(decodeURIComponent(rObj.T));
                }
              });
            }
          });
        }
      });
    } else {
      console.error('No Pages or incorrect structure in jsonData:', jsonData);
    }
  
    return textArray.join(' '); 
  };

  // This is the function that calls the backend to generate the summary
  const generateSummary = async (text: string) => {
    if (!text || !gradeLevel) {
      console.error('Missing text or gradeLevel');
      return;
    }

    setLoading(true);
    console.log("Sending to API:", { text, gradeLevel });

    const response = await fetch("/api/summary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, gradeLevel }),
    });

    if (response.ok) {
      const data = await response.json();
      setSummary(data.summary);
    } else {
      console.error("Error generating summary");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (pdfFile) {
      handleFileUpload();
    }
  }, [pdfFile]);

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

      {loading && <p>Loading...</p>}
      
      {pdfData && (
        <div>
          <h2>Parsed PDF Data</h2>
          <pre>{pdfData}</pre>
        </div>
      )}

      {summary && (
        <div>
          <h2>Summary</h2>
          <pre>{summary}</pre>
        </div>
      )}
    </div>
  );
}