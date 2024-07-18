const OpenAI = require('openai');
const { PDFDocument } = require('pdf-lib');
const { fromPath } = require('pdf2pic');
const fs = require('fs')
const path = require('path');
require('dotenv').config();




const openai = new OpenAI({apiKey: process.env.CHATGPT_KEY,});



// _______________________________________________ CREATE OPENAI ASSISTANT ______________________
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
  }}





// ___________________________________________ HANDLE IMAGE UPLOAD IN OPENAI ______________________________________
async function handleImage(planImage,res) {
  try {
    console.log("in the image section----")
    const thread = await openai.beta.threads.create({
    messages: [
    {
    "role": "user",
    "content": [
    { "type": "text", "text": "use pricing from uploaded spreadsheet file,Assists with quantity surveying by analyzing drawings, calculating materials and costs in a casual tone." },
    { "type": "image_url", "image_url": { "url": planImage } }
    ]}]
    });
    let accumulatedData = '';
    await new Promise((resolve, reject) => {
    
    const run = openai.beta.threads.runs.stream(thread.id, { assistant_id: process.env.OPENAI_ASSISTANT_ID })
    .on('textCreated', (text) => process.stdout.write('\nassistant > '))
    .on('textDelta', (textDelta) => {
    process.stdout.write(textDelta.value);
    res.write(textDelta.value)
    accumulatedData += textDelta.value;
    })
    .on('end', resolve)
    .on('error', reject);
    });
    return accumulatedData;
  } catch (error) { console.log("ERROR:: ", errorMonitor) }}






// __________________________________ HANDLE PDF UPLOAD IN OPENAI ______________________________________
async function handlePdf(pdfFile, planImage,res) {
  try {
    console.log('in the pdf section------')
    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const pdfFilePath = path.join(outputDir, pdfFile.name);
    fs.writeFileSync(pdfFilePath, pdfFile.data);

    const existingPdfBytes = fs.readFileSync(pdfFilePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const totalPages = pdfDoc.getPageCount();
    console.log("Pages:", totalPages);

    const options = { density: 500, saveFilename: "page", savePath: outputDir, format: "png", width: 1200, height: 1200 };
    const convert = fromPath(pdfFilePath, options);

    const storeUploadedFileObj = [];
    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
    try {
    const imagePath = await convert(pageNumber, { responseType: "image" });
    const response = await openai.files.create({
    file: fs.createReadStream(imagePath.path),
    purpose: "vision",
    });
    storeUploadedFileObj.push(response);
    console.log(`Uploaded image ${pageNumber}: page_${pageNumber}.png`);
    } catch (conversionError) {
    console.error('Error converting or uploading page:', conversionError);
    }}

    console.log("file --------",storeUploadedFileObj)
    const thread = await openai.beta.threads.create({
    messages: [
    {
    "role": "user",
    "content": [
    { "type": "text", "text": "use pricing from uploaded spreadsheet file,Assists with quantity surveying by analyzing drawings, calculating materials and costs in a casual tone." },
    ...storeUploadedFileObj.map(imgFile => ({ "type": "image_file", "image_file": { "file_id": imgFile.id } }))
    ]}]});

    let accumulatedData = '';
    await new Promise((resolve, reject) => {
    const run = openai.beta.threads.runs.stream(thread.id, { assistant_id: process.env.OPENAI_ASSISTANT_ID })
    .on('textCreated', (text) => process.stdout.write('\nassistant > '))
    .on('textDelta', (textDelta) => {
    process.stdout.write(textDelta.value);
    res.write(textDelta.value)
    accumulatedData += textDelta.value;
    })
    .on('end', async () => {
    await fs.rm(outputDir, { recursive: true, force: true }, (err) => {
    if (err) console.error('Error deleting output directory:', err);
    else console.log('Output directory deleted successfully.');
    });
    resolve();
    })
    .on('error', reject);
    });

    return accumulatedData;
  } catch (error) { console.log('ERROR:: ', error) }
}




module.exports = {
  createAssistant,
  handleImage, 
  handlePdf
}
