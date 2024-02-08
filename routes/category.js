import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import {
  createCategoryController,
  deleteCategory,
  getAllCategory,
  getSingleCategory,
  updateCategoryController,
} from "../controllers/categoryController.js";
const router = express.Router();

router.post(
  "/create-category",
  createCategoryController
);

router.put(
  "/update-category/:id",
  updateCategoryController
);

router.get("/get-category", getAllCategory);

router.get("/get-category/:slug", getSingleCategory);

router.delete("/delete-category/:id",deleteCategory);

export default router;
