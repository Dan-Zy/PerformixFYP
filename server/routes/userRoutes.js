import express from "express";
const router = express.Router();
import upload from "../config/multer.js";
import { getExampleData, registerUser, loginUser } from "../controllers/userControllers/userAuth.js";
import { verifyOTP } from "../controllers/userControllers/verifyOTP.js";
import { verifyToken } from "../middlewares/authorization.js";
import { requestResetPassword } from "../controllers/userControllers/requestResetPassword.js";
import { resetPassword } from "../controllers/userControllers/resetPassword.js";
import { getUser } from "../controllers/userControllers/getUser.js";

router.get('/', getExampleData);

router.post('/register-user', upload.single('profilePhoto'), registerUser);

router.post('/verify-otp', verifyToken, verifyOTP);

router.post('/login-user', loginUser);

router.post('/request-reset-password', requestResetPassword);

router.post('/reset-password/:token', resetPassword);

router.get('/get-user', getUser);

export default router;
