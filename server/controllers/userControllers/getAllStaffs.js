import db from '../../config/db.js';
import jwt from 'jsonwebtoken';

export const getAllStaffs = async (req, res) => {
    try {
        let token = req.header("Authorization");

        if (!token) {
            return res.status(400).send({
                success: false,
                message: "Token is missing"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        if (!userId) {
            return res.status(401).send({
                success: false,
                message: "Invalid token"
            });
        }

        // Check if the user is an Admin with a selected organization
        const checkIfUserIsAdmin = `
            SELECT selected_organization_id FROM users 
            WHERE user_id = ? AND (created_by IS NULL OR created_by = 0) AND selected_organization_id IS NOT NULL;
        `;

        const admin = await new Promise((resolve, reject) => {
            db.query(checkIfUserIsAdmin, [userId], (err, results) => {
                if (err) reject(err);
                else resolve(results[0]);
            });
        });

        if (!admin) {
            return res.status(400).send({
                success: false,
                message: "Only an Admin with a selected Organization can view Staff"
            });
        }

        const organizationId = admin.selected_organization_id;

        // Get all Staff members
        const getStaffMembers = `
            SELECT 
                u.user_id, 
                u.user_name,
                u.full_name, 
                u.designation,
                d.dept_id,
                d.department_id, 
                d.department_name 
            FROM users u 
            JOIN user_departments ud ON u.user_id = ud.user_id 
            JOIN departments d ON ud.department_id = d.dept_id 
            WHERE u.role_id = 3 AND d.organization_id = ? AND u.is_active = 1 AND d.is_active = 1;
        `;

        const staffMembers = await new Promise((resolve, reject) => {
            db.query(getStaffMembers, [organizationId], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        if (!staffMembers.length) {
            return res.status(400).send({
                success: false,
                message: "No Staff found for the selected organization"
            });
        }

        // Fetch Performance Status for each Staff Member
        const staffWithPerformance = await Promise.all(staffMembers.map(async (staff) => {
            const getPerformanceQuery = `
                SELECT
                    pm.metric_name, 
                    pp.parameter_name, 
                    mp.weightage, 
                    e.marks_obtained 
                FROM evaluations e
                JOIN performance_metrics pm ON e.metric_id = pm.metric_id
                JOIN performance_parameters pp ON e.parameter_id = pp.parameter_id
                JOIN metric_parameters mp ON e.metric_id = mp.metric_id AND e.parameter_id = mp.parameter_id
                WHERE e.employee_id = ?;
            `;

            const performanceData = await new Promise((resolve, reject) => {
                db.query(getPerformanceQuery, [staff.user_id], (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            return {
                user_id: staff.user_id,
                user_name: staff.user_name,
                full_name: staff.full_name,
                designation: staff.designation,
                dept_id: staff.dept_id,
                department_id: staff.department_id,
                department: staff.department_name,
                performance_status: performanceData.length ? performanceData : "No evaluations available"
            };
        }));

        return res.status(200).send({
            success: true,
            message: "Staff members with performance data fetched successfully",
            Staff_Count: staffWithPerformance.length,
            Staff_Members: staffWithPerformance
        });

    } catch (error) {
        console.log("Error while fetching Staff: ", error);
        return res.status(500).send({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
