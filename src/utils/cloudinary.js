import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY, //7:28
    api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        // file has been uploaded successfull
        // console.log("response -> ",response);
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath); // remove the locally saved temporary file
        // ONLY HAVA TESTING LAST PART OF VIDEO
        return null;
    }
};
const deleteFromCloudinary = async (localFilePath) => {

    const getPublicIdFromUrl = (url) => {
        const regex = /\/upload\/(?:v\d+\/)?(.+)\.\w+$/; // Regex to capture public ID
        const match = url.match(regex);
        return match ? match[1] : null; // Return the captured public ID or null
    };
    const determineMediaTypeFromUrl = (url) => {
        if (url.includes("/image/upload/")) return "image";
        if (url.includes("/video/upload/")) return "video";
        return "unknown";
    };
    try {
        const publicId = getPublicIdFromUrl(localFilePath);
        if (!publicId) {
            console.log("Invalid URL. Could not extract public ID.");
            return null;
        }
        const resourceType = determineMediaTypeFromUrl(localFilePath);
        if (!publicId) {
            console.log("Invalid URL. Could not extract public ID.");
            return null;
        }
        // Delete the image from Cloudinary
        const result = await cloudinary.uploader.destroy(publicId,{resource_type:resourceType});
      //  console.log("Deletion result:", result);
        return result;
    } catch (error) {
        console.error("Error deleting image from Cloudinary:", error.message);
        throw error;
    }
};

export { uploadOnCloudinary, deleteFromCloudinary };
