import express from 'express';
import { saveWeight, getWeightHistory } from '../controllers/weightController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.post('/', saveWeight);
router.get('/history', getWeightHistory);

export default router;
