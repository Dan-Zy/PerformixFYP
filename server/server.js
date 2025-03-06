import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import organizationRoutes from "./routes/organizationRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import performanceMetricRoutes from './routes/performanceMetricRoutes.js';
import performanceParameterRoutes from './routes/performenceParameterRoutes.js';
import lmRoutes from './routes/lineManagerRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import surveyRoutes from './routes/surveyRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';

import passport from "./config/passport.js";
import session from "express-session";

const app = express();

// Middleware to parse JSON data
app.use(bodyParser.json());  
app.use(express.urlencoded({ extended: true })); 
app.use(cors());

// Use routes
app.use('/user', userRoutes);
app.use('/lm', lmRoutes);
app.use('/staff', staffRoutes);
app.use('/organization', organizationRoutes);
app.use('/department', departmentRoutes);
app.use('/performance', performanceMetricRoutes);
app.use('/performance', performanceParameterRoutes);
app.use('/survey', surveyRoutes);
app.use('/recommendation', recommendationRoutes);

app.use(session({ secret: "your_secret_key", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use(cors({
    origin: "http://localhost:5173", // Change to your frontend URL
    credentials: true,
  }));
  
  app.use(helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  }));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Google OAuth login
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google OAuth callback
app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
        successRedirect: "http://localhost:5173/dashboard",
        failureRedirect: "http://localhost:5173/login",
    })
);

// Logout
app.get("/auth/logout", (req, res) => {
    req.logout(() => {
        res.redirect("http://localhost:5173/");
    });
});

