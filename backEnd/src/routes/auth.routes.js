import express from "express";
import { register, login, me, refresh, logout, updatePassword, userList, updateUserRole, updateUserStatus, deleteUserById, resetPassword } from "../controllers/auth.controller.js";
import { requireAuth, registerAuth, loginAuth } from "../middlewares/auth.js";
import { registrationValidation, loginValidation } from "../validations/auth.validation.js";

const router = express.Router();

router.post("/register", [registrationValidation,registerAuth], register);
router.post("/login", [loginValidation, loginAuth], login);
router.post("/reset-password", resetPassword);
router.post("/refresh", requireAuth, refresh);
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, me);
router.post("/me/update-password", requireAuth, updatePassword);
router.get("/user-list", requireAuth, userList);
router.post("/update-role", requireAuth, updateUserRole);
router.post("/update-status", requireAuth, updateUserStatus);
router.delete("/user/:userId", requireAuth, deleteUserById);

export default router;