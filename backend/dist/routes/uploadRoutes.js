"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uploadController_1 = require("../controllers/uploadController");
const cloudinary_1 = require("../config/cloudinary");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.post('/single', authMiddleware_1.authMiddleware, cloudinary_1.upload.single('image'), uploadController_1.uploadImage);
router.post('/multiple', authMiddleware_1.authMiddleware, cloudinary_1.upload.array('images', 10), uploadController_1.uploadImages);
router.post('/video', authMiddleware_1.authMiddleware, (req, res, next) => {
    console.log('Video upload request received');
    console.log('Headers:', req.headers);
    cloudinary_1.uploadVideo.single('video')(req, res, (err) => {
        if (err) {
            console.error('Multer video upload error:', err);
            console.error('Error details:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
            return res.status(400).json({ message: err.message || 'Video upload failed' });
        }
        console.log('Multer processing complete. File:', req.file);
        next();
    });
}, uploadController_1.uploadVideo);
exports.default = router;
