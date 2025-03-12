import db from "../../config/db.js";
import jwt from "jsonwebtoken";

export const viewAdminDashboard = async (req, res) => {
    try {
        const { organization_id } = req.params;
        let token = req.header("Authorization");

        if (!token) {
            return res.status(400).json({ success: false, message: "Token is missing" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user_id = decoded.id;
        if (!user_id) {
            return res.status(401).json({ success: false, message: "Invalid token" });
        }

        if (!organization_id) {
            return res.status(400).send({
                success: false,
                message: "Organization Id is required",
            });
        }

        // Step 1: Get Total Departments in the Organization
        const totalDepartmentsQuery = `
            SELECT COUNT(*) AS total_departments 
            FROM departments 
            WHERE organization_id = ?;
        `;
        const totalDepartments = await new Promise((resolve, reject) => {
            db.query(totalDepartmentsQuery, [organization_id], (err, results) => {
                if (err) reject(err);
                else resolve(results[0]?.total_departments || 0);
            });
        });

        // Step 2: Get Total Employees (excluding role_id = 1)
        const totalEmployeesQuery = `
            SELECT COUNT(*) AS total_employees 
            FROM users u
            JOIN user_departments ud ON u.user_id = ud.user_id
            JOIN departments d ON ud.department_id = d.dept_id
            WHERE d.organization_id = ? AND (u.role_id = 2 OR u.role_id = 3);
        `;
        const totalEmployees = await new Promise((resolve, reject) => {
            db.query(totalEmployeesQuery, [organization_id], (err, results) => {
                if (err) reject(err);
                else resolve(results[0]?.total_employees || 0);
            });
        });

        // Step 3: Get Total Active Employees (users with is_login = 1)
        const totalActiveEmployeesQuery = `
            SELECT COUNT(*) AS total_active_employees
            FROM users u
            JOIN user_departments ud ON u.user_id = ud.user_id
            JOIN departments d ON ud.department_id = d.dept_id
            WHERE d.organization_id = ? AND (u.role_id = 2 OR u.role_id = 3) AND u.is_login = 1;
        `;
        const totalActiveEmployees = await new Promise((resolve, reject) => {
            db.query(totalActiveEmployeesQuery, [organization_id], (err, results) => {
                if (err) reject(err);
                else resolve(results[0]?.total_active_employees || 0);
            });
        });

        // Step 4: Get Total Performance Scores Per Department
        const departmentScoresQuery = `
            SELECT 
                d.dept_id, 
                d.department_name, 
                COALESCE(SUM(e.marks_obtained), 0) + COALESCE(SUM(lme.marks_obtained), 0) AS total_performance_score
            FROM departments d
            LEFT JOIN user_departments ud ON d.dept_id = ud.department_id
            LEFT JOIN users u ON ud.user_id = u.user_id AND (u.role_id = 2 OR u.role_id = 3)
            LEFT JOIN evaluations e ON u.user_id = e.employee_id AND u.role_id = 3
            LEFT JOIN line_manager_evaluations lme ON u.user_id = lme.line_manager_id AND u.role_id = 2
            WHERE d.organization_id = ?
            GROUP BY d.dept_id, d.department_name;

        `;
        const departmentScores = await new Promise((resolve, reject) => {
            db.query(departmentScoresQuery, [organization_id], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        // Step 5: Get All Employees in the Organization
        const employeesDataQuery = `
            SELECT 
                u.user_id, 
                u.full_name, 
                u.email, 
                u.role_id, 
                u.is_login, 
                d.dept_id, 
                d.department_name, 
                COALESCE(
                    CASE 
                        WHEN u.role_id = 3 THEN e.marks_obtained 
                        WHEN u.role_id = 2 THEN lme.marks_obtained 
                    END, 0
                ) AS performance_score
            FROM users u
            JOIN user_departments ud ON u.user_id = ud.user_id
            JOIN departments d ON ud.department_id = d.dept_id
            LEFT JOIN evaluations e ON u.user_id = e.employee_id AND u.role_id = 3
            LEFT JOIN line_manager_evaluations lme ON u.user_id = lme.line_manager_id AND u.role_id = 2
            WHERE d.organization_id = 1
            AND u.role_id IN (2, 3)
            AND u.created_by = ?
            GROUP BY u.full_name
            ORDER BY d.department_name, u.full_name;

        `;
        const employeesData = await new Promise((resolve, reject) => {
            db.query(employeesDataQuery, [organization_id, user_id], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        return res.status(200).json({
            success: true,
            message: "Admin dashboard data fetched successfully",
            data: {
                total_departments: totalDepartments,
                total_employees: totalEmployees,
                total_active_employees: totalActiveEmployees,
                performance_data: departmentScores,
                employees_data: employeesData
            }
        });

    } catch (error) {
        console.error("Error fetching admin dashboard:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};
