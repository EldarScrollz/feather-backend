import express from 'express';
import { registerValidation, loginValidation } from "../../validations.js";
import handleValidationsErrors from "../../Utils/handleValidationsErrors.js";
import {verifyJwt} from "../../Utils/verifyJwt.js";
import * as UserController from "../../controllers/UserController.js";

const router = express.Router();

//todo: change the names of the routes, exported router and js file

router.get("/me", verifyJwt, UserController.getUserInfo); // Get info about the user

router.post("/register", registerValidation, handleValidationsErrors, UserController.register);
router.post("/login", loginValidation, handleValidationsErrors, UserController.login);
router.post("/logout", UserController.logout)

//todo: add validation like 'registerValidation'?
router.patch("/editProfile", verifyJwt, UserController.editUserInfo);

router.delete("/deleteProfile/:password", verifyJwt, UserController.deleteUser);

export { router as userRouter };