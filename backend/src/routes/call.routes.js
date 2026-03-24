import express from 'express';
import { triggerPatientCall } from '../controllers/call.controller.js';

const router = express.Router();

router.post('/trigger', triggerPatientCall);

export default router;
