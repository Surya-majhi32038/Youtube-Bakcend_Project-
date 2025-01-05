import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.models.js"
import { User } from "../models/user.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query = "", sortBy = "createdAt", sortType = 1, userId = "" } = req.query
    //TODO: get all videos based on query, sort, pagination
    const pageNumber = parseInt(page)
    const limitNumber = parseInt(limit)
    const skip = (pageNumber - 1) * limitNumber

    const videos = await Video.aggregate([
        {
            $match: {
                $or: [
                    {
                        title: {
                            $regex: query,
                            $options: "i"
                        }
                    },
                    {
                        description: {
                            $regex: query,
                            $options: "i"
                        }
                    },
                    {
                        owner: userId
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            fullName: 1,
                            avatar: 1,
                            coverImage: 1,
                        }
                    }
                ]

            }
        },

        {
            $unwind: "$owner"
        },
        {
            $sort: {
                [sortBy]: sortType === "asc" ? 1 : -1
            }
        },
        {
            $skip: skip
        },
        {
            $limit: limitNumber
        }
    ])

    if (!videos) {
        throw new ApiError(404, "No video found")
    }

    res
    .status(200)
    .json(
        new ApiResponse(200, videos, "Videos fetched successfully")
    )


})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video
    console.log(req.files)
    // const videoLocalPath = req.files?.videoFile[0]?.path
    // const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    const videoLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    console.log(videoLocalPath, thumbnailLocalPath)

    if (!(title || description || videoLocalPath || thumbnailLocalPath)) {
        throw new ApiError(400, "All files are not present")
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!(videoFile || thumbnail)) {
        throw new ApiError(500, "Error in uploading files (Video/Thumbnail)")
    }


    // create video 
    const video = await Video.create({
        title,
        description,
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        owner: req.user._conditions._id,
        duration: videoFile.duration

    })

    res
        .status(200)
        .json(new ApiResponse(201, video, "Video published successfully"))
}) // done

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    res
        .status(200)
        .json(
            new ApiResponse(201, video, "Video fetch successfully ")
        )
}) // done

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const { title, description } = req.body
    if (!(title || description)) {
        throw new ApiError(400, "Title or description is required")
    }
    const thumbnailLocalPath = req.file?.path;
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required")
    }
    const newVideo = await Video.findById(videoId);
    const deleteData = await deleteFromCloudinary(newVideo.thumbnail)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    console.log("DeleteData -> ", deleteData)
    const video = await Video.findByIdAndUpdate(videoId, {
        title,
        description,
        thumbnail: thumbnail.url
    }, { new: true })
    res
        .status(200)
        .json(
            new ApiResponse(200, video, "Video updated successfully")
        )

}) // done

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    const deleteThumbnialFromCloudinary
        = await deleteFromCloudinary(video.thumbnail)
    const deleteVideoFromCloudinary = await deleteFromCloudinary(video.videoFile)

    if (!(deleteThumbnialFromCloudinary.result === "ok" && deleteVideoFromCloudinary.result === "ok")) {
        throw new ApiError(500, "Error in deleting video and thumbnail")
    }
    await Video.findByIdAndDelete(videoId)
    res.status(200).json(
        new ApiResponse(200, {}, "Video deleted successfully")
    )
}) // done

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    const result = await Video.findByIdAndUpdate(videoId,
        {    // toggle publish status
            $set: {
                isPublished: !video.isPublished
            }
        }, { new: true })
    res.status(200).json(new ApiResponse(200, result, "Publish status updated successfully"))
}) // done

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}