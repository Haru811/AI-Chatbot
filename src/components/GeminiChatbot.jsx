import React, { useState } from "react";
import axios from "axios";

const GeminiChatbot = () => {
  const [input, setInput] = useState(""); 
  const [chatHistory, setChatHistory] = useState([]); 
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { role: "user", content: input };

    setChatHistory([...chatHistory, newMessage]); // Cập nhật lịch sử hội thoại
    setInput(""); // Xóa input sau khi gửi
    setLoading(true); 

    try {
      const response = await axios.post("http://localhost:5000/api/chat", {
        messages: [...chatHistory, newMessage], // Gửi toàn bộ lịch sử hội thoại
      });

      const botMessage = {
        role: "bot",
        content: response.data.response || "No response from API",
      };

      setChatHistory([...chatHistory, newMessage, botMessage]); // Thêm phản hồi từ chatbot
    } catch (error) {
      console.error("Error calling the API:", error);
      setChatHistory([ 
        ...chatHistory,
        { role: "bot", content: "An error occurred. Please try again later." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-purple-100 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Gemini Chatbot</h2>
      <div className="mb-4">
        {/* Hiển thị lịch sử hội thoại */}
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {chatHistory.map((message, index) => (
            <div
              key={index}
              className={`p-2 rounded ${message.role === "user" ? "bg-blue-100 text-right" : "bg-gray-200 text-left"}`}
            >
              <p>{message.content}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="text"
          className="flex-grow p-2 border rounded"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button
          onClick={handleSendMessage}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default GeminiChatbot;
