let mongoose = require('mongoose')
let planModel = require("../models/planModel")
const OpenAI = require('openai');
const fs = require('fs')
const path = require('path')
require('dotenv').config();
let AWS = require('../utils/awsUpload')
const { PDFDocument } = require('pdf-lib');
const { fromPath } = require('pdf2pic'); 
let openAIModel = require('../models/openAI')
let createAssistant  = require('../utils/OpenAI')




const openai = new OpenAI({
    apiKey: process.env.CHATGPT_KEY,
});



// exports.addPlans = async (req, res) => {
//     try {

//         let userId = req.result.id;
//         let { planName, planAddress } = req.body;
//         let planImage = '';

//              if(req.files===null){return res.status(400).json({message:"Please add Image",type:'error'}) }

//              let img = req.files.planImage

//              if (img.mimetype === "image/jpeg" || img.mimetype === "image/png" || img.mimetype === "image/jpg" ) {
//              const planImagePath = `planImage/${userId}`;
//              const contentType = img.mimetype;
//              const url = await AWS.uploadS3(img, planImagePath, contentType);
//              planImage = url;
//              } else {
//              return res.status(400).json({ message: "This file format not allowed. You can only add images having extensions :jpeg,png,jpg ." })
//              }

//         const file = await openai.files.create({
//             file: fs.createReadStream(path.join(__dirname, '../public/csv', 'pricing.xlsx')),
//             purpose: "assistants",
//         });

//         const assistant = await openai.beta.assistants.create({
//             name: "Quanti",
//             description: "Assists with quantity surveying by analyzing drawings, calculating materials and costs in a casual tone.",
//             instructions: "Quanti is designed to assist with quantity surveying. It reads and analyzes architectural drawings to calculate the volume and area of various elements. Once these calculations are made, it refers to an uploaded pricing spreadsheet to determine the cost of the project. Quanti provides accurate, clear, and detailed responses based on the data provided. It emphasizes precision and clarity in its calculations and avoids any assumptions without data. Quanti communicates in a casual tone, making it approachable and easy to understand for tradesmen. When a house plan is uploaded, Quanti the total quote based on rates from an uploaded spreadsheet",
//             model: "gpt-4o",
//             tools: [{ "type": "code_interpreter" }],
//             tool_resources: {
//                 "code_interpreter": {
//                     "file_ids": [file.id]
//                 }
//             }
//         });

//         const thread = await openai.beta.threads.create({
//             messages: [
//                 {
//                     "role": "user",
//                     "content": [
//                         {
//                             "type": "text",
//                             "text": "use pricing from uploaded spreadsheet file,Assists with quantity surveying by analyzing drawings, calculating materials and costs in a casual tone."
//                         },
//                         {
//                             "type": "image_url",
//                             "image_url": { "url": planImage }
//                         }
//                     ]
//                 }
//             ]
//         });

//         var accumulatedData =''

//         const run = openai.beta.threads.runs.stream(thread.id, {
//             assistant_id: assistant.id
//         })
//             .on('textCreated', (text) => {
//                 process.stdout.write('\nassistant > ');
//                 // res.write(`data: ${text}\n\n`);
//                 // accumulatedData.push(text)

//             })
//             .on('textDelta', (textDelta, snapshot) => {
//                 process.stdout.write(textDelta.value);
//                 res.write(textDelta.value);
//                 accumulatedData += textDelta.value; 
//             })

//             .on('end', async() => {
//                 let planObj = {
//                     userId: userId,
//                     planName: planName,
//                     planAddress: planAddress,
//                     imageUrl: planImage,
//                     outputGenerated: accumulatedData
//                 }
//                 await planModel.create(planObj)
//                 res.end();
//                 // console.log('Accumulated Data:', accumulatedData);
//             });

//     } catch (error) {
//         console.log("ERROR::", error);
//         return res.status(500).json({ message: "Internal Server Error", type: "error", error: error.message });
//     }
// };




// exports.addPlans = async (req, res) => {
//     try {

//         let userId = req.result.id;
//         let { planName, planAddress } = req.body;
//         var accumulatedData =''
//         let pdfFile = req.files.planImage;
//         let planImage = ''

//         if(req.files=== null){return res.status(400).json({message:"Please add Image",type:'error'}) }

//         const planImagePath = `planImage/${userId}`;
//         const contentType = pdfFile.mimetype;
//         const url = await AWS.uploadS3(pdfFile, planImagePath, contentType);
//         planImage = url;

//         if (pdfFile.mimetype !== 'application/pdf') {
//             if (pdfFile.mimetype === "image/jpeg" || pdfFile.mimetype === "image/png" || pdfFile.mimetype === "image/jpg" ) {
//                 console.log("inside the image section -----")
//             const file = await openai.files.create({
//             file: fs.createReadStream(path.join(__dirname, '../public/csv', 'pricing.xlsx')),
//             purpose: "assistants",
//         });

//         const assistant = await openai.beta.assistants.create({
//             name: "Quanti",
//             description: "Assists with quantity surveying by analyzing drawings, calculating materials and costs in a casual tone.",
//             instructions: "Quanti is designed to assist with quantity surveying. It reads and analyzes architectural drawings to calculate the volume and area of various elements. Once these calculations are made, it refers to an uploaded pricing spreadsheet to determine the cost of the project. Quanti provides accurate, clear, and detailed responses based on the data provided. It emphasizes precision and clarity in its calculations and avoids any assumptions without data. Quanti communicates in a casual tone, making it approachable and easy to understand for tradesmen. When a house plan is uploaded, Quanti the total quote based on rates from an uploaded spreadsheet",
//             model: "gpt-4o",
//             tools: [{ "type": "code_interpreter" }],
//             tool_resources: {
//                 "code_interpreter": {
//                     "file_ids": [file.id]
//                 }
//             }
//         });

//         const thread = await openai.beta.threads.create({
//             messages: [
//                 {
//                     "role": "user",
//                     "content": [
//                         {
//                             "type": "text",
//                             "text": "use pricing from uploaded spreadsheet file,Assists with quantity surveying by analyzing drawings, calculating materials and costs in a casual tone."
//                         },
//                         {
//                             "type": "image_url",
//                             "image_url": { "url": planImage }
//                         }
//                     ]
//                 }
//             ]
//         });

//         var accumulatedData =''

//         const run = openai.beta.threads.runs.stream(thread.id, {
//             assistant_id: assistant.id
//         })
//             .on('textCreated', (text) => {
//                 process.stdout.write('\nassistant > ');
//                 // res.write(`data: ${text}\n\n`);
//                 // accumulatedData.push(text)

//             })
//             .on('textDelta', (textDelta, snapshot) => {
//                 process.stdout.write(textDelta.value);
//                 res.write(textDelta.value);
//                 accumulatedData += textDelta.value; 
//             })

//             .on('end', async() => {
//                 let planObj = {
//                     userId: userId,
//                     planName: planName,
//                     planAddress: planAddress,
//                     imageUrl: planImage,
//                     outputGenerated: accumulatedData
//                 }
//                 await planModel.create(planObj)
//                 res.end();
//                 // console.log('Accumulated Data:', accumulatedData);
//             });

//             }else{
//                 return res.status(400).json({ message: "This file format not allowed. You can only add images having extensions :jpeg,png,jpg  and pdf." })
//             }
//         } else{
//        console.log("inside the pdf section -----")
//         let outputDir = path.join(__dirname, 'output');
//         if (!fs.existsSync(outputDir)) {
//             fs.mkdirSync(outputDir, { recursive: true });
//         }

//         let pdfFilePath = path.join(outputDir, pdfFile.name);
//         let options = {
//             format: 'png',
//             out_dir: outputDir,
//             out_prefix: path.parse(pdfFile.name).name,
//             page: null  
//         };

//         pdfFile.mv(pdfFilePath, async (err) => {
//             if (err) return res.status(500).send(err);

//             if (!fs.existsSync(pdfFilePath)) {
//                 console.error('File does not exist:', pdfFilePath);
//                 return res.status(500).send('File upload failed.');
//             }

//             try {
//                 await poppler.convert(pdfFilePath, options);
//                 fs.readdir(outputDir, async (err, files) => {
//                     if (err) return res.status(500).send('Error reading output directory.');

//                     const imageFiles = files.filter(file => file.endsWith('.png'));
//                     let storeUploadedFileObj =[]
//                     const uploadedImageFiles = await Promise.all(imageFiles.map(async (file) => {
//                         const filePath = path.join(outputDir, file);

//                         const response = await openai.files.create({
//                             file: fs.createReadStream(filePath),
//                             purpose: "vision",
//                         });
//                         storeUploadedFileObj.push(response)

//                         return response;
//                     }));

//                     console.log("store----",storeUploadedFileObj)

//                     const file = await openai.files.create({
//                         file: fs.createReadStream(path.join(__dirname, '../public/csv', 'pricing.xlsx')),
//                         purpose: "assistants",
//                     });

//                     const assistant = await openai.beta.assistants.create({
//                         name: "Quanti",
//                         description: "Assists with quantity surveying by analyzing drawings, calculating materials and costs in a casual tone.",
//                         instructions: "Quanti is designed to assist with quantity surveying. It reads and analyzes architectural drawings to calculate the volume and area of various elements. Once these calculations are made, it refers to an uploaded pricing spreadsheet to determine the cost of the project. Quanti provides accurate, clear, and detailed responses based on the data provided. It emphasizes precision and clarity in its calculations and avoids any assumptions without data. Quanti communicates in a casual tone, making it approachable and easy to understand for tradesmen. When a house plan is uploaded, Quanti the total quote based on rates from an uploaded spreadsheet",
//                         model: "gpt-4o",
//                         tools: [{ "type": "code_interpreter" }],
//                         tool_resources: {
//                             "code_interpreter": {
//                                 "file_ids": [file.id]
//                             }
//                         }
//                     });

//                     const thread = await openai.beta.threads.create({
//                         messages: [
//                             {
//                                 "role": "user",
//                                 "content": [
//                                     {
//                                         "type": "text",
//                                         "text": "Use pricing from uploaded spreadsheet file, Assists with quantity surveying by analyzing drawings, calculating materials and costs in a casual tone."
//                                     },
//                                     ...storeUploadedFileObj.map(imgFile => ({
//                                         "type": "image_file",
//                                         "image_file": {"file_id": imgFile.id}
//                                     }))
//                                 ]
//                             }
//                         ]
//                     });



//         const run = await openai.beta.threads.runs.stream(thread.id, {
//             assistant_id: assistant.id
//         })
//             .on('textCreated', (text) => {
//                 process.stdout.write('\nassistant > ');
//                 // res.write(`data: ${text}\n\n`);
//                 // accumulatedData.push(text)

//             })
//             .on('textDelta', (textDelta, snapshot) => {
//                 process.stdout.write(textDelta.value);
//                 res.write(textDelta.value);
//                 accumulatedData += textDelta.value; 
//             })

//             .on('end', async() => {
//                 let planObj = {
//                     userId: userId,
//                     planName: planName,
//                     planAddress: planAddress,
//                     imageUrl: planImage,
//                     outputGenerated: accumulatedData
//                 }
//                 await planModel.create(planObj)
//                 await fs.rm(outputDir, { recursive: true, force: true }, (err) => {
//                     if (err) {
//                         console.error('Error deleting output directory:', err);
//                     } else {
//                         console.log('Output directory deleted successfully.');
//                     }
//                 });
//                 res.end();


//             });



//                 });
//             } catch (err) {
//                 console.error('Error during conversion:', err);
//                 res.status(500).send('Error converting PDF to images.');
//             }
//         });
//     }
//     } catch (error) {
//         console.log("ERROR::", error);
//         return res.status(500).json({ message: "Internal Server Error", type: "error", error: error.message });
//     }
// };




exports.addPlans = async (req, res) => {
    try {

        let userId = req.result.id;
        let { planName, planAddress } = req.body;
        var accumulatedData =''
        let pdfFile = req.files.planImage;
        let planImage = ''

        if(req.files=== null){return res.status(400).json({message:"Please add Image",type:'error'}) }

        const planImagePath = `planImage/${userId}`;
        const contentType = pdfFile.mimetype;
        const url = await AWS.uploadS3(pdfFile, planImagePath, contentType);
        planImage = url;

        if (pdfFile.mimetype !== 'application/pdf') {
            if (pdfFile.mimetype === "image/jpeg" || pdfFile.mimetype === "image/png" || pdfFile.mimetype === "image/jpg" ) {

            console.log("inside the image section -----")
            
        //     const file = await openai.files.create({
        //     file: fs.createReadStream(path.join(__dirname, '../public/csv', 'pricing.xlsx')),
        //     purpose: "assistants",
        // });

        // let assistant;
        // let isAssistantIdExist = await openAIModel.findOne()
       
        // if (isAssistantIdExist.assistantId) {
        //     try {
        //         assistant = await openai.beta.assistants.retrieve(isAssistantIdExist.assistantId);
        //     } catch (error) {
        //         console.log("Assistant not found, creating a new one");
        //         assistant = await createAssistant(file.id);
        //     }
        // } else {
        //     assistant = await createAssistant(file.id);
        //     await openAIModel.findOneAndUpdate({$set:{assistantId:assistant.id}})
        // }


        const thread = await openai.beta.threads.create({
            messages: [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "use pricing from uploaded spreadsheet file,Assists with quantity surveying by analyzing drawings, calculating materials and costs in a casual tone."
                        },
                        {
                            "type": "image_url",
                            "image_url": { "url": planImage }
                        }
                    ]
                }
            ]
        });

        var accumulatedData =''

        const run = openai.beta.threads.runs.stream(thread.id, {
            assistant_id: process.env.OPENAI_ASSISTANT_ID
        })
            .on('textCreated', (text) => {
                process.stdout.write('\nassistant > ');

            })
            .on('textDelta', (textDelta, snapshot) => {
                process.stdout.write(textDelta.value);
                res.write(textDelta.value);
                accumulatedData += textDelta.value; 
            })

            .on('end', async() => {
                let planObj = {
                    userId: userId,
                    planName: planName,
                    planAddress: planAddress,
                    imageUrl: planImage,
                    outputGenerated: accumulatedData
                }
                await planModel.create(planObj)
                res.end();
                
            });

            }else{
                return res.status(400).json({ message: "This file format not allowed. You can only add images with extension jpeg,png,jpg and pdf." })
            }
        } else{
       console.log("inside the pdf section -----")
       
       const outputDir = path.join(__dirname, 'output');
       if (!fs.existsSync(outputDir)) {
           fs.mkdirSync(outputDir, { recursive: true });
       }
   
       const pdfFilePath = path.join(outputDir, pdfFile.name);

       const pdfFileBuffer = pdfFile.data; 
   
       fs.writeFileSync(pdfFilePath, pdfFileBuffer);
   
       if (!fs.existsSync(pdfFilePath)) {
           console.error('File does not exist:', pdfFilePath);
           return res.status(500).send('File upload failed.');
       }
   
       
       const existingPdfBytes = fs.readFileSync(pdfFilePath);

       
       const pdfDoc = await PDFDocument.load(existingPdfBytes);
       const totalPages = pdfDoc.getPageCount();
       console.log("pages---", totalPages);
   
      
       const options = {
           density: 500,
           saveFilename: "page",
           savePath: outputDir,
           format: "png",
           width: 1200,  
           height: 1200
       };
       const convert = fromPath(pdfFilePath, options);
       
       let storeUploadedFileObj = [];
   
       for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
           try {
               const imagePath = await convert(pageNumber, { responseType: "image" });
               const fileName = `page_${pageNumber}.png`;
               const filePath = path.join(outputDir, fileName);
   
              
               const response = await openai.files.create({
                   file: fs.createReadStream(imagePath.path),
                   purpose: "vision",
               });
   
               storeUploadedFileObj.push(response);
               console.log(`Uploaded image ${pageNumber}: ${fileName}`);
           } catch (conversionError) {
               console.error('Error converting or uploading page:', conversionError);
           }
       }
                    console.log("store----",storeUploadedFileObj)

                    // const file = await openai.files.create({
                    //     file: fs.createReadStream(path.join(__dirname, '../public/csv', 'pricing.xlsx')),
                    //     purpose: "assistants",
                    // });

                    // let assistant;
                    // let isAssistantIdExist = await openAIModel.findOne()
                   
                    // if (isAssistantIdExist.assistantId) {
                    //     try {
                    //         assistant = await openai.beta.assistants.retrieve(isAssistantIdExist.assistantId);
                    //     } catch (error) {
                    //         console.log("Assistant not found, creating a new one");
                    //         assistant = await createAssistant(file.id);
                    //     }
                    // } else {
                    //     assistant = await createAssistant(file.id);
                    //     await openAIModel.findOneAndUpdate({$set:{assistantId:assistant.id}})
                    // }
            
                   
                    const thread = await openai.beta.threads.create({
                        messages: [
                            {
                                "role": "user",
                                "content": [
                                    {
                                        "type": "text",
                                        "text": "Use pricing from uploaded spreadsheet file, Assists with quantity surveying by analyzing drawings, calculating materials and costs in a casual tone."
                                    },
                                    ...storeUploadedFileObj.map(imgFile => ({
                                        "type": "image_file",
                                        "image_file": {"file_id": imgFile.id}
                                    }))
                                ]
                            }
                        ]
                    });



        const run = await openai.beta.threads.runs.stream(thread.id, {
            assistant_id: process.env.OPENAI_ASSISTANT_ID
        })
            .on('textCreated', (text) => {
                process.stdout.write('\nassistant > ');
                // res.write(`data: ${text}\n\n`);
                // accumulatedData.push(text)

            })
            .on('textDelta', (textDelta, snapshot) => {
                process.stdout.write(textDelta.value);
                res.write(textDelta.value);
                accumulatedData += textDelta.value; 
            })

            .on('end', async() => {
                let planObj = {
                    userId: userId,
                    planName: planName,
                    planAddress: planAddress,
                    imageUrl: planImage,
                    outputGenerated: accumulatedData
                }
                await planModel.create(planObj)
                await fs.rm(outputDir, { recursive: true, force: true }, (err) => {
                    if (err) {
                        console.error('Error deleting output directory:', err);
                    } else {
                        console.log('Output directory deleted successfully.');
                    }
                });
                res.end();


            });
 
    
    }
    } catch (error) {
        console.log("ERROR::", error);
        return res.status(500).json({ message: "Internal Server Error", type: "error", error: error.message });
    }
};




exports.deletePlan = async (req, res) => {
    try {
        let planId = req.query.planId;

        let isPlanExist = await planModel.findOne({ _id: planId })
        if (!isPlanExist) { return res.status(400).json({ message: "No plan exist with this id", type: "error" }) }

        await planModel.findOneAndDelete({ _id: planId })

        return res.status(200).json({ message: isPlanExist.planName + " plan deleted successfully.", type: 'success' })

    } catch (error) {
        console.log('ERROR::', error)
        return res.status(500).json({ message: "Internal server error.", type: 'error', error: error.message })
    }
}




exports.getAllPlans = async (req, res) => {
    try {
        const columnMapping = {
            "PLAN NAME": "planName",
            "PLAN ADDRESS": "planAddress",
            "STATUS": "status",
            "CREATED AT": "createdAt"
        };

        const { page = 1, limit = 10, search = '', sortOrder = 'desc', column = 'createdAt' } = req.query;
        const userId = req.result.id;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID', type: 'error' });
        }

        const sortColumn = columnMapping[column.toUpperCase()] || 'createdAt';

        const matchStage = {
            $match: {
                $and: [
                    { userId: new mongoose.Types.ObjectId(userId) },
                    {
                        $or: [
                            { planName: { $regex: search, $options: 'i' } },
                            { planAddress: { $regex: search, $options: 'i' } },
                            { status: { $regex: search, $options: 'i' } }
                        ].filter(Boolean)
                    }
                ]
            }
        };

        const sortStage = {
            $sort: {
                [sortColumn]: sortOrder === 'asc' ? 1 : -1
            }
        };

        const facetStage = {
            $facet: {
                data: [
                    { $skip: (page - 1) * limit },
                    { $limit: parseInt(limit, 10) }
                ],
                totalCount: [
                    { $count: 'count' }
                ]
            }
        };

        const aggregationPipeline = [matchStage, sortStage, facetStage];

        const allPlans = await planModel.aggregate(aggregationPipeline);

        const plans = allPlans[0].data;
        const totalCount = allPlans[0].totalCount[0] ? allPlans[0].totalCount[0].count : 0;

        res.status(200).json({
            plans,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: parseInt(page, 10),
            type: 'success'
        });
    } catch (error) {
        console.log('ERROR::', error);
        return res.status(500).json({ message: "Internal Server Error.", type: 'error', error: error.message });
    }
}



exports.get_plan_estimates = async (req, res) => {
    try {
        const plan_id = req.query.planId
        let isPlanExist = await planModel.findOne({ _id: plan_id })
        if (!isPlanExist) { return res.status(400).json({ message: "No plan exist with this id", type: "error" }) }
        return res.status(200).json({ data: isPlanExist, type: 'success' })

    } catch (error) {
        console.log('ERROR::', error)
        return res.status(500).json({ message: "Internal server error.", type: 'error', error: error.message })
    }
}



exports.AITestRoute = async(req,res)=>{
    try{

        let userId = '667bf9d5a731bfcb4e216eac'
        let { planName, planAddress } = req.body;
        let planImage = 'https://quantigpt.s3.amazonaws.com/planImage/66839a67c7e0d78dbd7a4352/floorplan1.png';

      
        // const file = await openai.files.create({
        //     file: fs.createReadStream(path.join(__dirname, '../public/csv', 'pricing.xlsx')),
        //     purpose: "assistants",
        // });

        // let assistant;
        // let isAssistantIdExist = await openAIModel.findOne()
       
        // if (isAssistantIdExist.assistantId) {
        //     try {
        //         assistant = await openai.beta.assistants.retrieve(isAssistantIdExist.assistantId);
        //     } catch (error) {
        //         console.log("Assistant not found, creating a new one");
        //         assistant = await createAssistant(file.id);
        //     }
        // }
        //  else {
        //     assistant = await createAssistant(file.id);
        //     await openAIModel.findOneAndUpdate({$set:{assistantId:assistant.id}})
        // }

        let assistant = await createAssistant();
        console.log("assistant --------",assistant)
        const thread = await openai.beta.threads.create({
            messages: [
                {
                    role: "user",
                    content: [
                        // {
                        //     type: "text",
                        //     text: "Assists with quantity surveying by analyzing drawings, calculating materials and costs in a professional tone dont give a chat like response."
                        // },
                        {
                            type: "image_url",
                            image_url: { url: planImage }
                        }
                    ]
                }
            ]
        });
console.log("thread --------------",thread)
        var accumulatedData = '';

        const run = openai.beta.threads.runs.stream(thread.id, {
            assistant_id: assistant.id
        })
            .on('textCreated', (text) => {
                process.stdout.write('\nassistant > ');
              
            })
            .on('textDelta', (textDelta, snapshot) => {
                process.stdout.write(textDelta.value);
                res.write(textDelta.value);
                accumulatedData += textDelta.value;
            })
            .on('end', async () => {
                let planObj = {
                    userId: userId,
                    planName: planName,
                    planAddress: planAddress,
                    imageUrl: planImage,
                    outputGenerated: accumulatedData
                };
                await planModel.create(planObj);
                res.end();
             
            });

    }catch(error){
        console.log("ERROR:--",error)
        return res.status(500).json({message:"Internal Server Error.",error:error.message})
    }
}




 