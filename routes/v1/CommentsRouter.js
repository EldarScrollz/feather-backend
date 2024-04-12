import express from 'express';
import * as CommentController from "../../controllers/CommentsController.js";
import {verifyJwt} from '../../Utils/verifyJwt.js';
import handleValidationsErrors from '../../Utils/handleValidationsErrors.js';
import { commentValidation } from '../../validations.js';

const router = express.Router();

//todo: change the names of the routes, exported router and js file

//=================================
// /comments
//=================================
router.get("/", CommentController.getAllComments);
router.get("/replies/:id", CommentController.getCommentReplies);
router.get("/:id", CommentController.getCommentsByPostId);

router.post("/", verifyJwt, commentValidation, handleValidationsErrors, CommentController.createComment);

router.patch("/:id", verifyJwt, commentValidation, handleValidationsErrors, CommentController.updateComment);

router.delete("/:id", verifyJwt, CommentController.deleteComment);

export { router as commentsRouter };