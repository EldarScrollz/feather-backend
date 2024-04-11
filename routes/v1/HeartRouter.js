import express from 'express';
import * as HeartController from "../../controllers/HeartController.js";
import checkAuth from '../../Utils/checkAuth.js';

const router = express.Router();

//=================================
// /hearts
//================================= 
router.get("/", HeartController.getAllHearts);
router.get("/hasUserHeart/:postId/:userId", checkAuth, HeartController.hasUserHeartedPost);
router.get("/:postId", HeartController.getHeartsByPostId);

router.post("/:postId", checkAuth, HeartController.createHeart);

router.delete("/:postId/:userId", checkAuth, HeartController.deleteByHeartIdAndPostId);

export { router as heartRouter };