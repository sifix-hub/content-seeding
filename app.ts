import express from 'express';
import bodyParser from 'body-parser';
import { config } from 'dotenv';

import cors from 'cors';
import router from './router'; // Import the router


config(); // Load environment variables from .env file

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());


app.use(cors()); 

app.use('/', router);


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
