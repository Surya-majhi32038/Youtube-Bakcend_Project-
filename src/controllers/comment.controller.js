import mongoose, { isValidObjectId } from "mongoose"
import { Comment } from "../models/comments.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId")
    }

    const pageNumber = parseInt(page)
    const limitNumber = parseInt(limit)
    const skip = (pageNumber - 1) * limitNumber

    const allComments = await Comment.aggregate([
        {
            $match:{
                video: new mongoose.Types.ObjectId(videoId)   
            }
        }
    ])

    //console.log(allComments)
    
    res
    .status(200)
    .json(
        new ApiResponse(200,allComments,"Get all the comments of the given video's successfully ")
    )

}) // done

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params
    const { content } = req.body

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId")
    }

    // if videoId is correct
    const comment = await Comment.create({
        content: content,
        video: videoId,
        owner: req.user._conditions._id
    })

    res
        .status(200)
        .json(
            new ApiResponse(
                201,
                comment,
                "Comment add successfully"
            )
        )
}) // done

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params;
    // console.log(commentId)
    const { newContent } = req.query;
    //console.log(newContent)
    if (!newContent) {
        throw new ApiError(404, "new Comment not here ")
    }
    if (!isValidObjectId(commentId)) {
        throw new ApiError(404, "commentId not valied ");
    }

    try {
        const updatedComment = await Comment.findByIdAndUpdate(
            commentId,
            {
                $set: {
                    content: newContent
                }
            },
            {
                new: true
            }
        )

        res
            .status(200)
            .json(
                new ApiResponse(200, updateComment, "Successfully comment updated ")
            )
    } catch (error) {
        throw new ApiError(404, "Error while update Comment ")
    }
}) // done

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(404, "commentId not valied ");
    }
    try {
        const deletedComment = await Comment.findByIdAndDelete(commentId);
        res
            .status(200)
            .json(
                new ApiResponse(200, deleteComment, "Comment deleted successfully")
            )
    } catch (error) {
        throw new ApiError(404, "Error occuring while delete a comment")
    }

}) // done

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}