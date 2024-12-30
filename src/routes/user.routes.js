import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    updateUserAvatar,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserCoverImage
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/Auth.middlewares.js";
const router = Router();

router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]),
    registerUser
); // passed 

router.route("/login").post(loginUser); // passed 


// secured route
router.route("/logout").post(verifyJWT, logoutUser); // verifyJWT is a middleware to verify the token


router.route("/refresh-token").post(refreshAccessToken); // 2:51:51

router.route("/updateUserAvatar").patch(verifyJWT,
    upload.single("avatar"),
    updateUserAvatar
); // done 

router.route("/change-password").post(verifyJWT, changeCurrentPassword) // pass

router.route("/current-user").post(verifyJWT, getCurrentUser) // passed 

router.route("/update-account").patch(verifyJWT, updateAccountDetails); // passed 

router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage) // passed 


export default router;