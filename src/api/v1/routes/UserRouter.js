import express from 'express';
import { signUpValidation, signInValidation, editUserValidation } from "../../../validations.js";
import { handleValidationsErrors } from "../utils/handleValidationsErrors.js";
import { verifyJwt } from "../utils/verifyJwt.js";
import * as UserController from "../controllers/UserController.js";

const router = express.Router();

router.get("/me", verifyJwt, UserController.getUserInfo); // Get info about the user

router.post("/sign-up", signUpValidation, handleValidationsErrors, UserController.signUp);
router.post("/sign-in", signInValidation, handleValidationsErrors, UserController.signIn);
router.post("/sign-out", UserController.signOut);

router.patch("/edit-user", editUserValidation, handleValidationsErrors, verifyJwt, UserController.editUser);

router.delete("/delete-user/:password", verifyJwt, UserController.deleteUser);

export { router as userRouter };