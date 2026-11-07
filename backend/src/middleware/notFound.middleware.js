function notFound(req,res,next){
    res.status(400).json({
        success: false,
        message: `Route not found: ${req.originalUrl}`
    });
}

module.exports = notFound;