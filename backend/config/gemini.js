const { GoogleGenerativeAI } = require('@google/generative-ai');

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_key_here') {
    return null;
  }
  return new GoogleGenerativeAI(apiKey.trim());
};

const getGenerativeModel = (modelName = 'gemini-flash-latest', options = {}) => {
  const client = getGeminiClient();
  if (!client) return null;
  return client.getGenerativeModel({ model: modelName, ...options });
};

module.exports = { getGeminiClient, getGenerativeModel };
