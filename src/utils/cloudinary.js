import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY, //7:28
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});


const uploadOnCloudinary = async (localFilePath) =>{

    try {
        if(!localFilePath) return null

        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        // file has been uploaded successfull
       // console.log("response -> ",response);
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file 
        // ONLY HAVA TESTING LAST PART OF VIDEO
        return null
    }
}

export default uploadOnCloudinary;