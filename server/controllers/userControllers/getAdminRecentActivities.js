import db from '../../config/db.js';
import jwt from 'jsonwebtoken';

export const getadminRecentActivity = async (req , res) => {

    try {
        
        // Check if the Authorization header exists
        let token = req.header("Authorization");
        if (!token) {
            return res.status(401).send({
                success: false,
                message: "Authorization token is required" 
            });
        }

        // Verify the token and extract the user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user_id = decoded.id;
        
        if (!user_id) {
            return res.status(401).send({ 
                success: false,
                message: "Invalid token" 
            });
        }

        const checkIfadmin = `
            SELECT * FROM users WHERE user_id = ? AND is_active = 1 AND role_id = 1;
        `;

        const admin = await new Promise((resolve , reject) => {
            db.query(checkIfadmin, [user_id], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });


        if(!admin){
            return res.status(400).send({
                success: false,
                message: "Only Admin can view the Admin related Recent Activities"
            });
        }


        const getadminActivites = `
            SELECT * FROM activity_log WHERE table_name = "recommendations" AND record_id = ?;
        `;

        const recentActivities = await new Promise((resolve, reject) => {
            db.query(getadminActivites, [user_id], (err, results) => {
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
            message: "Admin Recent Activities fetched successfully",
            recentActivities_count: recentActivities.length,
            recentActivities: recentActivities
        });
        
    } catch (error) {
        console.log("Error while fetching Line Manager recent activity: ", error);
        return res.status(500).send({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }

}