import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const userId = req.user._conditions._id;
    const {contents} = req.body
    if(!userId) {
        throw new ApiError(404,"not found user id ")
    }
    if(!contents) {
        throw new ApiError(404,"not found tweet's content")
    }

    const tweets = await Tweet.create({
        content: contents,
        owner: userId
    })

    res
    .status(200)
    .json(
        new ApiResponse(200,tweets,"Tweet create successfully ")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}