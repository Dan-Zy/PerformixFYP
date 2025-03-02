import db from '../../config/db.js';
import jwt from 'jsonwebtoken';

export const addEmployeeRecommendation = async (req , res) => {

    try {
        
        const { recommendation_text } = req.body;

         // Check if the Authorization header exists
         let token = req.header("Authorization");
         if (!token) {
             return res.status(401).send({ message: "Authorization token is required" });
         }

         // Verify the token and extract the user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user_id = decoded.id;
                 
        if (!user_id) {
            return res.status(401).send({ message: "Invalid token" });
        }

        if(!recommendation_text){
            return res.status(400).send({
                success: false,
                message: "Recommendation Text required"
            });
        }


        const checIfUserIsEmployee = `
            SELECT * FROM users WHERE user_id = ? AND is_active = 1 AND role_id != 1;
        `;

        const user = await new Promise((resolve , reject) => {
            db.query(checIfUserIsEmployee, [user_id], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });

        if(!user){
            return res.status(400).send({
                success: false,
                message: "Only active Employees (Line Manager and Staff) can Add Recommendations"
            });
        }


        const insertQuery = `
            INSERT INTO recommendations(recommendation_text, employee_id, admin_id)
            VALUES(? , ? , ?);
        `;

        const result = await new Promise((resolve, reject) => {
            db.query(insertQuery, [recommendation_text, user_id, user.created_by], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results.affectedRows);
                }
            });
        });

        if(result === 0 || result === '0' || result == 0)
        {
            return res.status(400).send({
                success: false,
                message: "Cannot able to add Recommendation"
            });
        }

        return res.status(201).send({
            success: false,
            message: "Recommendaion added successfully"
        });


    } catch (error) {
        console.log("Error while adding recommendation: ", error);
        return res.status(500).send({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }

}