const fs = require("fs");
module.exports.handler = async (event) => {
  const logDir = "/mnt/efs/lambda";
  const logFilePath = `${logDir}/redirect_requests.log`;

  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    fs.appendFileSync(logFilePath, JSON.stringify(event, null, 2) + "\n");
    console.log("Redirect request stored to EFS.");
  } catch (err) {
    console.error("Failed to write redirect request:", err);
  }

  return {
    statusCode: 302,
    headers: { Location: "https://www.skype.com/" }, //redirecting to skype
    body: "Redirecting to Skype...",
  };
};
