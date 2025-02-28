import express from 'express';
import { verifyToken } from '../middlewares/authorization.js';
import { viewStaffDashboard } from '../controllers/staffControllers/viewStaffDashboard.js';
import { viewStaffLeaderboard } from '../controllers/staffControllers/viewStaffLeaderboard.js';
import { addGoal } from '../controllers/staffControllers/addGoal.js';
import { getAllGoals } from '../controllers/staffControllers/getAllGoals.js';

const router = express.Router();

router.get('/view-staff-dashboard', verifyToken, viewStaffDashboard);

router.get('/view-staff-leaderboard', verifyToken, viewStaffLeaderboard);

router.post('/add-goal', verifyToken, addGoal);

router.get('/get-goals', verifyToken, getAllGoals);



export default router;