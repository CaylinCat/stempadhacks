import { NextResponse } from 'next/server';
import PDFParser from 'pdf2json';
import { Buffer } from 'buffer';  // Import Buffer from the buffer package

export async function POST(request: Request) {
  try {
    const { pdfFile } = await request.json();

    if (!pdfFile) {
      return NextResponse.json({ error: "No PDF file provided" }, { status: 400 });
    }

    const pdfParser = new PDFParser();

    return new Promise<NextResponse>((resolve, reject) => {
      pdfParser.on("pdfParser_dataError", (errData) => {
        console.error("PDF parsing error:", errData.parserError);
        reject(new Error("PDF parsing failed"));
      });

      pdfParser.on("pdfParser_dataReady", (pdfData) => {
        const jsonData = { content: pdfData };
        resolve(NextResponse.json(jsonData));
      });

      // Convert base64 string to Buffer
      const buffer = Buffer.from(pdfFile, "base64");
      pdfParser.parseBuffer(buffer);
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}