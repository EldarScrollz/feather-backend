import express from 'express';
import {verifyJwt} from '../../Utils/verifyJwt.js';
import { postValidation } from '../../validations.js';
import handleValidationsErrors from '../../Utils/handleValidationsErrors.js';
import * as PostController from "../../controllers/PostsController.js";

const router = express.Router();

// --------------------------------
// Hearts/Tags
// --------------------------------
router.get("/top-tags", PostController.getTopTags);

// --------------------------------
// Posts CRUD
// --------------------------------
router.get("/", PostController.getAllPosts);
router.get("/:id", PostController.getPostById);

// Authorized users only (verifyJwt):
router.post("/", verifyJwt, postValidation, handleValidationsErrors, PostController.createPost);

router.patch("/:id", verifyJwt, postValidation, handleValidationsErrors, PostController.updatePost);

router.delete("/:id", verifyJwt, PostController.deletePost);
// -----------------------------------------------------------------------------

export { router as postsRouter };