import express from 'express';
import * as HeartController from "../../controllers/HeartsController.js";
import {verifyJwt} from '../../Utils/verifyJwt.js';

const router = express.Router();

//todo: change the names of the routes, exported router and js file

//=================================
// /hearts
//================================= 
router.get("/", HeartController.getAllHearts);
router.get("/hasUserHeart/:postId/:userId", verifyJwt, HeartController.hasUserHeartedPost);
router.get("/:postId", HeartController.getHeartsByPostId);

router.post("/:postId", verifyJwt, HeartController.createHeart);

router.delete("/:postId/:userId", verifyJwt, HeartController.deleteByHeartIdAndPostId);

export { router as heartsRouter };