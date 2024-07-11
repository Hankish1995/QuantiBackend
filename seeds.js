const mongoose = require('mongoose');
const openAIModel = require('./src/models/openAI'); 
require('dotenv').config()



const seedOpenAI = async () => {
  try {
   
    await mongoose.connect(process.env.DB_URL)

   
    const existingAssistant = await openAIModel.findOne();
    if (existingAssistant) {
      console.log('Assistant ID already exists:', existingAssistant.assistantId);
    } else {
      
      const newAssistant = new openAIModel({
        assistantId: null, 
      });

 
      await newAssistant.save();
      console.log('New Assistant ID document created:', newAssistant);
    }

    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding OpenAI data:', error);
    mongoose.connection.close();
  }
};


seedOpenAI();
