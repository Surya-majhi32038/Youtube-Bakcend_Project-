import mongoose from "mongoose";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const refreshToken = user.generateRefreshToken();
        const accessToken = user.generateAccessToken();

        user.refreshToken = refreshToken;
        await user.save({ ValidateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating access and refresh token"
        );
    }
};
const registerUser = asyncHandler(async (req, res) => {
    // WRITE SOME LOGIC HOW WE CAN REGISTER A USER AND HOW MANY STEP WE DONE IN FUTURE
    /*
      1. get user details from frontend -> using postman DONE
      2. validation - not empty DONE
      3. check if user already exists: username, email DONE
      4. check fot image, check for avater DONE
      5. upload them to cloudinary , avatar  DONE
      6. create user object - create entry in db DONE
      7. remove password and refresh token field from response 
      8. check for user creation 
      9. return res 
  
   
  
      8,49
      */
    // console.log("requested body ->",req.body);
    const { username, email, fullName, password } = req.body;
    //console.log("email", email);

    if (
        [username, email, fullName, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "Please fill all the fields");
    }

    // check if user already exists: username, email
    const existedUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existedUser) {
        throw new ApiError(400, "User with email and username  already exists");
    }

    console.log("reqested files ->",req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // ONLY TESTING
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "avatar file is required");
    }

    const user = await User.create({
        username: username.toLowerCase(),
        email,
        fullName,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    });
    // console.log("user_id",user._id);

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    // console.log(createdUser) // only for testing
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user ");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, "User registered successfully", createdUser));
});

const loginUser = asyncHandler(async (req, res) => {
    // WRITE SOME LOGIC HOW WE CAN LOGIN A USER AND HOW MANY STEP WE DONE IN FUTURE
    /*
      1. get user details from frontend -> using postman 
      2. username or email and password 
      3. find user in database
      5. check if password correct
      6. access token and refresh token
      7. return cookie's
      */

    const { username, email, password } = req.body;

    // check if user already exists: username, email
    if (!(username || email)) {
        throw new ApiError(400, "Please provide username or email");
    }
    // console.log(await bcrypt.hash(password,10))
    // check user or email exists
    const user = await User.findOne({
        $or: [{ username }, { email }],
    });
  //  console.log(user);
    if (!user) {
        throw new ApiError(404, "user does not exists");
    }

    // check if password correct
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    // access token and refresh token
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id
    );

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const option = {
        httpOnly: true,
        secure: true,
    };
    // console.log(loggedInUser,accessToken,refreshToken)
    return res
        .status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken, // 1:10:00
                },
                "User logged insuccessfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
     await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            },
        },
        { new: true }
    );
    const option = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", option)
        .clearCookie("refreshToken", option)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request ");
    }

    try {
        const decoded_Token = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
        const user = await User.findById(decoded_Token?._id);
       // console.log(user)
        if (!user) {
            throw new ApiError(401, "Invaild refresh token ");
        }

        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Refresh token is used or expired");
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
            user._id
        );

        const option = {
            httpOnly: true,
            secure: true,
        };
        // last 2:36:00
        return res
            .status(200)
            .cookie("accessToken", accessToken, option)
            .cookie("refreshToken", refreshToken, option)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken },
                    "Successfully Access token refreshed"
                )
            );
    } catch (error) {
        throw new ApiError("Failed access token refreshed");
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    //console.log(oldPassword,newPassword,req.user._conditions)
    const user = await User.findById(req.user?._conditions._id);
   // console.log(req.user?._conditions._id) 
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "invaild old password");
    }

    user.password = newPassword;
    await user.save({ ValidateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password Change Successfully"));
});


const getCurrentUser = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._conditions._id)
   // console.log(user)
    return res
        .status(200)
        .json(new ApiResponse(200, user.toObject(), "Current User fetched successfully "));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;
    if (!fullName || !email) {
        throw new ApiError(400, "fullName and email not present ");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._conditions._id,
        {
            $set: {
                fullName,
                email,
            },
        },
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Successfully Account Details updated "));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing ");
    }

   const avatar = await uploadOnCloudinary(avatarLocalPath);
   const users = await User.findById(req.user._conditions._id)
   console.log(users)
   await deleteFromCloudinary(users.avatar);
    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar ");
    }
  //  console.log(req.user._conditions._id)
    const user = await User.findByIdAndUpdate(
        req.user._conditions._id,
        {
            $set: {
                avatar: avatar.url,
            },
        },
        {
            new: true,
        }
    ).select("-password");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Avatar image updated successfully "));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image  file is missing ");
    }
    const users = await User.findById(req.user._conditions._id)
   // console.log(users)
   await deleteFromCloudinary(users.coverImage);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on Cover Image ");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._conditions._id,
        {
            $set: {
                coverImage: coverImage.url,
            },
        },
        {
            new: true,
        }
    ).select("-password");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "cover Image updated successfully "));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;
    //console.log(req.user._conditions._id); 
    
    if (!username?.trim()) {
        throw new ApiError(400, "username name not found");
    }
    const channel = await User.aggregate([
        {
            $match: {
                username: username.toLowerCase(),
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo",
            },
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._conditions._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ]);  // also console the channel to learn 

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                channel[0],
                "User channel fetched successfully"
            )

        )
});


const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._conditions._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch history fetched successfullu"
        )
    )
})
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    changeCurrentPassword,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getWatchHistory,
    getUserChannelProfile
};
