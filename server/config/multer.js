import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import fs from "fs";
import crypto from "crypto";

// Simulate __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the upload path
const uploadDir = path.join(__dirname, "../../uploads/profilePicture");

// Ensure the directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const originalName = file.originalname.replace(/\s+/g, "_").split(".")[0]; // Remove spaces
        const extension = path.extname(file.originalname).toLowerCase();
        const uniqueID = crypto.randomUUID(); // Generate unique ID

        const newFilename = `${originalName}-Q-D-H-T-E-${timestamp}-${uniqueID}${extension}`;
        cb(null, newFilename);
    }
});

const upload = multer({ storage });

export default upload;
