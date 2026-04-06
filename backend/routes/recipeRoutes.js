import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  updateRecipeImage,
  deleteRecipe,
} from '../controllers/recipeController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Multer config — save uploads to backend/uploads/
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    cb(new Error('Only image files are allowed'), false);
  },
});

const router = express.Router();

router.get('/', getRecipes);
router.get('/:id', getRecipeById);
router.post('/', upload.single('image'), createRecipe);
router.put('/:id/image', upload.single('image'), updateRecipeImage);
router.put('/:id', upload.single('image'), updateRecipe);
router.delete('/:id', deleteRecipe);

export default router;
