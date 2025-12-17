// src/utils/response.js
const success = (res, data, message = "Success") => {
  return res.status(200).json({
    status: true,
    message,
    data,
  });
};

const error = (res, message = "Internal Server Error", statusCode = 500) => {
  return res.status(statusCode).json({
    status: false,
    message,
  });
};

module.exports = { success, error };
