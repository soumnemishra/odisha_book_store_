import express from 'express';
import { getRecommendations, aiSearch } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/recommendations', protect, getRecommendations);
router.post('/search', aiSearch);

export default router;
