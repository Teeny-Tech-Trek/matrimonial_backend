// import { PutObjectCommand } from "@aws-sdk/client-s3";
// import s3 from "../config/s3.js";

// const uploadToS3 = async (file) => {
//   const fileKey = `uploads/${Date.now()}-${file.originalname}`;

//   const command = new PutObjectCommand({
//     Bucket: process.env.AWS_BUCKET_NAME,
//     Key: fileKey,
//     Body: file.buffer,
//     ContentType: file.mimetype,
//     // ACL: "public-read",
//   });

//   await s3.send(command);

//   return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
// };

// export default uploadToS3;

import express from "express";
import upload from "../middlewares/upload.middleware.js";
import uploadToS3 from "../utils/s3Upload.js";

const router = express.Router();

router.post("/upload-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: "No image provided" 
      });
    }

    const imageUrl = await uploadToS3(req.file);

    res.status(200).json({
      success: true,
      imageUrl,
      message: "Image uploaded successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Image upload failed",
    });
  }
});

export default router;