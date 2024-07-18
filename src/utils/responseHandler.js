exports.successResponse = (message , data = null) => ({
    type: "success",
    message,
    data
})

exports.errorResponse = (message) => ({
    type: "error",
    message
})
