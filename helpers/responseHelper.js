import CryptoJS from 'crypto-js';

/**
 * Encrypts the entire response object using the secret key.
 * 
 * @param {object} responseData - The response object to be encrypted.
 * @returns {string} - The encrypted response in Base64 format.
 */
const encryptResponseData = (responseData) => {
    const secretKey = process.env.FILE_SECRET_KEY;
    if (!secretKey) {
        throw new Error('FILE_SECRET_KEY is not defined in the environment variables');
    }

    // Convert the response data to a string (JSON format)
    const stringifiedResponse = JSON.stringify(responseData);

    // Encrypt the stringified response
    const encryptedData = CryptoJS.AES.encrypt(stringifiedResponse, secretKey).toString();

    return encryptedData; // Return encrypted data as Base64 string
};

/**
 * Sends a JSON response with a given status code, message, and data, where the response is encrypted.
 *
 * @param {object} res - The response object to send the result.
 * @param {number} statusCode - The HTTP status code.
 * @param {string} message - The response message.
 * @param {object} data - The optional data to include in the response.
 */
export const sendResponse = (res, statusCode, message, data) => {

    res.status(statusCode).json({ message: message, data });
};


/**
 * Sends a JSON response with a given status code and error details.
 *
 * @param {object} res - The response object to send the result.
 * @param {number} statusCode - The HTTP status code.
 * @param {string} error - The error message.
 */
export const sendError = (res, statusCode, error) => {
    res.status(statusCode).json({ error });
};
