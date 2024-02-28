import express from 'express';
import checkAuth from '../Utils/checkAuth.js';
import { postValidation } from '../validations.js';
import handleValidationsErrors from '../Utils/handleValidationsErrors.js';
import * as PostController from "../controllers/PostController.js";

const router = express.Router();

//=================================
// /posts
//=================================
// --------------------------------
// Hearts/Tags
// --------------------------------
router.get("/topTags", PostController.getTopTags);

// --------------------------------
// Posts CRUD
// --------------------------------
router.get("/", PostController.getAllPosts);
router.get("/:id", PostController.getPostById);

// Authorized users only (checkAuth):
router.post("/", checkAuth, postValidation, handleValidationsErrors, PostController.createPost);

router.patch("/:id", checkAuth, postValidation, handleValidationsErrors, PostController.updatePost);

router.delete("/:id", checkAuth, PostController.deletePost);
// -----------------------------------------------------------------------------

export { router as postRouter };