import express from "express";
import dotenv from "dotenv";
import {
  allUserController,
  forgotPasswordController,
  loginController,
  registerController,
  updateProfileController,
} from "../controllers/authController.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";

dotenv.config();

const router = express.Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.post("/forgot-password",forgotPasswordController)
router.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({ ok: true });
});
router.get("/admin-auth",isAdmin, requireSignIn, (req, res) => {
  res.status(200).send({ ok: true });
});
router.put('/profile',updateProfileController);
router.get("/allUser",allUserController)

export default router;
