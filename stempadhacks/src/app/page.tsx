"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      if (file && file.type === "application/pdf") {
        setPdfFile(file);
      } else {
        alert("Please upload a PDF file.");
      }
    }
  };

  const handleSubmit = () => {
    if (pdfFile) {
      // Convert file to a data URL and store it
      const reader = new FileReader();
      reader.onloadend = () => {
        localStorage.setItem("pdfFile", reader.result as string);
      };
      reader.readAsDataURL(pdfFile);
    }
    localStorage.setItem('gradeLevel', selectedOption);
  };

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/researchforkids.png"
          alt="Research for kids logo"
          width={360}
          height={76}
          priority
        />
        <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2">
            Upload a pdf file of any research article.
          </li>
          <li className="mb-2">Select grade level.</li>
          <li>Submit!</li>
        </ol>

        {/* Select Reader Category (with selectable options) */}
    <div className="mt-2 sm:mt-4">
          <h3 className="text-lg font-semibold mb-4">Select Grade Level</h3>
          <div className="flex gap-4">
            <div
              onClick={() => handleOptionSelect("baby")}
              className={`cursor-pointer rounded-lg px-5 py-2 text-center text-sm transition-colors font-[family-name:var(--font-geist-mono)] ${
                selectedOption === "baby"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Preschool and Below
            </div>
            <div
              onClick={() => handleOptionSelect("1st to 3rd")}
              className={`cursor-pointer rounded-lg px-5 py-2 text-center text-sm transition-colors font-[family-name:var(--font-geist-mono)] ${
                selectedOption === "1st to 3rd"
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              1st-3rd Grade
            </div>
            <div
              onClick={() => handleOptionSelect("4th to 6th")}
              className={`cursor-pointer rounded-lg px-5 py-2 text-center text-sm transition-colors font-[family-name:var(--font-geist-mono)] ${
                selectedOption === "4th to 6th"
                  ? "bg-red-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              4th-6th Grade
            </div>
          </div>
          <div className="flex gap-4 mt-2">
            <div
                onClick={() => handleOptionSelect("middle school")}
                className={`cursor-pointer rounded-lg px-5 py-2 text-center text-sm transition-colors font-[family-name:var(--font-geist-mono)] ${
                  selectedOption === "middle school"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                Middle School
              </div>
              <div
              onClick={() => handleOptionSelect("high school")}
              className={`cursor-pointer rounded-lg px-5 py-2 text-center text-sm transition-colors font-[family-name:var(--font-geist-mono)] ${
                selectedOption === "high school"
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              High School
            </div>
          </div>
        </div>

        {/* PDF Upload Section */}
        <div className="mt-2">
          <label htmlFor="pdf-upload" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Upload a PDF
          </label>
          <input
            id="pdf-upload"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="mt-2 p-2 border rounded-md text-sm"
          />
          {pdfFile && (
            <div className="mt-4 text-sm text-green-600">
              <p>Selected File: {pdfFile.name}</p>
            </div>
          )}
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
      <Link
        className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
        href="/page2" // Link to the page2.tsx
        onClick={handleSubmit}
      >
        <Image
          className="dark:invert"
          src="/vercel.svg"
          alt="Vercel logomark"
          width={20}
          height={20}
        />
        Submit now
      </Link>
    </div>
      </main>

      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://www.youtube.com/watch?v=yDuXWIp3hE8"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          What is Research?
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://www.jstor.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          JSTOR
        </a>
      </footer>
    </div>
  );
}