"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImages = exports.uploadImage = void 0;
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
