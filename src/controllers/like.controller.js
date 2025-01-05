import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle like on video

    const userId = req.user._conditions._id;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "video id is not a valid object id ");
    }

    if (!userId) {
        throw new ApiError(400, "not get user id ")
    }

    const existVideoLike = await Like.findOne({
        video: videoId,
        likedBy: userId
    })

    if (existVideoLike) {
        console.log(existVideoLike)
        await existVideoLike.deleteOne();
        res
            .status(200)
            .json(
                new ApiResponse(200, "Video unliked successfully")
            )
    } else {
        const newVideoLike = await Like.create({
            video: videoId,
            likedBy: userId
        });

        res
            .status(200)
            .json(
                new ApiResponse(200, "Successfully liked a video", newVideoLike)
            )

    }

}) // done 

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    //TODO: toggle like on comment


    const userId = req.user._conditions._id;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "video id is not a valid object id ");
    }

    if (!userId) {
        throw new ApiError(400, "not get user id ")
    }

    const existCommentLike = await Like.findOne({
        comment: commentId,
        likedBy: userId
    })

    if (existCommentLike) {
        //console.log(existVideoLike)
        await existCommentLike.deleteOne();
        res
            .status(200)
            .json(
                new ApiResponse(200, "Video unliked successfully")
            )
    } else {
        const newCommentLike = await Like.create({
            comment: commentId,
            likedBy: userId
        });

        res
            .status(200)
            .json(
                new ApiResponse(200, "Successfully liked a comment", newCommentLike)
            )

    }

}) // done

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet


    const userId = req.user._conditions._id;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "video id is not a valid object id ");
    }

    if (!userId) {
        throw new ApiError(400, "not get user id ")
    }

    const existTweetLike = await Like.findOne({
        tweet: tweetId,
        likedBy: userId
    })

    if (existTweetLike) {
        //console.log(existVideoLike)
        await existTweetLike.deleteOne();
        res
            .status(200)
            .json(
                new ApiResponse(200, "Tweet unliked successfully")
            )
    } else {
        const newTweetLike = await Like.create({
            tweet: tweetId,
            likedBy: userId
        });

        res
            .status(200)
            .json(
                new ApiResponse(200, "Successfully liked a tweet", newTweetLike)
            )

    }

}
) // done

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    /*
    1. get the user id 
    2. create a aggregation pipline where find those like schema , in every schema have a same user id and a video parameter

    */
    // console.log(req.user)
    const userId = req.user._conditions._id;

    if (!userId) {
        throw new ApiError(400, "not found user id ")
    }

    const exists = await Like.aggregate([
        {
            $match: {
                $and: [
                    {
                        likedBy: new mongoose.Types.ObjectId(userId)
                    }
                    ,
                    {
                        video: { $exists: true } // Ensure the like is associated with a video
                    }
                ]

            },
        }
    ]);
    console.log(exists);
    const getLikedFromVideo = await Like.aggregate([
        {
            $match: {
                $and: [
                    {
                        likedBy: new mongoose.Types.ObjectId(userId)
                    },
                    {
                        video: { $exists: true } // Ensure the like is associated with a video
                    }
                ]

            },
        },
        // Stage 2: Lookup video details
        {
            $lookup: {
                from: "videos", // Name of the 'videos' collection
                localField: "video", // Field in the 'likes' collection
                foreignField: "_id", // Field in the 'videos' collection
                as: "videoDetails", // Name of the resulting array
                pipeline: [
                    {
                        $project: {
                            videoId: 1, // Include the video ID
                            title: 1, // Include the video title
                            description: 1, // Include the video description
                        },
                    },
                ]
            },
        },
        // Stage 3: Unwind the videoDetails array to get video objects
        {
            $unwind: "$videoDetails",
        }
    ]);

    console.log(getLikedFromVideo)
    if (getLikedFromVideo.length === 0) {
        return res.status(404).json(new ApiError("No liked videos found for this user."));
    }

    return res.status(200).json(new ApiResponse(200, "Successfully get videos which are liked by the user ", getLikedFromVideo));
}) // done 

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}