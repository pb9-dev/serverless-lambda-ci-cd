const fs = require("fs");
module.exports.handler = async (event) => {
  const logDir = "/mnt/efs/lambda";
  const logFilePath = `${logDir}/auth_requests.log`;
  const token = event.authorizationToken || "";
  const validToken = "secret-token";

  console.log("Received event:", JSON.stringify(event, null, 2));

  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    fs.appendFileSync(logFilePath, JSON.stringify(event, null, 2) + "\n");
    console.log("Authorization request stored to EFS.");
  } catch (err) {
    console.error("Failed to write auth request:", err);
  }

  if (!token) {
    return {
      principalId: "user",
      policyDocument: { Version: "2012-10-17", Statement: [{ Action: "execute-api:Invoke", Effect: "Deny", Resource: event.methodArn }] },
      context: { message: "Missing Authorization Token" },
    };
  }

  if (token !== validToken) {
    return {
      principalId: "user",
      policyDocument: { Version: "2012-10-17", Statement: [{ Action: "execute-api:Invoke", Effect: "Deny", Resource: event.methodArn }] },
      context: { message: "Invalid Authorization Token" },
    };
  }

  return {
    principalId: "user",
    policyDocument: { Version: "2012-10-17", Statement: [{ Action: "execute-api:Invoke", Effect: "Allow", Resource: event.methodArn }] },
    context: { message: "Authorization successful" },
  };
};