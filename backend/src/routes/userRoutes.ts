import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/profile', authMiddleware, userController.getProfile);
router.patch('/profile', authMiddleware, userController.updateProfile);
router.get('/hunter/:id', userController.getHunterProfile);
router.get('/:id/public-profile', userController.getPublicProfile);
router.post('/saved-properties/:propertyId', authMiddleware, userController.toggleSavedProperty);
router.get('/saved-properties', authMiddleware, userController.getSavedProperties);

export default router;
