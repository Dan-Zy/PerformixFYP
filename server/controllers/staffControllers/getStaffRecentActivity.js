import db from '../../config/db.js';
import jwt from 'jsonwebtoken';

export const getStaffRecentActivity = async (req , res) => {

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

        const checkIfStaff = `
            SELECT * FROM users WHERE user_id = ? AND is_active = 1 AND role_id = 3;
        `;

        const staff = await new Promise((resolve , reject) => {
            db.query(checkIfStaff, [user_id], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });


        if(!staff){
            return res.status(400).send({
                success: false,
                message: "Only staff can view the Staff related Recent Activities"
            });
        }


        const getStaffActivites = `
            SELECT * FROM activity_log WHERE table_name = ? OR table_name = ?;
        `;

        const recentActivities = await new Promise((resolve, reject) => {
            db.query(getStaffActivites, ["evaluations", "surveys"], (err, results) => {
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
            message: "Staff Recent Activities fetched successfully",
            recentActivities_count: recentActivities.length,
            recentActivities: recentActivities
        });
        
    } catch (error) {
        console.log("Error while fetching staff recent activity: ", error);
        return res.status(500).send({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }

}