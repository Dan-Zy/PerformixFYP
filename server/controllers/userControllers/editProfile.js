import db from "../../config/db.js";
import jwt from "jsonwebtoken";
import path from "path";

export const editProfile = async (req, res) => {
    try {
        const { user_id } = req.params;
        const { fullname, username, phone } = req.body;
        const profilePhotoPath = req.file ? `/uploads/profilePicture/${req.file.filename}` : null;

        // Check for Authorization header
        let token = req.header("Authorization");
        if (!token) {
            return res.status(401).json({ success: false, message: "Authorization token is required" });
        }

        // Verify the token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ success: false, message: "Invalid token" });
        }

        const tokenUserId = decoded.id;
        if (!tokenUserId || tokenUserId !== parseInt(user_id)) {
            return res.status(403).json({ success: false, message: "Unauthorized to edit this profile" });
        }

        // Check if user exists
        const checkUserQuery = `SELECT * FROM users WHERE user_id = ? AND is_active = 1 AND (created_by IS NULL OR created_by = 0)`;
        const user = await new Promise((resolve, reject) => {
            db.query(checkUserQuery, [user_id], (err, results) => {
                if (err) reject(err);
                else resolve(results.length > 0 ? results[0] : null);
            });
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found or not active" });
        }

        // Prepare update query
        const updateFields = [];
        const updateValues = [];

        if (fullname) {
            updateFields.push("full_name = ?");
            updateValues.push(fullname);
        }
        if (username) {
            updateFields.push("user_name = ?");
            updateValues.push(username);
        }
        if (phone) {
            updateFields.push("phone = ?");
            updateValues.push(phone);
        }
        if (profilePhotoPath) {
            updateFields.push("profile_photo = ?");
            updateValues.push(profilePhotoPath);
        }

        if (updateFields.length > 0) {
            const updateQuery = `UPDATE users SET ${updateFields.join(", ")} WHERE user_id = ?`;
            updateValues.push(user_id);

            const result = await new Promise((resolve, reject) => {
                db.query(updateQuery, updateValues, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            if (result.affectedRows > 0) {
                return res.status(200).json({ success: true, message: "Profile updated successfully" });
            }
        }

        return res.status(400).json({ success: false, message: "No changes were made." });

    } catch (error) {
        console.error("Error while updating profile:", error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};
