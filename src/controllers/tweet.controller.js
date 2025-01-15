import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.models.js"
import { User } from "../models/user.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const userId = req.user._conditions._id;
    const { contents } = req.body
    if (!userId) {
        throw new ApiError(404, "not found user id ")
    }
    if (!contents) {
        throw new ApiError(404, "not found tweet's content")
    }

    const tweets = await Tweet.create({
        content: contents,
        owner: userId
    })

    res
        .status(200)
        .json(
            new ApiResponse(200, tweets, "Tweet create successfully ")
        )
}) //done

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId")
    }

    const pageNumber = parseInt(page)
    const limitNumber = parseInt(limit)
    const skip = (pageNumber - 1) * limitNumber

    const allTweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        }
    ])

    console.log(allTweets)

    res
        .status(200)
        .json(
            new ApiResponse(200, allTweets, "Get all the tweet of the user successfully ")
        )
}) // done

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params;
    const { newContent } = req.query;

    if (!newContent) {
        throw new ApiError(400, "content not here ")
    }
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Tweet Id is not vailed ")
    }

    try {
        const updatedTweets = await Tweet.findByIdAndUpdate(
            tweetId,
            {
                $set: {
                    content: newContent
                }
            }
        )

        res
            .status(200)
            .json(
                new ApiResponse(200, updateTweet, "Tweet updated successfully ")
            )
    } catch (error) {
        throw new ApiError(400, "Error occuring while update tweets")
    }

}) // done

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(404, "tweetId not valied ");
    }
    try {
        const deletedTweet = await Tweet.findByIdAndDelete(tweetId);
        res
            .status(200)
            .json(
                new ApiResponse(200, deletedTweet, "Tweet deleted successfully")
            )
    } catch (error) {
        throw new ApiError(404, "Error occuring while delete a tweet")
    }
}) // done

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}