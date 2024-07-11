let mongoose = require('mongoose') 

let openAISchema = new mongoose.Schema({
    assistantId :{type:String,default:null}
},{timestamps:true})

let openAIModel = mongoose.model('OpenAI',openAISchema,"OpenAI")
module.exports = openAIModel