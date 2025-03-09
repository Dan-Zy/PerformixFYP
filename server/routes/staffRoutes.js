import express from 'express';
import { verifyToken } from '../middlewares/authorization.js';
import { viewStaffDashboard } from '../controllers/staffControllers/viewStaffDashboard.js';
import { viewStaffLeaderboard } from '../controllers/staffControllers/viewStaffLeaderboard.js';
import { addGoal } from '../controllers/staffControllers/addGoal.js';
import { getAllGoals } from '../controllers/staffControllers/getAllGoals.js';
import { updateGoalStatus } from '../controllers/staffControllers/updateGoalStatus.js';
import { getStaffRecentActivity } from '../controllers/staffControllers/getStaffRecentActivity.js';

const router = express.Router();

router.get('/view-staff-dashboard', verifyToken, viewStaffDashboard);

router.get('/get-recent-activities', verifyToken, getStaffRecentActivity);

router.get('/view-staff-leaderboard', verifyToken, viewStaffLeaderboard);

router.post('/add-goal', verifyToken, addGoal);

router.get('/get-goals', verifyToken, getAllGoals);

router.put('/update-goal-status/:goal_id', verifyToken, updateGoalStatus);



export default router;