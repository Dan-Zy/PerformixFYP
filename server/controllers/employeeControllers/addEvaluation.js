import db from '../../config/db.js';
import jwt from 'jsonwebtoken';

export const addEvaluation = async (req , res) => {

    try {
        
        const { employee_id, metric_id, parameter_id, marks_obt, feedback } = req.body;
        
        // Check if the Authorization header exists
        let token = req.header("Authorization");
        if (!token) {
            return res.status(401).send({
                success: false,
                message: "Authorization token is required" 
            });
        }
        

        if(!employee_id || !metric_id || !parameter_id || !marks_obt || !feedback){
            return res.status(400).send({
                success: false,
                message: "All fields are required"
            });
        }

        // Verify the token and extract the user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        
        if (!userId) {
            return res.status(401).send({ 
                success: false,
                message: "Invalid token" 
            });
        }


        // THIS IS THE VALIDATION TO CHECK IF THE EMPLOYEE GIVEN IS PRESENT INSIDE THAT DEPARTMENT WHOSE METRIC LINE MANAGER IS EVALUATING AGAISNT THAT EMPLOYEE
        const checkIfGivenEmployeeInDept = `
            SELECT * FROM users u JOIN user_departments ud ON u.user_id = ud.user_id
            JOIN departments d ON ud.department_id = d.dept_id
            JOIN metric_assignments ma ON d.dept_id = ma.department_id WHERE u.user_id = ?;
        `;

        const isExist = await new Promise((resolve, reject) => {
            db.query(checkIfGivenEmployeeInDept, [employee_id], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });


        if(!isExist){
            return res.status(400).send({
                success: false,
                message: "Given employee is not present in the department whose performance metric you are giving"
            });
        }

        const getLineManager = `
            SELECT user_id from users WHERE user_id = ? AND role_id = 2 AND is_active = 1;
        `;

        const lm_id = await new Promise((resolve, reject) => {
            db.query(getLineManager, [userId], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });


        if(!lm_id){
            return res.status(400).send({
                success: false,
                message: "You are not authorized to evaluate the given employee"
            });
        }

        // FETCH THE user_id AND STORE IT IN line_manager_id VARIABLE
        const line_manager_id = lm_id.user_id;



        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS evaluations (
                evaluation_id INT AUTO_INCREMENT PRIMARY KEY,
                line_manager_id INT NOT NULL,
                employee_id INT NOT NULL,
                metric_id INT NOT NULL,
                parameter_id INT NOT NULL,
                marks_obtained DECIMAL(5, 2),
                feedback TEXT,
                evaluated_on DATETIME DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_evaluation_line_manager_id FOREIGN KEY (line_manager_id) REFERENCES users(user_id) ON DELETE CASCADE,
                CONSTRAINT fk_evaluation_employee_id FOREIGN KEY (employee_id) REFERENCES users(user_id) ON DELETE CASCADE,
                CONSTRAINT fk_evaluation_metric_id FOREIGN KEY (metric_id) REFERENCES performance_metrics(metric_id) ON DELETE  CASCADE,
                CONSTRAINT fk_evaluation_parameter_id FOREIGN KEY (parameter_id) REFERENCES performance_parameters(parameter_id) ON DELETE CASCADE
            );
        `;


        await new Promise((resolve, reject) => {
            db.query(createTableQuery, (err, results) => {
                if(err){
                    console.error("Error creating table:", err);
                    reject(err);
                }
                else{
                    console.log("Checked/Created 'evaluations' table.");
                    resolve(results);
                }
            });
        });
        

        // CHECK line manager EXIST WITH THE GIVEN ID
        const checkLineManagerQuery = `
            SELECT * FROM users WHERE user_id = ? AND role_id = 2 AND is_active = 1;
        `;

        const lineManager = await new Promise((resolve , reject) => {
            db.query(checkLineManagerQuery, [line_manager_id], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });

        if(!lineManager){
            return res.status(401).send({
                success: false,
                message: "Line Manager Id is not correct. No Line Manager Exist with this ID"
            });
        }



        // CHECK employee EXIST WITH THE GIVEN ID
        const checkEmployeeQuery = `
            SELECT * FROM users WHERE user_id = ? AND role_id = 3 AND is_active = 1;
        `;

        const employee = await new Promise((resolve , reject) => {
            db.query(checkEmployeeQuery, [employee_id], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });

        if(!employee){
            return res.status(401).send({
                success: false,
                message: "Employee/Staff Id is not correct. No Staff Exist with this ID"
            });
        }



        // CHECK performance_metrics EXIST WITH THE GIVEN ID
        const checkMetricQuery = `
            SELECT * FROM performance_metrics WHERE metric_id = ? AND is_active = 1;
        `;

        const metric = await new Promise((resolve , reject) => {
            db.query(checkMetricQuery, [metric_id], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });

        if(!metric){
            return res.status(401).send({
                success: false,
                message: "Metric Id is not correct. No Metric Exist with this ID"
            });
        }




        // CHECK performance_parameter EXIST WITH THE GIVEN ID
        const checkParameterQuery = `
            SELECT * FROM performance_parameters WHERE parameter_id = ? AND is_active = 1;
        `;

        const parameter = await new Promise((resolve , reject) => {
            db.query(checkParameterQuery, [parameter_id], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });

        if(!parameter){
            return res.status(401).send({
                success: false,
                message: "Parameter Id is not correct. No Parameter Exist with this ID"
            });
        }





        // CHECK IF THE GIVEN METRIC IS ASSIGNED TO THE GIVEN LINE MANAGER
        const checkMetricAssignmentQuery = `
            SELECT * FROM metric_assignments WHERE metric_id = ? AND line_manager_id = ?;
        `;

        const metric_assigned = await new Promise((resolve , reject) => {
            db.query(checkMetricAssignmentQuery, [metric_id, line_manager_id], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });

        if(!metric_assigned){
            return res.status(401).send({
                success: false,
                message: "The given Performance Metric is not assigned to the given Line Manager"
            });
        }




        // CHECK IF THE GIVEN PARAMETER IS THE PARAMETER OF THE GIVEN METRIC
        const checkMetricParameterQuery = `
            SELECT * FROM metric_parameters WHERE metric_id = ? AND parameter_id = ?;
        `;

        const metric_parameter = await new Promise((resolve , reject) => {
            db.query(checkMetricParameterQuery, [metric_id, parameter_id], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });

        if(!metric_parameter){
            return res.status(401).send({
                success: false,
                message: "The given Performance Parameter is not a parameter of to the given Performance Metric"
            });
        }




        // GET THE DEPARTMENT ID TO VERIFY EITHER THE GIVEN LINE MANAGE AND EMPLOYEE IS FROM THE SAME DEPARTMENT

        const getDepartmentQuery = `
            SELECT department_id FROM metric_assignments WHERE metric_id = ? AND line_manager_id = ? ORDER BY assignment_id DESC;
        `;

        const department_id = await new Promise((resolve , reject) => {
            db.query(getDepartmentQuery, [metric_id, line_manager_id], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });

        if(!department_id){
            return res.status(401).send({
                success: false,
                message: "Department ID Not found from the Assigned Metrics"
            });
        }


        // CHECK IF LINE MANAGER AND EMPLOYEE IS FROM THIS DEPARTMENT

        const checkUserDepartmentsQuery = `
            SELECT COUNT(*) AS usersInDepartment FROM user_departments WHERE user_id IN (?, ?) AND department_id = ?;
        `;        

        console.log("LINE MANAGER ID: ", line_manager_id);
        console.log("EMPLOYEE ID: ", employee_id);        
        console.log("DEPARTMENT ID: ", department_id.department_id);
        
        

        const result = await new Promise((resolve , reject) => {
            db.query(checkUserDepartmentsQuery, [line_manager_id, employee_id, department_id.department_id], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });
        
        console.log("USERS COUNT: ", typeof result.usersInDepartment);
        

        if(result.usersInDepartment !== 2){
            return res.status(400).send({
                success: false,
                message: "Either Line Manager or Employee does not exist in the Department whose metric you are evaluating"
            });   
        }


        const checkIfSameDataExist = `
            SELECT * FROM evaluations WHERE line_manager_id = ? AND employee_Id = ? AND metric_id = ? AND parameter_id = ?;
        `;

        const dataExist = await new Promise((resolve , reject) => {
            db.query(checkIfSameDataExist, [line_manager_id, employee_id, metric_id, parameter_id], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results);
                }
            });
        });

        if(dataExist.length !== 0 || dataExist.length !== '0' || dataExist != 0){
            return res.status(400).send({
                success: false,
                message: "You have already eveluated this Employee for the given parameter of the given metric"
            });
        }



        const insertEvaluationQuery = `
            INSERT INTO evaluations(line_manager_id, employee_id, metric_id, parameter_id, marks_obtained, feedback)
            VALUES(?, ?, ?, ?, ?, ?);
        `;

        const isInserted = await new Promise((resolve, reject) => {
            db.query(insertEvaluationQuery, [line_manager_id, employee_id, metric_id, parameter_id, marks_obt, feedback], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results.affectedRows);
                }
            });
        });


        if(isInserted < 1){
            return res.status(400).send({
                success: false,
                message: "Cannot able to insert the Evaluation Data"
            });
        }

        const insertActivityLog =  `
            INSERT INTO activity_log(user_id, table_name, record_id, action_type, activity_description)
            VALUES(?, ?, ?, ?, ?);
        `;

        let activity_description = `Line Manager (${lineManager.full_name}) has evaluated an Employee (${employee.full_name}) for the Parameter (${parameter.parameter_name}) of Metric (${metric.metric_name})`;

        const logResult = await new Promise((resolve, reject) => {
            db.query(insertActivityLog, [lineManager.user_id, "evaluations", employee.user_id, "INSERT", activity_description], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results.affectedRows);
                }
            });
        });

        if(logResult === 1 || logResult === '1' || logResult == 1){
            console.log("Employee Evaluation Log has been inserted successfully");           
        }


        return res.status(201).send({
            success: true,
            message: "Employee Evaluation data has been inserted Successfully!"
        });
        
    } catch (error) {
        console.log("Error while evaluating employee: ", error);
        return res.status(500).send({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }

}