import { Router } from 'express';
import { ProductController } from '../controllers/productController';

const router = Router();
const productController = new ProductController();

router.get('/', productController.getProducts.bind(productController));
router.get('/:id', productController.getProductById.bind(productController));

export const productRoutes = router;