import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import generateBlogHandler from './handlers/generateBlogHandlers'; // Import the handler
import { GenerateUsers } from './handlers/GenerateUserHandler';
import { startCronJob } from './handlers/createPostHandler';

const router = Router();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Rate limit exceeded. Please try again later.',
  });
  

router.post('/generate-blog', limiter, generateBlogHandler);

router.get('/generate-user', GenerateUsers);


router.get('/start-cron', (req, res) => {
    startCronJob(); // Start the cron job when this endpoint is accessed
    res.status(200).send('Cron job started.');
  });

export default router;
