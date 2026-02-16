import Tesseract from "tesseract.js";

export async function extractTextFromImage(imageUrl) {
  try {
    const { data } = await Tesseract.recognize(imageUrl, "eng", {
      logger: () => {},
    });

    return { status: "success", text: data.text };
  } catch (error) {
    alert("OCR failed. Unable to extract text from image.");
    return { status: "error", text: null };
  }
}
