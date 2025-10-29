export class ProductController {
    private products: any[];

    constructor() {
        this.products = require('../data/products.json');
    }

    public getProducts(req: any, res: any) {
        res.json(this.products);
    }

    public getProductById(req: any, res: any) {
        const productId = parseInt(req.params.id, 10);
        const product = this.products.find((p) => p.id === productId);
        if (product) {
            res.json(product);
        } else {
            res.status(404).send('Product not found');
        }
    }
}