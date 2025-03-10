import crypto from 'crypto';
import db from '../../config/db.js';
import nodemailer from 'nodemailer'; // For sending emails
import jwt from 'jsonwebtoken'; // For decoding the token

export const requestResetPassword = async (req, res) => {
    try {

        const { email } = req.body;

        if(!email){
            return res.status(400).send({
                success: false,
                message: "Email is required"
            });
        }

        // Check if the user exists
        const userQuery = `SELECT * FROM users WHERE email = ?;`;
        const user = await new Promise((resolve, reject) => {
            db.query(userQuery, [email], (err, results) => {
                if (err) return reject(err);
                resolve(results[0]);
            });
        });

        if (!user) {
            return res.status(404).send({ 
                success: false,
                message: "User not found" 
            });
        }

        // Generate reset token and expiration time
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now
        

        // Update the user with the reset token and expiration time
        const updateQuery = `UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE user_id = ?;`;
        await new Promise((resolve, reject) => {
            db.query(updateQuery, [resetToken, resetTokenExpires, user.user_id], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        // Send the reset link to the user's email
        const resetLink = `http://localhost:5173/new-password`;
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email, // Retrieve email from the user's record
            subject: 'Password Reset Request for Performix Platform',
            html: `<p>You requested a password reset. Click <a href="${resetLink}">${resetLink}</a> to reset your password.</p>
            <p>Use this as a Reset Token: <b>${resetToken}</b>.</p>`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).send({ 
            success: true,
            message: "Password reset link sent to email Successfully" ,
            reset_token: resetToken
        });
        
    } catch (error) {
        console.error("Error in requestResetPassword:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};
