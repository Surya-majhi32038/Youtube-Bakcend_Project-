class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
    // 6:15:00 first put all the code of 'ApiResponse.js' and 'ApiError.js' into chatGPT and understand the code
  }
}

export {ApiResponse}