import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.models.js"
import { Subscription } from "../models/subscription.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { subscribe } from "diagnostics_channel"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    // TODO: toggle subscription
    if (!channelId) {
        throw new ApiError(400, "not get channelId ");
    }

    if (!isValidObjectId(channelId)) {
        throw new ApiError(404, "it's not a vailed object id (channelId ) of mongodb ");
    }

    const IsSubscribed = await Subscription.findOne({
        subscriber: req.user._conditions._id,
        channel: channelId
    })

    if (IsSubscribed) {
        const deleteSubscription = await IsSubscribed.deleteOne();
        throw new ApiResponse(200, deleteSubscription, " Successfully destroy the subscription model ");

    }

    // create subscription models mean -> subscribe
    const newSubscribtion = await Subscription.create({
        subscriber: req.user._conditions._id,
        channel: channelId
    })

    res
        .status(200)
        .json(
            new ApiResponse(200, newSubscribtion, "successfully create subscription mean subscribed")
        )

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!channelId) {
        throw new ApiError(400, "not get channelId ");
    }

    if (!isValidObjectId(channelId)) {
        throw new ApiError(404, "it's not a vailed object id (channelId ) of mongodb ");
    }


    try {
        const subscribersList = await Subscription.aggregate([
            {
                $match: {
                    channel: new mongoose.Types.ObjectId(channelId)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "subscriber",
                    foreignField: "_id",
                    as: "subscribers",
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
            }
            
        ])
        res
            .status(200)
            .json(
                new ApiResponse(200, subscribersList, "Successfully fetch subscribersList ")
            )
    } catch (error) {
        throw new ApiError("while find subscribersList from mongodb :", error)
    }



})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!subscriberId) {
        throw new ApiError(400, "not get subscriberId ");
    }

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(404, "it's not a vailed object id (subscriberId ) of mongodb ");
    }


    try {
        const channelList = await Subscription.aggregate([
            {
                $match: {
                    subscriber: new mongoose.Types.ObjectId(subscriberId)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "channel",
                    foreignField: "_id",
                    as: "channels",
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
            }
            
        ])
        res
            .status(200)
            .json(
                new ApiResponse(200, channelList, "Successfully fetch channels ")
            )
    } catch (error) {
        throw new ApiError("while find channels from mongodb :", error)
    }



})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}