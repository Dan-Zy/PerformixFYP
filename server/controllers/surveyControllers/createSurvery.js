import db from "../../config/db.js";
import jwt from 'jsonwebtoken';

// Admin Creates a Survey with Questions and Options
export const createSurvey = async (req, res) => {
    try {
        const {organization_id} = req.params;
        let { title, description, questions } = req.body;

        if (!title || !description || !questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).send({
                success: false,
                message: "Missing required fields! Title, description, and questions are required."
            });
        }

        if(!organization_id){
            return res.status(400).send({
                success: false,
                message: "Organization Id required"
            });
        }

        // Authorization
        let token = req.header("Authorization");
        if (!token) {
            return res.status(401).send({ message: "Authorization token is required" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // Check if user is Admin
        const checkAdminQuery = "SELECT * FROM users WHERE user_id = ? AND role_id = 1 AND is_active = 1";
        const admin = await new Promise((resolve, reject) => {
            db.query(checkAdminQuery, [userId], (err, results) => {
                if (err) reject(err);
                else resolve(results[0]);
            });
        });
        if (!admin) {
            return res.status(403).send({ success: false, message: "Only Admin can create surveys" });
        }


        const getSurvey = `
            SELECT * FROM surveys WHERE title = ?;
        `;

        const result = await new Promise((resolve , reject) => {
            db.query(getSurvey, [title], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });

        if(result){
            return res.status(400).send({
                success: false,
                message: "Survey with the given Title already exist"
            });
        }

        const checkOrganizationExist = `
            SELECT * FROM organizations WHERE organization_id = ? AND created_by = ?;
        `;

        const organization = await new Promise((resolve , reject) => {
            db.query(checkOrganizationExist, [organization_id, userId], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });

        if(!organization){
            return res.status(400).send({
                success: false,
                message: "Organization not found"
            });
        }

        // Insert Survey
        const insertSurveyQuery = "INSERT INTO surveys (title, description, created_by, organization_id) VALUES (?, ?, ?, ?);";
        const surveyResult = await new Promise((resolve, reject) => {
            db.query(insertSurveyQuery, [title, description, userId, organization_id], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        const surveyId = surveyResult.insertId;

        // Insert Questions & Options
        for (let question of questions) {
            const { question_text, question_type, options } = question;
            if (!question_text || !question_type) {
                return res.status(400).send({ success: false, message: "Each question must have text and type" });
            }

            const insertQuestionQuery = "INSERT INTO survey_questions (survey_id, question_text, question_type) VALUES (?, ?, ?);";
            const questionResult = await new Promise((resolve, reject) => {
                db.query(insertQuestionQuery, [surveyId, question_text, question_type], (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });
            const questionId = questionResult.insertId;

            if (question_type === "multiple_choice" && options && Array.isArray(options)) {
                for (let option_text of options) {
                    const insertOptionQuery = "INSERT INTO survey_options (question_id, option_text) VALUES (?, ?);";
                    await new Promise((resolve, reject) => {
                        db.query(insertOptionQuery, [questionId, option_text], (err, results) => {
                            if (err) reject(err);
                            else resolve(results);
                        });
                    });
                }
            }
        }


        const getSurveyQuery = `
            SELECT * FROM surveys WHERE survey_id = ?;
        `;

        const survey = await new Promise((resolve , reject) => {
            db.query(getSurveyQuery, [surveyId], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });


        const insertActivityLog =  `
            INSERT INTO activity_log(user_id, table_name, record_id, action_type, activity_description)
            VALUES(?, ?, ?, ?, ?);
        `;

        let activity_description = `Admin (${admin.full_name}) has created a Survey named as (${survey.title}) in the Organiation (${organization.organization_name})`;

        const logResult = await new Promise((resolve, reject) => {
            db.query(insertActivityLog, [admin.user_id, "surveys", surveyId, "INSERT", activity_description], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results.affectedRows);
                }
            });
        });

        if(logResult === 1 || logResult === '1' || logResult == 1){
            console.log("Survey Creation Log has been inserted successfully");           
        }

        res.status(201).send({
            success: true,
            message: "Survey created successfully",
            surveyId
        });
    } catch (error) {
        console.error("Error creating survey: ", error);
        res.status(500).send({ success: false, message: "Internal Server Error", error: error.message });
    }
};
