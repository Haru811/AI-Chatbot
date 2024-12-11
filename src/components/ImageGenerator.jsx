import React, { useState } from "react";

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("square");
  const [imageUrl, setImageUrl] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleGenerateImage = async () => {
    try {
      console.log('Prompt:', prompt);
      console.log('Aspect Ratio:', aspectRatio);

      const response = await fetch("http://localhost:5000/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          aspectRatio: aspectRatio,
        }),
      });

      const data = await response.json();
      console.log('Response:', data);

      if (data.error) {
        setErrorMessage(data.error);  // Display error message from backend
      } else {
        setImageUrl(data.image_url); // Set the base64 image URL
        setErrorMessage("");
      }
    } catch (error) {
      setErrorMessage("Đã xảy ra lỗi khi tạo ảnh. Vui lòng thử lại sau.");
      console.error(error);
    }
  };

  return (
    <div className="bg-purple-100 p-6 rounded-lg shadow-md mt-8">
      <h2 className="text-2xl font-semibold mb-6">Image Generator</h2>

      <input
        type="text"
        placeholder="Enter description..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      <select
        value={aspectRatio}
        onChange={(e) => setAspectRatio(e.target.value)}
        className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <option value="square">Square (1:1)</option>
        <option value="landscape">Landscape (16:9)</option>
        <option value="portrait">Portrait (9:16)</option>
      </select>

      <button
        onClick={handleGenerateImage}
        className="w-full p-3 bg-green-500 text-white rounded-lg focus:outline-none hover:bg-green-600"
      >
        Generate Image
      </button>

      {errorMessage && (
        <div className="mt-4 text-red-500">{errorMessage}</div>
      )}

      {imageUrl && (
        <div className="mt-6 bg-purple-50 p-4 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Generated Image:</h3>
          <img src={imageUrl} alt="Generated" className="w-full h-auto rounded-lg" />
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;
