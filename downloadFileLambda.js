const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");

const lambda = new LambdaClient(); // Initializing AWS Lambda client
const fileUrlLambdaName = process.env.NAME_OF_URL_LAMBDA;

exports.handler = async (event) => {
  console.log("Event received:", JSON.stringify(event));
  const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Expose-Headers": "Location"
  };

  try {
    if (!fileUrlLambdaName) {
      throw new Error("GET_FILE_URL_LAMBDA environment variable is not set");
    }
    console.log(`Invoking Lambda: ${fileUrlLambdaName}`);

    const command = new InvokeCommand({
      FunctionName: fileUrlLambdaName,
      InvocationType: "RequestResponse",
    });

    const response = await lambda.send(command);
    const payload = JSON.parse(new TextDecoder().decode(response.Payload));

    console.log("Payload =", JSON.stringify(payload, null, 2));

    const fileUrl = JSON.parse(payload.body).fileUrl;

    if (!fileUrl) {
      throw new Error("No file URL returned from invoked function");
    }

    console.log(`Redirecting to file URL: ${fileUrl}`);

    return {
      statusCode: 302,
      headers: {
        ...CORS_HEADERS,
        "Location": fileUrl,
      },
      body: "",
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