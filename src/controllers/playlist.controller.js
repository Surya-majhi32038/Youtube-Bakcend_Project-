import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlists.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body

    //TODO: create playlist

    if (!(name || description)) {
        throw new ApiError(404, "not get the name and description ")
    }


    try {
        const playlist = await Playlist.create({
            name,
            description,
            owner: req.user._conditions._id
        })
        res.
            status(200)
            .json(
                new ApiResponse(200, playlist, "Successfully create playlist ")
            )
    } catch (error) {
        throw new ApiError("Error occuring while create playlist :", error);

    }
}) // done

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    //TODO: get user playlists

    if (!userId) {
        throw new ApiError(404, "not get the user id  ")
    }

    if (!isValidObjectId(userId)) {
        throw new ApiError(404, "Not a valid user id ")
    }

    try {
        const allPlaylistCreatedByUser = await Playlist.aggregate([
            {
                $match: {
                    owner: new mongoose.Types.ObjectId(userId)
                }
            }
        ])
        res.
            status(200)
            .json(
                new ApiResponse(200, allPlaylistCreatedByUser, "Successfully send all playlist which are created by user ")
            )
    } catch (error) {
        throw new ApiError("Error occuring while search playlist which are created by user  :", error);

    }


})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    //TODO: get playlist by id
    if (!playlistId) {
        throw new ApiError(404, "not get the playlist id  ")
    }

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(404, "Not a valid playlist id ")
    }

    try {
        const getPlaylist = await Playlist.findById(playlistId);
        res
            .status(200)
            .json(
                new ApiResponse(200, getPlaylist, "Successfully send the playlist ")
            )
    } catch (error) {
        throw new ApiError("Error occuring while find playlist using id :", error);
    }


}) // done

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params


    if (!playlistId && !videoId) {
        throw new ApiError(404, "not get the playlist id and videoId ")
    }

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(404, "Not a valid playlist id ")
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(404, "Not a valid video id ")
    }

    try {
        const updatedPlaylist = await Playlist.findByIdAndUpdate(
            playlistId,
            {
                $push: {
                    videos: videoId
                }
            },
            {
                new: true
            }
        );
        res
            .status(200)
            .json(
                new ApiResponse(200, updatedPlaylist, "Successfully add the video in the playlist")
            )
    } catch (error) {
        throw new ApiError("Error occuring while adding a video in the playlist :", error);
    }
}) //  done

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    // TODO: remove video from playlist

    if (!playlistId && !videoId) {
        throw new ApiError(404, "not get the playlist id and videoId ")
    }

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(404, "Not a valid playlist id ")
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(404, "Not a valid video id ")
    }

    try {
        const updatedPlaylist = await Playlist.findByIdAndUpdate(
            playlistId,
            {
                $pull: {
                    videos: videoId
                }
            },
            {
                new: true
            }
        );
        res
            .status(200)
            .json(
                new ApiResponse(200, updatedPlaylist, "Successfully delete the video in the playlist")
            )
    } catch (error) {
        throw new ApiError("Error occuring while deleting a video in the playlist :", error);
    }


}) // done

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // TODO: delete playlist


    if (!playlistId) {
        throw new ApiError(404, "not get the playlist id  ")
    }

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(404, "Not a valid playlist id ")
    }

    try {
        const updatedPlaylist = await Playlist.findByIdAndDelete(
            playlistId
        )

        res.
            status(200)
            .json(
                new ApiResponse(200, updatedPlaylist, "Successfully delete playlist ")
            )
    } catch (error) {
        throw new ApiError("Error occuring while delete the playlist :", error);

    }

}) // done

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //TODO: update playlist

    if (!(name || description)) {
        throw new ApiError(404, "not get the name and description ")
    }

    if (!playlistId) {
        throw new ApiError(404, "not get the playlist id  ")
    }

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(404, "Not a valid playlist id ")
    }

    try {
        const updatedPlaylist = await Playlist.findByIdAndUpdate(
            playlistId,
            {
                $set: {
                    name: name,
                    description: description
                }
            },
            {
                new: true
            }
        )

        res.
            status(200)
            .json(
                new ApiResponse(200, updatedPlaylist, "Successfully update playlist ")
            )
    } catch (error) {
        throw new ApiError("Error occuring while update the details of playlist :", error);

    }

}) // done

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}