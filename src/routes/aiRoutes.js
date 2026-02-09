import express from 'express';
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY || "");

router.post('/advice', async (req, res) => {
  const { transactions, currentBalance } = req.body;
  
  const prompt = `
    Analyze the following list of transactions and provide professional financial advice. 
    Current total balance is Rs. ${currentBalance}.
    
    Transactions:
    ${transactions.map(t => `${t.date}: ${t.type === 'income' ? '+' : '-'}Rs. ${t.amount} (${t.category} - ${t.description})`).join('\n')}
    
    Provide your response as a JSON object with:
    1. "summary": A textual summary of spending.
    2. "tips": An array of 3 strings containing actionable tips.
    3. "predictedBalance": A number representing the end-of-month prediction.
    4. "topCategories": An array of objects with { category: string, percentage: number }.
  `;

  try {
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Attempt to parse JSON from the response text
    // (Gemini sometimes wraps JSON in markdown blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : text;
    
    res.json(JSON.parse(jsonStr));
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "Failed to generate advice" });
  }
});

router.post('/invoice-email', async (req, res) => {
  const { invoice } = req.body;
  const itemsList = invoice.items?.map(i => `- ${i.description}: ${i.quantity} x Rs. ${i.price}`).join('\n');
  
  const prompt = `
    Draft a professional, friendly, and concise email for an invoice.
    
    Customer: ${invoice.customerName}
    Total Amount: Rs. ${invoice.total}
    Due Date: ${invoice.dueDate}
    Items:
    ${itemsList}
    
    The email should be professional but modern. Include a subject line.
    Return only the email body text.
  `;

  try {
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ email: response.text() });
  } catch (error) {
    console.error("Email Draft Error:", error);
    res.status(500).json({ error: "Failed to generate email draft" });
  }
});

export default router;
