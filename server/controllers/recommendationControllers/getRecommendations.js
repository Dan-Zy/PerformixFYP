import db from '../../config/db.js';
import jwt from 'jsonwebtoken';

export const getRecommendations = async (req , res) => {

    try {
        
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

        const checIfUserIsEmployee = `
            SELECT * FROM users WHERE user_id = ? AND is_active = 1 AND role_id = 1;
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
                message: "Only Admins can view Recommendations"
            });
        }


        const getRecommendations = `
            SELECT r.recommendation_id, r.recommendation_text, r.employee_id, emp.full_name AS employee_name,
            emp.email AS employee_email, r.admin_id, ad.full_name AS admin_name, ad.email AS admin_email,
            CONVERT_TZ(r.created_on , '+00:00', '+05:00') AS created_on
            FROM recommendations r JOIN users emp ON r.employee_id = emp.user_id
            JOIN users ad ON r.admin_id = ad.user_id WHERE r.admin_id = ? ORDER BY r.created_on DESC;
        `;

        const recommendations = await new Promise((resolve , reject) => {
            db.query(getRecommendations, [user_id], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results);
                }
            });
        });

        return res.status(200).send({
            success: true,
            message: "Recommendations fetched successfullu",
            total_recommendations: recommendations.length,
            recommendations: recommendations.length > 0 ? recommendations : "No Recommendations available"
        });

    } catch (error) {
        console.log("Error while getting recommendation: ", error);
        return res.status(500).send({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }

}