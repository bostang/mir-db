/**
 * Utility untuk standarisasi response API
 */

const responseHandler = {
    // Digunakan untuk response sukses (200, 201, dll)
    success: (res, message = "Success", data = null, statusCode = 200) => {
        return res.status(statusCode).json({
            success: true,
            message: message,
            data: data
        });
    },

    // Digunakan untuk response error (400, 404, 500, dll)
    error: (res, message = "Internal Server Error", statusCode = 500, details = null) => {
        return res.status(statusCode).json({
            success: false,
            message: message,
            error: details || message,
            timestamp: new Date().toISOString()
        });
    }
};

module.exports = responseHandler;