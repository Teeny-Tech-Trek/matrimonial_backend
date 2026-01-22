import {
  upsertProfile,
  getProfileById,
  getProfileByUserId,
  getAllProfiles,
  deleteProfile,
} from "../services/profile.service.js";

/**
 * Create or Update Profile
 */
export const saveProfile = async (req, res) => {
  try {
    console.log("💾 saveProfile called");
    const userId = req.user?._id || req.body.userId;
    if (!userId) {
      console.log("❌ No userId found");
      return res.status(400).json({ success: false, error: "User ID required" });
    }

    const profile = await upsertProfile(userId, req.body);
    res.status(200).json({
      success: true,
      message: "Profile saved successfully",
      data: profile,
    });
  } catch (err) {
    console.error("❌ saveProfile error:", err);
    res.status(400).json({ success: false, error: err.message });
  }
};

/**
 * Get Profile by ID
 */
export const getProfile = async (req, res) => {
  try {
    console.log("🔍 getProfile called for ID:", req.params.id);
    const { id } = req.params;
    const profile = await getProfileById(id);
    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    console.error("❌ getProfile error:", err);
    res.status(404).json({ success: false, error: err.message });
  }
};

/**
 * Get My Profile (using logged-in user)
 */
export const getMyProfile = async (req, res) => {
  try {
    console.log("👤 getMyProfile called");
    console.log("User from req:", req.user);
    
    const userId = req.user?._id;
    
    if (!userId) {
      console.log("❌ No userId in req.user");
      return res.status(401).json({ 
        success: false, 
        error: "User not authenticated" 
      });
    }

    console.log("🔍 Fetching profile for userId:", userId);
    const profile = await getProfileByUserId(userId);
    
    console.log("✅ Profile found:", profile._id);
    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    console.error("❌ getMyProfile error:", err.message);
    
    // If profile doesn't exist, return 404 with helpful message
    if (err.message === "Profile not found") {
      return res.status(404).json({ 
        success: false, 
        error: "Profile not found. Please create your profile first." 
      });
    }
    
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Get All Profiles (For Matchmaking / Discovery)
 */
export const listProfiles = async (req, res) => {
  try {
    console.log("📋 listProfiles called with filters:", req.query);
    const filters = req.query;

    const result = await getAllProfiles(filters);

    res.status(200).json({
      success: true,
      total: result.total,
      page: result.page,
      limit: result.limit,
      pages: result.pages,
      count: result.data.length,
      data: result.data,
    });
  } catch (err) {
    console.error("❌ listProfiles error:", err);
    res.status(400).json({
      success: false,
      error: err.message || "Something went wrong while fetching profiles.",
    });
  }
};

/**
 * Delete My Profile
 */
export const removeProfile = async (req, res) => {
  try {
    console.log("🗑️ removeProfile called");
    const userId = req.user?._id;
    const result = await deleteProfile(userId);
    res.status(200).json({ success: true, message: result.message });
  } catch (err) {
    console.error("❌ removeProfile error:", err);
    res.status(400).json({ success: false, error: err.message });
  }
};