import { Router } from "express";
import { registerUser,loginUser,logoutUser,refreshAccessToken,updateUserAvatar } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/Auth.middlewares.js";
const router = Router(); 

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

// secured route
router.route("/logout").post(verifyJWT,logoutUser); // verifyJWT is a middleware to verify the token
router.route("/refresh-token").post(refreshAccessToken); 
router.route("/updateUserAvatar").post(
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  updateUserAvatar
);




export default router;