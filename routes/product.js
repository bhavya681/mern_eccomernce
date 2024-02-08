import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import {
  allOrderController,
  braintreePaymentController,
  braintreeTokenController,
  changeOrderStatusController,
  createProductController,
  deleteProductController,
  getProductController,
  getProductSingleController,
  orderController,
  productCategoryController,
  productCountController,
  productFiltersController,
  productListController,
  productPhotoController,
  productRealtedController,
  searchProductController,
  updateProductController,
} from "../controllers/productController.js";
import formidable from "express-formidable";

const router = express.Router();

router.post("/create-product", formidable(), createProductController);

router.get("/get-product", getProductController);

router.get("/get-product/:slug", getProductSingleController);

router.get("/product-photo/:pid", productPhotoController);

router.delete("/product-delete/:pid", deleteProductController);

router.put("/update-product/:pid", formidable(), updateProductController);

router.post("/product-filters", productFiltersController);

router.get("/product-count", productCountController);

router.get("/product-list/:page", productListController);

router.get("/search/:keyword", searchProductController);

router.get("/related-product/:pid/:cid",productRealtedController);

router.get("/product-category/:slug",productCategoryController);

router.get("/braintree/token",braintreeTokenController);

router.post("/braintree/payment",braintreePaymentController);

router.get("/orders",orderController);

router.get("/allorders",allOrderController);

router.put("/orderstatus/:id",changeOrderStatusController);

export default router;
