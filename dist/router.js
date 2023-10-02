"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const generateBlogHandlers_1 = __importDefault(require("./handlers/generateBlogHandlers")); // Import the handler
const GenerateUserHandler_1 = require("./handlers/GenerateUserHandler");
const createPostHandler_1 = require("./handlers/createPostHandler");
const router = (0, express_1.Router)();
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Rate limit exceeded. Please try again later.',
});
router.post('/generate-blog', limiter, generateBlogHandlers_1.default);
router.get('/generate-user', GenerateUserHandler_1.GenerateUsers);
router.get('/start-cron', (req, res) => {
    (0, createPostHandler_1.startCronJob)(); // Start the cron job when this endpoint is accessed
    res.status(200).send('Cron job started.');
});
exports.default = router;
