import express from "express";
import { register, login, me, refresh, logout, updatePassword } from "../controllers/auth.controller.js";
import { requireAuth, registerAuth, loginAuth } from "../middlewares/auth.js";
import { registrationValidation, loginValidation } from "../validations/auth.validation.js";

const router = express.Router();

router.post("/register", [registrationValidation,registerAuth], register);
router.post("/login", [loginValidation, loginAuth], login);
router.post("/refresh", requireAuth, refresh);
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, me);
router.post("/me/update-password", requireAuth, updatePassword);

export default router;