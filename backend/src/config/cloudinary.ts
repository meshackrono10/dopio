import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'house-haunters/images',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    } as any,
});

const videoStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'house-haunters/videos',
        resource_type: 'auto',
        // allowed_formats: ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv'],
    } as any,
});

export const upload = multer({ storage: storage });
export const uploadVideo = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});
export { cloudinary };
