import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.models.js"
import { Subscription } from "../models/subscription.models.js"
import { Like } from "../models/like.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const { channelId } = req.params;

    if (!channelId) {
        throw new ApiError(400, "not get channelId ");
    }

    if (!isValidObjectId(channelId)) {
        throw new ApiError(404, "it's not a vailed object id (channelId ) of mongodb ");
    }


    try {
        const totalLike = await Like.aggregate([
            {
                $match: {
                    likedBy: new mongoose.Types.ObjectId(channelId)
                }
            },
            {
                $group: {
                    _id: null,
                    totalLike: {
                        $sum: 1
                    }
                }
            },
            {
                $project: {
                    totalLike: 1,
                    _id: 0
                }
            }
        ])


        const totalSubscriber = await Subscription.aggregate([
            {
                $match: {
                    channel: new mongoose.Types.ObjectId(channelId)
                }
            },
            {
                $group: {
                    _id: null,
                    totalSubs: {
                        $sum: 1
                    }
                }
            },
            {
                $project: {
                    totalSubs: 1,
                    _id: 0
                }
            }
        ])


        const totalViewsAndVideos = await Video.aggregate([
            { $match: { owner: new mongoose.Types.ObjectId(channelId) } },
            {
                $group: {
                    _id: null, // Group all matching documents together
                    totalViews: { $sum: "$views" }, // Sum up the "views" field
                    totalVideos: { $sum: 1 }, // Count the total number of documents
                },
            },
            {
                $project: {
                    _id: 0, // Exclude the `_id` field
                    totalViews: 1,
                    totalVideos: 1,
                },
            },
        ]);
        

        res
            .status(200)
            .json(
                new ApiResponse(200, [totalViewsAndVideos, totalLike[0], totalSubscriber[0]], "Successfully fetch subscribersList ")
            )
    } catch (error) {
        throw new ApiError("while find subscribersList from mongodb :", error)
    }


})

// const getChannelVideos = asyncHandler(async (req, res) => {
//     // TODO: Get all the videos uploaded by the channel
//     const { channelId } = req.user._conditions._id;

//     if (!channelId) {
//         throw new ApiError(400, "not get channelId ");
//     }

//     if (!isValidObjectId(channelId)) {
//         throw new ApiError(404, "it's not a vailed object id (channelId ) of mongodb ");
//     }

//     try {
//         const totalVideos = await Video.aggregate([
//             {
//                 $facet: {
//                     documents: [
//                         { $match: { owner: new mongoose.Types.ObjectId(channelId) } }
//                     ]
//                 }
//             },
//             {
//                 $project: {
//                     documents: 1
//                 }
//             }
//         ])

//         res
//             .status(200)
//             .json(
//                 new ApiResponse(200, totalVideos, "Successfully fetch total video of the channel ")
//             )
//     } catch (error) {
//         throw new ApiError("while find total video of the channel from mongodb :", error)
//     }

// })

export {
    getChannelStats,
    getChannelVideos
}