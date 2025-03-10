const AWS = require("aws-sdk");
const axios = require("axios");

const lambda = new AWS.Lambda();

exports.handler = async (event) => {
  try {
    // Invoke getFileUrlLambda to get the file URL
    const response = await lambda.invoke({
      FunctionName: process.env.GET_FILE_URL_LAMBDA, 
      InvocationType: "RequestResponse",
    }).promise();

    // Parse the response to get the file URL
    const payload = JSON.parse(response.Payload);
    const fileUrl = JSON.parse(payload.body).fileUrl;

    if (!fileUrl) {
      return { statusCode: 500, body: "No file URL returned from getFileUrlLambda" };
    }

    // Fetch the actual file from the URL
    const fileResponse = await axios.get(fileUrl, { responseType: "arraybuffer" });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/pdf", 
        "Content-Disposition": "attachment; filename=test.pdf",
      },
      body: fileResponse.data.toString("base64"), // Return file as base64
      isBase64Encoded: true, // Needed for binary file responses
    };
  } catch (error) {
    console.error("Error:", error);
    return { statusCode: 500, body: "Error fetching file" };
  }
};