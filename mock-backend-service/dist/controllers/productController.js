"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
class ProductController {
    constructor() {
        this.products = require('../data/products.json');
    }
    getProducts(req, res) {
        res.json(this.products);
    }
    getProductById(req, res) {
        const productId = parseInt(req.params.id, 10);
        const product = this.products.find((p) => p.id === productId);
        if (product) {
            res.json(product);
        }
        else {
            res.status(404).send('Product not found');
        }
    }
}
exports.ProductController = ProductController;
//# sourceMappingURL=productController.js.map