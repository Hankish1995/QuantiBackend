let mongoose = require('mongoose')
let planModel = require("../models/planModel")
let AWS = require('../utils/awsUpload')
const {handleImage,handlePdf} = require('../utils/OpenAI')
const {successResponse, errorResponse} = require('../utils/responseHandler')
require('dotenv').config();



// ____________________________________________________ API to adding plan and getting total cost from OpenAI _________________________
exports.executePlan = async (req, res) => {
    try {
        const userId = req.result.id;
        const { planName, planAddress } = req.body;
        const pdfFile = req.files.planImage;

        if (!pdfFile) { return res.status(400).json(errorResponse("Please add pdf file.")) }

        const contentType = pdfFile.mimetype;
        const planImagePath = `planImage/${userId}`;
        const planImage = await AWS.uploadS3(pdfFile, planImagePath, contentType);

        let accumulatedData = '';

        if (contentType === 'application/pdf') {  
            accumulatedData = await handlePdf(pdfFile, planImage,res);

        } else if (['image/jpeg', 'image/png', 'image/jpg'].includes(contentType)) {
            accumulatedData = await handleImage(planImage,res);

        } else { return res.status(400).json(errorResponse('This file format is not allowed. You can only add images with extension jpeg, png, jpg, and pdf.')) }

        const planObj = {
            userId,
            planName,
            planAddress,
            imageUrl: planImage,
            outputGenerated: accumulatedData
        };
        await planModel.create(planObj);
        res.end();

    } catch (error) {
        return res.status(500).json(errorResponse(error.message))
    }
};




// _________________________________________________ API to delete plan individually __________________________________
exports.deletePlan = async (req, res) => {
    try {
        let planId = req.query.planId;

        let isPlanExist = await planModel.findOne({ _id: planId })
        if (!isPlanExist) { return res.status(400).json(errorResponse('No plan exist with this id')) }

        await planModel.findOneAndDelete({ _id: planId })

        return res.status(200).json(successResponse( "("+isPlanExist.planName  + ") plan deleted successfully."))

    } catch (error) {
        console.log('ERROR::', error)
        return res.status(500).json({ message: "Internal server error.", type: 'error', error: error.message })
    }
}



// ____________________________API to get all the plans created by a loggedIn user this include pagination with searching funtionality______________
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

        if (!mongoose.Types.ObjectId.isValid(userId)) { return res.status(400).json(errorResponse('Invalid user ID')); }

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
        }]}};

        const sortStage = {
        $sort: {
        [sortColumn]: sortOrder === 'asc' ? 1 : -1
        }};

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
        return res.status(500).json(errorResponse(error.message));
    }
}



// ____________________________________ API to get single plan details ________________________________
exports.get_plan_estimates = async (req, res) => {
    try {
        const plan_id = req.query.planId
        let isPlanExist = await planModel.findOne({ _id: plan_id })
        if (!isPlanExist) { return res.status(400).json(errorResponse('No plan exist with this id')) }
        return res.status(200).json({ data: isPlanExist, type: 'success' })

    } catch (error) {
        console.log('ERROR::', error)
        return res.status(500).json(errorResponse(error.message))
    }
}








