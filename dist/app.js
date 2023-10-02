"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = require("dotenv");
const cors_1 = __importDefault(require("cors"));
const router_1 = __importDefault(require("./router")); // Import the router
(0, dotenv_1.config)(); // Load environment variables from .env file
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
app.use('/', router_1.default);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
