import express from "express";
import {runWithEmbeddings} from '../controllers/chatbotController.js';

const router = express.Router();

router.post('/', runWithEmbeddings);

export default router;