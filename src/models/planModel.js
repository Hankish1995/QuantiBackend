let mongoose = require('mongoose')

let planSchema = new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, default: null },
    planName: { type: String, default: null },
    planAddress: { type: String, default: null },
    imageUrl: { type: String, default: null },
    status: { type: String,enum:['active','inactive'], default: 'active' },
    sessionId: { type: String, default: null },
    threadId:{type:String,default:null},
    chat: [{
        sender: { type: String, enum: ['user', 'ai'], required: true },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
    }]

}, { timestamps: true })

let planModel = mongoose.model("plan",planSchema)
module.exports = planModel
