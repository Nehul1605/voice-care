import express from 'express';
import { handleUltravoxWebhook } from '../controllers/webhook.controller.js';

const router = express.Router();

router.post('/ultravox', handleUltravoxWebhook);

export default router;
