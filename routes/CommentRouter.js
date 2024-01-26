import express from 'express';
import * as CommentController from "../controllers/CommentController.js";
import checkAuth from '../Utils/checkAuth.js';
import handleValidationsErrors from '../Utils/handleValidationsErrors.js';
import { commentValidation } from '../validations.js';

const router = express.Router();

//=================================
// /comments
//=================================
router.get("/", CommentController.getAllComments);
router.get("/replies/:id", CommentController.getReplies);
router.get("/:id", CommentController.getCommentsByPostId);

router.post("/", checkAuth, commentValidation, handleValidationsErrors, CommentController.createComment);

router.patch("/:id", checkAuth, commentValidation, handleValidationsErrors, CommentController.updateComment);

router.delete("/:id", checkAuth, CommentController.deleteComment);

export { router as commentRouter };