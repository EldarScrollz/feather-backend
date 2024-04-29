import express from 'express';
import * as HeartController from "../controllers/HeartsController.js";
import {verifyJwt} from '../utils/verifyJwt.js';

const router = express.Router();

router.get("/", HeartController.getAllHearts);
router.get("/has-user-heart/:postId/:userId", verifyJwt, HeartController.hasUserHeartedPost);
router.get("/:postId", HeartController.getHeartsByPostId);

router.post("/:postId", verifyJwt, HeartController.createHeart);

router.delete("/:postId/:userId", verifyJwt, HeartController.deleteByHeartIdAndPostId);

export { router as heartsRouter };