import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  // WRITE SOME LOGIC HOW WE CAN REGISTER A USER AND HOW MANY STEP WE DONE IN FUTURE
  /*
    1. get user details from frontend -> using postman
    2. validation - not empty 
    3. check if user already exists: username, email
    4. check fot image, check for avater 
    5. upload them to cloudinary , avatar
    6. create user object - create entry in db
    7. remove password and refresh token field from response 
    8. check for user creation 
    9. return res 

 

    8,49
    */
  console.log(req.body);
  const { username, email, fullName, password } = req.body;
  console.log("email", email);

  if (
    [username, email, fullName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "Please fill all the fields");
  }

  // check if user already exists: username, email
  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
   if (existedUser) {
        throw new ApiError(400, "User already exists");
    }

   const avatarLocalPath =  req.files?.avatar[0]?.path;
   const coverImageLocalPath = req.files?.coverImage[0]?.path;

   if(!avatarLocalPath) {
    throw new ApiError(400,"avatar file is required")
   }

   const avatar = await uploadOnCloudinary(avatarLocalPath);
   const coverImage = await uploadOnCloudinary(coverImageLocalPath);

   if(!avatar){
    throw new ApiError(400,"avatar file is required")
   }

   const user = User.create({
    username : username.toLowerCase(), 
    email, 
    fullName, 
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || ""

   })

   const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
   )

   if(!createdUser){
    throw new ApiError(500,"Something went wrong while registering the user ")
   }

   return res.status(201).json(
    new ApiResponse(201, "User registered successfully", createdUser)
   )
});

export { registerUser };
