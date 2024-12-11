const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios"); // Required for the image generation API
const FormData = require("form-data");
const fs = require("node:fs");

const app = express();

// Middleware setup
app.use(cors({ origin: 'http://localhost:3000', credentials: true })); // Allow frontend connection
app.use(express.json()); // Parse JSON bodies

// API Keys
const GEMINI_API_KEY = "AIzaSyDLJPpTepnjpRs0Nfre_VfZycnKbHmnlZc";
const HF_API_KEY = "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";

// Validate API Keys
if (!GEMINI_API_KEY || !HF_API_KEY) {
  console.error("API keys are missing. Please configure the GEMINI_API_KEY and HF_API_KEY.");
  process.exit(1);
}

// Gemini Chat API
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body; // Nhận toàn bộ lịch sử hội thoại

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid or missing 'messages' in the request body." });
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Kết hợp toàn bộ nội dung cuộc hội thoại thành một chuỗi
    const context = messages.map((msg) => `${msg.role}: ${msg.content}`).join("\n");

    const result = await model.generateContent(context);

    if (result && result.response && result.response.text) {
      res.status(200).json({ response: result.response.text() });
    } else {
      console.error("Invalid response from Gemini API:", result);
      res.status(500).json({ error: "Invalid response from Gemini API.", details: result });
    }
  } catch (error) {
    console.error("Error connecting to Gemini API:", error.response || error.message || error);
    res.status(500).json({ error: "Failed to connect to Gemini API.", details: error.message });
  }
});

// Image Generation API (Hugging Face API)
app.post("/api/generate-image", async (req, res) => {
  const { prompt, aspectRatio } = req.body;

  if (!prompt || !aspectRatio) {
    return res.status(400).json({ error: "Cả 'prompt' và 'aspectRatio' đều là bắt buộc." });
  }

  try {
    // Define image dimensions based on aspect ratio
    let width, height;
    if (aspectRatio === "square") {
      width = 512;
      height = 512;
    } else if (aspectRatio === "landscape") {
      width = 768;
      height = 512;
    } else if (aspectRatio === "portrait") {
      width = 512;
      height = 768;
    }

    const data = {
      inputs: prompt,
      parameters: { width, height }
    };

    // Send request to Hugging Face API
    console.log("Đang gửi yêu cầu đến API Hugging Face...");
    // Increase timeout to 30 seconds
const response = await axios.post(
  "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-3.5-large",
  data,
  {
    headers: {
      Authorization: `Bearer ${HF_API_KEY}`,
      "Content-Type": "application/json",
    },
    responseType: "arraybuffer", // Receive image as binary
    timeout: 300000, // Increased timeout to 30 seconds
  }
);

    // Convert the response to base64 image
    const base64Image = `data:image/jpeg;base64,${Buffer.from(response.data).toString("base64")}`;
    res.status(200).json({ image_url: base64Image });

  } catch (error) {
    // Handle errors
    console.error("Lỗi khi tạo ảnh:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Không thể tạo ảnh.", details: error.message });
  }
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
