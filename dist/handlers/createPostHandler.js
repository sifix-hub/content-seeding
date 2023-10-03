"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCronJob = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const connections_1 = require("../utils/connections"); // Import your database connection function
const User_1 = __importDefault(require("../models/User")); // Import your User, Post, and UserToPost models
const Post_1 = __importDefault(require("../models/Post")); // Import your User, Post, and UserToPost models
const generateBlogHandlers_1 = require("./generateBlogHandlers");
// Function to select 100 random users
async function getRandomUsers(count) {
    try {
        const users = await User_1.default.aggregate([{ $sample: { size: count } }]);
        return users;
    }
    catch (error) {
        throw new Error(`Error selecting random users: ${error.message}`);
    }
}
// Function to create and save posts for users
async function createAndSavePosts(users) {
    try {
        const posts = await Promise.all(users.map(async (user) => ({
            content: await (0, generateBlogHandlers_1.generateContent)(user),
            date: new Date().toLocaleTimeString(),
            user,
        })));
        const savedPosts = await Post_1.default.insertMany(posts);
        // Update user-specific data (add post references to user)
        for (const post of savedPosts) {
            // Find the corresponding User document and update the posts field
            await User_1.default.findByIdAndUpdate(post.user, { $push: { posts: post._id } });
        }
    }
    catch (error) {
        throw new Error(`Error creating and saving posts: ${error.message}`);
    }
}
async function startCronJob() {
    // Establish a database connection
    (0, connections_1.connectToDatabase)()
        .then(() => {
        console.log('Database connection established...........');
    })
        .catch((error) => {
        console.error(`Error establishing database connection: ${error.message}`);
    });
    // Schedule the task to run every 10 minutes
    console.log("Cron job started");
    node_cron_1.default.schedule('*/10 * * * *', async () => {
        try {
            const selectedUsers = await getRandomUsers(100);
            await createAndSavePosts(selectedUsers);
            console.log('Posts created and saved successfully.');
        }
        catch (error) {
            console.error(`Error: ${error.message}`);
        }
    });
}
exports.startCronJob = startCronJob;
