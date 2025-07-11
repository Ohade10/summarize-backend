const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// 🩺 Health check
app.get("/ping", (req, res) => {
  res.send("pong");
});

app.post("/summarize", async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "No text provided." });
  }

  try {
    // Debug: confirm API key is loaded
    console.log("Using API key:", process.env.OPENAI_API_KEY ? "✅ loaded" : "❌ missing");

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo", // safer default
        messages: [
          { role: "system", content: "Summarize the following email into a short, clear overview." },
          { role: "user", content: text }
        ],
        temperature: 0.5,
        max_tokens: 300
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const summary = response.data.choices[0].message.content.trim();
    res.json({ summary });

  } catch (error) {
    console.error("OpenAI API error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to summarize." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
