import { Request, Response } from 'express';
import { config } from 'dotenv';
import {faker} from '@faker-js/faker';
import OpenAI from 'openai'; // Assuming you import the OpenAI library correctly
import { IUser } from '../models/User';
import axios from 'axios';

config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); // Use the API key from .env

// Define an array of content sources
const contentSources = ['fakerContent', 'aiGeneratedContent', 'newsContent'];

async function generateBlogHandler(req: Request, res: Response) {
  try {
    
    const content = await generateContent(req.body);
    res.status(200).json(content);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function generateContent(user: IUser) {
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
  } catch (error) {
    console.error(error);
    return JSON.stringify({ error: 'Internal server error' });
  }
}

const generateFakerContent = (user: IUser) => {
  // Generate some content using Faker
  const fakerContent = {
    username: user.username,
    interests: user.interests,
    // Example: Generate a random paragraph of text
    text: faker.lorem.paragraph(),
  };
  return fakerContent;
};

const generateAIContent = async (user: IUser) => {
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
async function fetchNewsContent(user: IUser) {
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
    const response = await axios.request(options);
    // Extract the news article content from the response
    const newsArticle = response.data; // Replace with the actual response field
    return newsArticle;
  } catch (error: any) {
    console.error(`Error fetching news content: ${error.message}`);
    return ''; // Return an empty string on error
  }
}

// Function to randomly choose a content source
function chooseRandomContentSource() {
  const randomIndex = Math.floor(Math.random() * contentSources.length);
  return contentSources[randomIndex];
}

export default generateBlogHandler;
