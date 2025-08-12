import express from "express";
import { signin, login, logout, updateProfile,checkAuth } from "../controllers/auth.js";
import protectRoute from "../middlewares/protectRoute.js";
const router = express.Router();
router.post("/signup", signin);
router.post("/login", login);
router.post("/logout", logout);
router.put("/update-profile", protectRoute, updateProfile);
router.get("/check", protectRoute,checkAuth )
export default router;
