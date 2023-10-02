"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateUsers = void 0;
const faker_1 = require("@faker-js/faker");
const connections_1 = require("../utils/connections");
const User_1 = __importDefault(require("../models/User"));
// Function to connect to the database
async function establishDatabaseConnection() {
    try {
        await (0, connections_1.connectToDatabase)();
        console.log("Database connection established");
    }
    catch (err) {
        console.error(`Error establishing database connection: ${err.message}`);
        // Handle the error appropriately
    }
}
// Establish the database connection when this module is imported
establishDatabaseConnection();
async function generateFakeUsersInBatch(batchSize) {
    const batch = Array.from({ length: batchSize }, () => ({
        username: faker_1.faker.internet.userName(),
        avatar: faker_1.faker.internet.avatar(),
        interests: [faker_1.faker.word.noun(), faker_1.faker.word.noun()],
    }));
    try {
        await User_1.default.insertMany(batch);
        console.log(`Generated ${batchSize} fake users`);
    }
    catch (error) {
        console.error(`Error generating fake users: ${error.message}`);
        throw new Error(`Error generating fake users: ${error.message}`);
    }
}
async function generate50KFakeUsers() {
    const totalUsers = 50000;
    const batchSize = 1000;
    const batches = Array.from({ length: totalUsers / batchSize }, (_, index) => {
        return () => generateFakeUsersInBatch(batchSize);
    });
    const promises = batches.map((batchFn) => batchFn());
    const concurrency = 5; // Adjust the concurrency as needed
    const batchPromises = [];
    for (let i = 0; i < promises.length; i += concurrency) {
        const batch = promises.slice(i, i + concurrency);
        batchPromises.push(Promise.all(batch));
    }
    // Execute the batches sequentially with the desired concurrency
    for (const batchPromise of batchPromises) {
        await batchPromise;
    }
}
async function GenerateUsers(req, res) {
    generate50KFakeUsers()
        .then(() => {
        res.status(200).json({ message: "Users generated" });
        (0, connections_1.connectionClose)();
    })
        .catch((error) => {
        res.status(500).json({ error: 'Internal server error' });
        console.error(`Error: ${error.message}`);
        (0, connections_1.connectionClose)();
    });
}
exports.GenerateUsers = GenerateUsers;
