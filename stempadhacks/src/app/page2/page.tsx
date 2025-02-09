"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from 'react-markdown'; // Import the react-markdown library

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
      jsonData.content.Pages.forEach((page) => {
        if (page?.Texts && Array.isArray(page.Texts)) {
          page.Texts.forEach((textObj) => {
            if (textObj?.R && Array.isArray(textObj.R)) {
              textObj.R.forEach((rObj) => {
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
    <div className="items-center justify-items-center min-h-screen bg-gray-50 p-8 font-[family-name:var(--font-geist-sans)]">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-6">
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">PDF Upload and Summary</h1>

        <div className="mb-4">
          {gradeLevel && (
            <div className="text-sm font-medium text-gray-600 font-[family-name:var(--font-geist-mono)]">
              <strong>Grade Level:</strong> {gradeLevel}
            </div>
          )}
        </div>

        {pdfFile ? (
          <div className="mb-6">
            <p className="text-sm text-gray-700 font-[family-name:var(--font-geist-mono)]">File: {pdfFile.name}</p>
            <embed 
              src={URL.createObjectURL(pdfFile)} 
              width="100%" 
              height="400" 
              className="mt-4 rounded-md shadow-md"
            />
          </div>
        ) : (
          <div className="mb-6 text-sm text-gray-600">No file uploaded.</div>
        )}

        {loading && <div className="text-center text-sm text-gray-600">Loading...</div>}

        {summary && (
          <div className="mt-6 bg-gray-100 p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Summary</h2>
            <ReactMarkdown className="text-sm text-gray-700 whitespace-pre-wrap">{summary}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}