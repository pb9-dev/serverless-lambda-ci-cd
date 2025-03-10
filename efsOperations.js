const fs = require("fs");

module.exports.listEFSFiles = async () => {
  try {
    const efsPath = "/mnt/efs/lambda";
    if (!fs.existsSync(efsPath)) {
      return { statusCode: 500, body: JSON.stringify({ error: "EFS directory not found." }) };
    }
    const files = fs.readdirSync(efsPath);
    return { statusCode: 200, body: JSON.stringify({ files }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: "Failed to list EFS files", details: err.message }) };
  }
};

module.exports.downloadEFSFile = async (event) => {
  try {
    console.log("Received event:", JSON.stringify(event, null, 2));
    const fileName = event.queryStringParameters?.file;
    console.log("Name of file is", fileName);
    const filePath = `/mnt/efs/lambda/${fileName}`;

    if (!fs.existsSync(filePath)) {
      return { statusCode: 404, body: JSON.stringify({ error: "File not found" }) };
    }
    const fileContent = fs.readFileSync(filePath, "utf8");

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/octet-stream", "Content-Disposition": `attachment; filename="${fileName}"` },
      body: fileContent,
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: "Failed to download file", details: err.message }) };
  }
};
//aaaaa