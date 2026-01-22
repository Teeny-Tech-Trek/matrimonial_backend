import express from "express";
import upload from "../middlewares/upload.middleware.js";
import uploadToS3 from "../utils/s3Upload.js";

const router = express.Router();

router.post("/upload-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image provided" });
    }

    const imageUrl = await uploadToS3(req.file);

    res.status(200).json({
      success: true,
      imageUrl,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Image upload failed",
    });
  }
});

export default router;
