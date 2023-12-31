import { faker } from '@faker-js/faker';
import { connectToDatabase, connectionClose } from '../utils/connections';
import { Request, Response } from 'express';
import User from '../models/User';


// Function to connect to the database
async function establishDatabaseConnection() {
  try {
    await connectToDatabase();
    console.log("Database connection established");
  } catch (err: any) {
    console.error(`Error establishing database connection: ${err.message}`);
    // Handle the error appropriately
  }
}

// Establish the database connection when this module is imported
establishDatabaseConnection();

async function generateFakeUsersInBatch(batchSize: number): Promise<void> {
  const batch = Array.from({ length: batchSize }, () => ({
    username: faker.internet.userName(),
    avatar: faker.internet.avatar(),
    interests: [faker.word.noun(), faker.word.noun()],
  }));

  try {
    await User.insertMany(batch);
    console.log(`Generated ${batchSize} fake users`);
  } catch (error: any) {
    console.error(`Error generating fake users: ${error.message}`);
    
  }
}

async function generate50KFakeUsers(): Promise<void> {
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

export async function GenerateUsers(req: Request, res: Response) {
  generate50KFakeUsers()
    .then(() => {
      res.status(200).json({ message: "Users generated" });
      connectionClose();
    })
    .catch((error: any) => {
      res.status(500).json({ error: 'Internal server error' });
      console.error(`Error: ${error.message}`);
      connectionClose();
    });
}
