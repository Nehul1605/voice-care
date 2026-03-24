import express from 'express';
import * as healthController from '../controllers/health.controller.js';

const router = express.Router();

router.get('/', healthController.check);

export default router;
