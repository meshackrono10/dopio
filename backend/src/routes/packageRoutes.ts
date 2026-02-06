import { Router } from 'express';
import { getPackageMembers, breakPackage, replaceProperty, removePropertyFromPackage, addPropertyToPackage } from '../controllers/packageController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Public route - get package members
router.get('/properties/:id/package-members', getPackageMembers);

// Protected routes - require authentication
router.post('/break-package', authMiddleware, breakPackage);
router.put('/:packageGroupId/replace-property', authMiddleware, replaceProperty);
router.delete('/properties/:id/remove', authMiddleware, removePropertyFromPackage);
router.post('/:packageGroupId/add-property', authMiddleware, addPropertyToPackage);

export default router;
