import Tesseract from "tesseract.js";

export async function extractTextFromImage(imageUrl) {
  try {
    const { data } = await Tesseract.recognize(imageUrl, "eng", {
      logger: (m) => console.log(m),
    });

    return { status: "success", text: data.text };
  } catch (error) {
    console.error("OCR Error:", error);
    return { status: "error", text: null };
  }
}
