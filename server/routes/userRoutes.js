import express from "express";
const router = express.Router();
import upload from "../config/multer.js";
import { getExampleData, registerUser, loginUser, logoutUser } from "../controllers/userControllers/userAuth.js";
import { verifyOTP } from "../controllers/userControllers/verifyOTP.js";
import { verifyToken } from "../middlewares/authorization.js";
import { requestResetPassword } from "../controllers/userControllers/requestResetPassword.js";
import { resetPassword } from "../controllers/userControllers/resetPassword.js";
import { getUser } from "../controllers/userControllers/getUser.js";
import { addEmployee } from "../controllers/employeeControllers/addEmployee.js";
import { verifyEmail } from "../controllers/employeeControllers/verifyEmail.js";
import { setCredentials } from "../controllers/employeeControllers/setUsernameAndPassword.js";
import { setProfilePicture } from './../controllers/employeeControllers/setProfilePhoto.js';
import { getAllLineManagers } from "../controllers/userControllers/getAllLineManagers.js";
import { addEvaluation } from "../controllers/employeeControllers/addEvaluation.js";
import { addLMEvaluation } from "../controllers/userControllers/addLMEvaluation.js";
import { updateLMEvaluation } from "../controllers/userControllers/updateLMEvaluation.js";
import { updateEvaluation } from "../controllers/employeeControllers/updateEvaluation.js";
import { getEmployeeEvaluation } from "../controllers/employeeControllers/getEvaluation.js";
import { getLMEvaluation } from "../controllers/userControllers/getLMEvaluation.js";
import { editProfile } from "../controllers/userControllers/editProfile.js";
import { getSingleLineManager } from "../controllers/userControllers/getSingleLineManager.js";
import { getAllStaffs } from "../controllers/userControllers/getAllStaffs.js";
import { getSingleStaff } from "../controllers/userControllers/getSingleStaff.js";
import { viewAllPerformanceMetrics } from "../controllers/userControllers/viewAllPerformanceMetric.js";
import { viewDashboard } from "../controllers/employeeControllers/viewDashBoard.js";
import { getActiveUsers } from "../controllers/allUserControllers/getActiveUsers.js";
import { requestUpdatePassword } from "../controllers/allUserControllers/requestUpdatePassword.js";
import { updatePassword } from "../controllers/allUserControllers/updatePassword.js";
import { getAllEmployees } from "../controllers/userControllers/getAllEmployees.js";
import { deleteEmployee } from "../controllers/userControllers/deleteEmployee.js";
import { viewAdminDashboard } from "../controllers/userControllers/viewAdminDashboard.js";
import { viewReport } from "../controllers/leaderboardControllers/viewReport.js";
import { viewLeaderboard } from "../controllers/leaderboardControllers/viewLeaderboard.js";
import { addLMInDepartment } from "../controllers/userControllers/addLMInDepartment.js";
import { getSelfEvaluations } from "../controllers/employeeControllers/getSelfEvaluations.js";
import {googleSignIn} from '../controllers/userControllers/googleAuth.js';
import { getadminRecentActivity } from "../controllers/userControllers/getAdminRecentActivities.js";

router.get('/', getExampleData);

// Admin Routes

router.post('/register-user', upload.single('profilePhoto'), registerUser);

router.post('/verify-otp', verifyToken, verifyOTP);

router.post('/login-user', loginUser);

router.post('/logout-user', verifyToken, logoutUser);

router.post('/request-reset-password', requestResetPassword);

router.post('/reset-password', verifyToken, resetPassword);

router.post('/request-update-password', requestUpdatePassword);

router.post('/update-password/:token', updatePassword);

router.put('/update-profile/:user_id', verifyToken, upload.single('profilePhoto'), editProfile);

router.get('/get-user', verifyToken, getUser);

router.get('/view-report/:organization_id', verifyToken, viewReport);

router.get('/view-leaderboard/:organization_id', verifyToken, viewLeaderboard);

router.get('/view-admin-dashboard/:organization_id', verifyToken, viewAdminDashboard);

router.get('/get-recent-activities', verifyToken, getadminRecentActivity);

router.post('/add-lm-in-dept', verifyToken, addLMInDepartment);


// GET LINE MANAGERS
router.get('/get-all-LMs/:organization_id', verifyToken, getAllLineManagers);

router.get('/get-single-LM/:lineManagerId', verifyToken, getSingleLineManager);


// GET STAFFS
router.get('/get-all-staffs', verifyToken, getAllStaffs);

router.get('/get-single-staff/:staffId', verifyToken, getSingleStaff);


// GET ALL EMPLOYEES (LM AND STAFFS)
router.get('/get-employees/:organization_id', verifyToken, getAllEmployees);

router.delete('/delete-employee/:employee_id', verifyToken, deleteEmployee);


// VIEW ALL PERFORMANCE METRICS
router.get('/view-performance-metrics', verifyToken, viewAllPerformanceMetrics);


router.post('/evaluate-lm', verifyToken, addLMEvaluation);

router.put('/update-lm-evaluation/:evaluation_id', verifyToken, updateLMEvaluation);

router.get('/get-lm-evaluation/:evaluation_id', verifyToken, getLMEvaluation);



// ---------------------------------------------- BELOW ARE LINE MANAGER AND STAFF ROUTES

// Employee(Line Manager and Staff) Routes

router.post('/register-employee', verifyToken, addEmployee);

router.get('/verify-email', verifyEmail);

router.post('/set-credentials', setCredentials);

router.put('/set-pfp', verifyToken, upload.single('profilePhoto'), setProfilePicture);

router.get('/view-dashboard', verifyToken, viewDashboard);


router.post('/evaluate-employee', verifyToken, addEvaluation);


router.put('/update-emp-evaluation/:evaluation_id', verifyToken, updateEvaluation);

router.get('/get-emp-evaluation/:evaluation_id', verifyToken, getEmployeeEvaluation);




// ALL USERS ROUTES
router.get('/get-active-users', verifyToken, getActiveUsers);

router.get('/get-evaluations', verifyToken, getSelfEvaluations);


//google Auth
router.post('/auth/google', googleSignIn);

export default router;
