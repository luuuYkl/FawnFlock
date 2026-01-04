"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRoutes = void 0;
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const router = (0, express_1.Router)();
const productController = new productController_1.ProductController();
router.get('/', productController.getProducts.bind(productController));
router.get('/:id', productController.getProductById.bind(productController));
exports.productRoutes = router;
//# sourceMappingURL=products.js.map