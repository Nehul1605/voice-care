import express from 'express';
import { getAllPatients, addPatient } from '../controllers/patient.controller.js';

const router = express.Router();

router.route('/')
    .get(getAllPatients)
    .post(addPatient);

export default router;
