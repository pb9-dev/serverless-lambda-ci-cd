const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3 = new S3Client({ region: "ap-south-1" });

exports.handler = async (event) => {
  try {
    const bucketName = "sample-bucket-redirectapi";
    let fileKey = "large-area-display-price-tracker--may-2024-analysis-pdf.pdf";

    fileKey = encodeURIComponent(fileKey);

    const command = new GetObjectCommand({ Bucket: bucketName, Key: fileKey });

    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 120 });

    console.log("Generated Presigned URL:", presignedUrl);

    return {
      statusCode: 200,
      body: JSON.stringify({ fileUrl: presignedUrl }),
    };
  } catch (err) {
    console.error("Error generating presigned URL:", err);
    return { statusCode: 500, body: "Internal Server Error" };
  }
};