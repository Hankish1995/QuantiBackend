const OpenAI = require('openai');
const openAIModel = require('../models/openAI')
require('dotenv').config();



const openai = new OpenAI({
    apiKey: process.env.CHATGPT_KEY,
});


async function createAssistant(fileId) {
  try{
    console.log("creating the new assisatant")
    const assistant = await openai.beta.assistants.create({
        name: "Quanti",
        description: "Assists with quantity surveying by analyzing drawings, calculating materials and costs in a casual tone.",
        instructions: "Quanti is designed to assist with quantity surveying. It reads and analyzes architectural drawings to calculate the volume and area of various elements. Once these calculations are made, it refers to an uploaded pricing spreadsheet to determine the cost of the project. Quanti provides accurate, clear, and detailed responses based on the data provided. It emphasizes precision and clarity in its calculations and avoids any assumptions without data. Quanti communicates in a casual tone, making it approachable and easy to understand for tradesmen. When a house plan is uploaded, Quanti the total quote based on rates from an uploaded spreadsheet",
        model: "gpt-4o",
        tools: [{ "type": "file_search" }],
    });
   
    return assistant;
  }catch(error){
    console.log('Error::',error)
   
  }
}




module.exports = createAssistant
