import { Router } from 'express';
import { uploadImage, uploadImages, uploadVideo as uploadVideoController } from '../controllers/uploadController';
import { upload, uploadVideo } from '../config/cloudinary';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/single', authMiddleware, upload.single('image'), uploadImage);
router.post('/multiple', authMiddleware, upload.array('images', 10), uploadImages);
router.post('/video', authMiddleware, (req, res, next) => {
    console.log('Video upload request received');
    console.log('Headers:', req.headers);

    uploadVideo.single('video')(req, res, (err) => {
        if (err) {
            console.error('Multer video upload error:', err);
            console.error('Error details:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
            return res.status(400).json({ message: err.message || 'Video upload failed' });
        }
        console.log('Multer processing complete. File:', req.file);
        next();
    });
}, uploadVideoController);

export default router;
