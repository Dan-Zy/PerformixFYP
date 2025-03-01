import express from 'express';
import { verifyToken } from '../middlewares/authorization.js';
import { createSurvey } from '../controllers/surveyControllers/createSurvery.js';
import { getSurveysForEmployee } from '../controllers/surveyControllers/getSurveyForEmployees.js';
import { getSingleSurveyDetails } from '../controllers/surveyControllers/getSingleSurveyDetails.js';
import { submitSurveyResponse } from '../controllers/surveyControllers/submitSurveyResponse.js';
import { getAdminSurveys } from '../controllers/surveyControllers/getAdminSurveys.js';

const router = express.Router();

router.post('/create-survey/:organization_id', verifyToken, createSurvey);

router.get('/get-admin-surveys/:organization_id', verifyToken, getAdminSurveys);

router.get('/get-surveys', verifyToken, getSurveysForEmployee);

router.get('/get-survey-details/:survey_id', verifyToken, getSingleSurveyDetails);

router.post('/submit-survey/:survey_id', verifyToken, submitSurveyResponse);

export default router;