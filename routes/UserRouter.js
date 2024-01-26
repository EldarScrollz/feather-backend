import express from 'express';
import { registerValidation, loginValidation } from "../validations.js";
import handleValidationsErrors from "../Utils/handleValidationsErrors.js";
import checkAuth from "../Utils/checkAuth.js";
import * as UserController from "../controllers/UserController.js";

const router = express.Router();

//=================================
// /auth
//=================================
router.get("/me", checkAuth, UserController.getUserInfo); // Get info about the user

router.post("/register", registerValidation, handleValidationsErrors, UserController.register);
router.post("/login", loginValidation, handleValidationsErrors, UserController.login);

router.patch("/editProfile", checkAuth, UserController.editUserInfo);

router.delete("/deleteProfile/:userId/:password", checkAuth, UserController.deleteUser);

export { router as userRouter };