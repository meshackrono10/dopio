import { Router } from 'express';
import * as propertyController from '../controllers/propertyController';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/', propertyController.getAllProperties);
router.get('/:id', propertyController.getPropertyById);

// Hunter only routes
router.post('/', authMiddleware, roleMiddleware(['HUNTER', 'ADMIN']), propertyController.createProperty);
router.put('/:id', authMiddleware, roleMiddleware(['HUNTER', 'ADMIN']), propertyController.updateProperty);
router.delete('/:id', authMiddleware, roleMiddleware(['HUNTER', 'ADMIN']), propertyController.deleteProperty);

export default router;
