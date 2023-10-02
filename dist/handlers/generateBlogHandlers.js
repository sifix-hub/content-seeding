"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateContent = void 0;
const dotenv_1 = require("dotenv");
const faker_1 = require("@faker-js/faker");
const openai_1 = __importDefault(require("openai")); // Assuming you import the OpenAI library correctly
const axios_1 = __importDefault(require("axios"));
(0, dotenv_1.config)();
const openai = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY }); // Use the API key from .env
// Define an array of content sources
const contentSources = ['fakerContent', 'aiGeneratedContent', 'newsContent'];
async function generateBlogHandler(req, res) {
    try {
        const content = await generateContent(req.body);
        res.status(200).json(content);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function generateContent(user) {
    const contentSource = chooseRandomContentSource();
    try {
        switch (contentSource) {
            case 'fakerContent':
                return JSON.stringify(generateFakerContent(user));
            case 'aiGeneratedContent':
                return JSON.stringify(generateAIContent(user));
            case 'newsContent':
                return JSON.stringify(fetchNewsContent(user));
            default:
                return JSON.stringify({ error: 'Invalid content source' });
        }
    }
    catch (error) {
        console.error(error);
        return JSON.stringify({ error: 'Internal server error' });
    }
}
exports.generateContent = generateContent;
const generateFakerContent = (user) => {
    // Generate some content using Faker
    const fakerContent = {
        username: user.username,
        interests: user.interests,
        // Example: Generate a random paragraph of text
        text: faker_1.faker.lorem.paragraph(),
    };
    return fakerContent;
};
const generateAIContent = async (user) => {
    // Generate content using OpenAI's GPT-3
    const { username, interests } = user;
    const prompt = `Generate a post for user ${username} with interests ${interests.join(', ')}`;
    const response = await openai.completions.create({
        model: 'gpt-3.5-turbo-instruct',
        prompt: prompt,
        max_tokens: 200, // Adjust this value as needed
    });
    const aiContent = response.choices[0].text;
    return aiContent;
};
// Function to fetch a news article from a News API
async function fetchNewsContent(user) {
    const options = {
        method: 'GET',
        url: 'https://news-api14.p.rapidapi.com/top-headlines',
        params: {
            country: 'us',
            language: 'en',
            pageSize: '10',
            category: user.interests,
        },
        headers: {
            'X-RapidAPI-Key': process.env.X_RapidAPI_Key,
            'X-RapidAPI-Host': 'news-api14.p.rapidapi.com',
        },
    };
    try {
        // Make a request to a News API to fetch a news article based on user's interests
        const response = await axios_1.default.request(options);
        // Extract the news article content from the response
        const newsArticle = response.data; // Replace with the actual response field
        return newsArticle;
    }
    catch (error) {
        console.error(`Error fetching news content: ${error.message}`);
        return ''; // Return an empty string on error
    }
}
// Function to randomly choose a content source
function chooseRandomContentSource() {
    const randomIndex = Math.floor(Math.random() * contentSources.length);
    return contentSources[randomIndex];
}
exports.default = generateBlogHandler;
