import express from 'express';
import { verifyToken } from '../middlewares/authorization.js';
import { getEmployees } from '../controllers/lineManagerControllers/getEmployees.js';
import { getEmployeeMetrics } from '../controllers/lineManagerControllers/getEmployeeMetrics.js';
import { viewLineManagerDashboard } from '../controllers/lineManagerControllers/viewLineManagerDashboard.js';
import { getLMDepartments } from '../controllers/lineManagerControllers/getLMDepartments.js';
import { viewLMLeaderboard } from './../controllers/leaderboardControllers/viewLMLeaderboard.js';
import { getLMRecentActivity } from '../controllers/lineManagerControllers/getLMRecentActivities.js';

const router = express.Router();

router.get('/get-employees', verifyToken, getEmployees);

router.get('/get-employee-metrics/:user_id', verifyToken, getEmployeeMetrics);

router.get('/view-lm-dashboard', verifyToken, viewLineManagerDashboard);

router.get('/get-recent-activities', verifyToken, getLMRecentActivity);

router.get('/get-lm-departments', verifyToken, getLMDepartments);

router.get('/view-lm-leaderboard', verifyToken, viewLMLeaderboard)

export default router;