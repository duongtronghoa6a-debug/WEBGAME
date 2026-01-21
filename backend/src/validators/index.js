const { body, validationResult } = require('express-validator');

/**
 * Validation middleware - checks for validation errors
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: errors.array()[0].msg,
                details: errors.array()
            }
        });
    }
    next();
};

/**
 * Register validation rules
 */
const registerRules = [
    body('email')
        .isEmail()
        .withMessage('Email không hợp lệ')
        .normalizeEmail(),
    body('username')
        .isLength({ min: 3, max: 30 })
        .withMessage('Username phải từ 3-30 ký tự')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username chỉ được chứa chữ, số và dấu gạch dưới'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password phải có ít nhất 6 ký tự')
];

/**
 * Login validation rules
 */
const loginRules = [
    body('email')
        .isEmail()
        .withMessage('Email không hợp lệ'),
    body('password')
        .notEmpty()
        .withMessage('Password là bắt buộc')
];

/**
 * Profile update validation rules
 */
const updateProfileRules = [
    body('username')
        .optional()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username phải từ 3-30 ký tự')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username chỉ được chứa chữ, số và dấu gạch dưới'),
    body('avatar_url')
        .optional()
        .isURL()
        .withMessage('Avatar URL không hợp lệ')
];

/**
 * Message validation rules
 */
const messageRules = [
    body('receiver_id')
        .notEmpty()
        .withMessage('Receiver ID là bắt buộc'),
    body('content')
        .notEmpty()
        .withMessage('Nội dung tin nhắn là bắt buộc')
        .isLength({ max: 1000 })
        .withMessage('Tin nhắn không quá 1000 ký tự')
];

/**
 * Friend request validation rules
 */
const friendRequestRules = [
    body('friend_id')
        .notEmpty()
        .withMessage('Friend ID là bắt buộc')
];

/**
 * Rating validation rules
 */
const ratingRules = [
    body('stars')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating phải từ 1-5 sao')
];

/**
 * Comment validation rules
 */
const commentRules = [
    body('content')
        .notEmpty()
        .withMessage('Nội dung comment là bắt buộc')
        .isLength({ max: 500 })
        .withMessage('Comment không quá 500 ký tự')
];

module.exports = {
    validate,
    registerRules,
    loginRules,
    updateProfileRules,
    messageRules,
    friendRequestRules,
    ratingRules,
    commentRules
};
