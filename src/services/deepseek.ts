// Please install OpenAI SDK first: `npm install openai`

import OpenAI from "openai";

const openai = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: 'sk-7bd987a3fae7440983b6d6d6e203b08d'
});



export  async function deep(com:string) {
  const completion = await openai.chat.completions.create({
    messages: [
        { role: 'user', content:com },],
    model: "deepseek-reasoner",
  });
  return completion.choices[0].message.content;
}







