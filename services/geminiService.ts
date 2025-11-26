import { GoogleGenAI } from "@google/genai";
import { AIGeneratedStrategy } from "../types";

// 初始化 Gemini 客户端
// 注意：在实际生产中，API Key 应该通过后端代理调用，而不是直接暴露在前端
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateStrategyWithAI = async (prompt: string): Promise<AIGeneratedStrategy> => {
  try {
    const fullPrompt = `
      你是一个专业的量化交易策略编写助手。请根据用户的需求编写一个基于 Python 的币安 (Binance) 量化交易策略脚本。
      
      用户需求: "${prompt}"
      
      请严格按照 JSON 格式返回，包含以下字段：
      1. "name": 策略名称 (简短中文)
      2. "description": 策略描述 (中文)
      3. "code": 完整的 Python 代码 (包含必要的 import, class 或 function 定义)

      Python 代码假设已经安装了 ccxt 或 binance-connector 库。代码应当结构清晰，包含中文注释。
      不要使用 Markdown 格式包裹 JSON，只返回纯 JSON 字符串。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("生成失败，未收到响应内容。");
    }

    const data = JSON.parse(text);
    return data as AIGeneratedStrategy;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("AI 策略生成失败，请检查 API Key 或网络连接。");
  }
};
