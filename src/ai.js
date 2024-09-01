import 'dotenv/config';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateComponent(prompt) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a React component generator. Output only the component code without any explanation or markdown formatting." },
      { role: "user", content: `Create a React component based on this description: ${prompt}. The component should be named exactly as specified in the prompt.` }
    ],
    max_tokens: 500,
    temperature: 0.7,
  });

  return response.choices[0].message.content.trim();
}

export async function iterateComponent(existingCode, iterationPrompt) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a React component modifier. Output only the updated component code without any explanation or markdown formatting." },
      { role: "user", content: `Existing component code:\n${existingCode}\n\nModify this React component based on the following instruction: ${iterationPrompt}. Return the entire updated component code.` }
    ],
    max_tokens: 500,
    temperature: 0.7,
  });

  return response.choices[0].message.content.trim();
}