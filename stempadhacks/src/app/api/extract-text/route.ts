import { NextResponse } from "next/server";
import { fromPath } from "pdf2pic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob;

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer()); // Convert Blob to Buffer

    // Use pdf2pic to convert the PDF to images
    const pdf2picInstance = fromPath(buffer, {
      density: 100, // Image density
      saveFilename: "page",
      savePath: "./tmp", // Temporary path to save images
      format: "png", // Format of images
    });

    const numberOfPages = 5; // Or dynamically detect from the PDF
    const images = [];

    // Convert each page to an image
    for (let i = 0; i < numberOfPages; i++) {
      const image = await pdf2picInstance.convert(i);
      images.push(image.base64); // Store base64 images
    }

    return NextResponse.json({ images }, { status: 200 });
  } catch (error) {
    console.error("Error converting PDF to images:", error);
    return NextResponse.json({ message: "Error converting PDF" }, { status: 500 });
  }
}