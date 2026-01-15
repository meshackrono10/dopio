import { Request, Response } from 'express';

export const uploadImage = async (req: any, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        res.json({
            url: req.file.path,
            public_id: req.file.filename,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const uploadImages = async (req: any, res: Response) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const urls = files.map((file: any) => ({
            url: file.path,
            public_id: file.filename,
        }));

        res.json(urls);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

export const uploadVideo = async (req: any, res: Response) => {
    try {
        if (!req.file) {
            console.error('Video upload failed: No file received');
            return res.status(400).json({ message: 'No video file uploaded' });
        }

        console.log('Starting video stream upload to Cloudinary...');

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'house-haunters/videos',
                resource_type: 'auto',
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary stream upload error:', error);
                    return res.status(500).json({ message: error.message || 'Cloudinary upload failed' });
                }

                console.log('Video uploaded successfully:', result?.secure_url);
                res.json({
                    url: result?.secure_url,
                    public_id: result?.public_id,
                });
            }
        );

        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);

    } catch (error: any) {
        console.error('Video upload controller error:', error);
        res.status(500).json({ message: error.message });
    }
};
