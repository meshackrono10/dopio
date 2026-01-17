"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadVideo = exports.uploadImages = exports.uploadImage = void 0;
const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        res.json({
            url: req.file.path,
            public_id: req.file.filename,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.uploadImage = uploadImage;
const uploadImages = async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }
        const urls = files.map((file) => ({
            url: file.path,
            public_id: file.filename,
        }));
        res.json(urls);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.uploadImages = uploadImages;
const cloudinary_1 = require("cloudinary");
const streamifier_1 = __importDefault(require("streamifier"));
const uploadVideo = async (req, res) => {
    try {
        if (!req.file) {
            console.error('Video upload failed: No file received');
            return res.status(400).json({ message: 'No video file uploaded' });
        }
        console.log('Starting video stream upload to Cloudinary...');
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({
            folder: 'house-haunters/videos',
            resource_type: 'auto',
        }, (error, result) => {
            if (error) {
                console.error('Cloudinary stream upload error:', error);
                return res.status(500).json({ message: error.message || 'Cloudinary upload failed' });
            }
            console.log('Video uploaded successfully:', result?.secure_url);
            res.json({
                url: result?.secure_url,
                public_id: result?.public_id,
            });
        });
        streamifier_1.default.createReadStream(req.file.buffer).pipe(uploadStream);
    }
    catch (error) {
        console.error('Video upload controller error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.uploadVideo = uploadVideo;
