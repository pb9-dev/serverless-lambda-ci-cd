const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda"); 
const axios = require("axios");

const lambda = new LambdaClient(); // Initializing AWS Lambda client
const fileUrlLambdaName=process.env.NAME_OF_URL_LAMBDA;
exports.handler = async (event) => {
  console.log("Event received:", JSON.stringify(event));
  const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Expose-Headers": "Content-Disposition" 
  };
  try {
    if (!fileUrlLambdaName) {
      throw new Error("GET_FILE_URL_LAMBDA environment variable is not set");
    }
    console.log(`Invoking Lambda: ${fileUrlLambdaName}`);

    // Invoking Lambda
    const command = new InvokeCommand({
      FunctionName: fileUrlLambdaName,
      InvocationType: "RequestResponse",
    });

    const response = await lambda.send(command);

    // Parse response
    const payload = JSON.parse(new TextDecoder().decode(response.Payload));
    console.log("Payload =", JSON.stringify(payload, null, 2));
    const fileUrl = JSON.parse(payload.body).fileUrl;

    if (!fileUrl) {
      throw new Error("No file URL returned from invoked function");
    }

    console.log(`Fetching file from URL: ${fileUrl}`);

    // Fetch the actual file from the URL
    const fileResponse = await axios.get(fileUrl, { responseType: "arraybuffer" });

    console.log("File fetched successfully, returning response to API Gateway.");
    console.log(fileResponse)
    console.log(fileResponse.data.toString('base64'))

    return {
      statusCode: 200,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=test.pdf",
        "Content-Encoding": "binary",
      },
      body: Buffer.from(fileResponse.data).toString("base64"),
      isBase64Encoded: true
    };
  } catch (error) {
    console.error("Error:", error.message);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Error fetching file", error: error.message }),
    };
  }
};
