import cron from 'node-cron';
import { connectToDatabase } from '../utils/connections'; // Import your database connection function
import User, {IUser} from '../models/User'; // Import your User, Post, and UserToPost models
import Post, { IPost } from '../models/Post'; // Import your User, Post, and UserToPost models
import { generateContent } from './generateBlogHandlers';

// Function to select 100 random users
async function getRandomUsers(count: number): Promise<IUser[]> {
  try {
    const users = await User.aggregate([{ $sample: { size: count } }]);
    return users;
  } catch (error:any) {
    throw new Error(`Error selecting random users: ${error.message}`);
  }
}

// Function to create and save posts for users
async function createAndSavePosts(users: IUser[]): Promise<void> {
  try {
    const posts: IPost[] = await Promise.all(
        users.map(async (user) => ({
          content:  await generateContent(user), 
          date: new Date().toLocaleTimeString(),
          user,
        }))
      );

    const savedPosts = await Post.insertMany(posts);
    // Update user-specific data (add post references to user)
    for (const post of savedPosts) {
        // Find the corresponding User document and update the posts field
        await User.findByIdAndUpdate(post.user, { $push: { posts: post._id } });
      }

  } catch (error:any) {
    throw new Error(`Error creating and saving posts: ${error.message}`);
  }
}

export async function startCronJob () {
// Schedule the task to run every 10 minutes
console.log("Cron job started");
cron.schedule('*/10 * * * *', async () => {
  try {
    const selectedUsers = await getRandomUsers(100);
    await createAndSavePosts(selectedUsers);
    console.log('Posts created and saved successfully.');
  } catch (error:any) {
    console.error(`Error: ${error.message}`);
  }
});

}
// Establish a database connection
connectToDatabase()
  .then(() => {
    console.log('Database connection established...........');
  })
  .catch((error) => {
    console.error(`Error establishing database connection: ${error.message}`);
  });
