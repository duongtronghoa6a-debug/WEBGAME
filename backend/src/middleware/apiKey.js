/**
 * API Key middleware for API docs access
 */
const apiKeyAuth = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey || apiKey !== process.env.API_KEY) {
        return res.status(401).json({
            success: false,
            error: {
                code: 'INVALID_API_KEY',
                message: 'Valid API key required to access this resource'
            }
        });
    }

    next();
};

module.exports = apiKeyAuth;
