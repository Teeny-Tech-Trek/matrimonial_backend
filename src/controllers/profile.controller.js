import {
  upsertProfile,
  getProfileById,
  getProfileByUserId,
  getAllProfiles,
  deleteProfile,
  saveSearchPreferences,
} from "../services/profile.service.js";

/**
 * Create or Update Profile
 */
export const saveProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;
    if (!userId) {
      return res.status(400).json({ success: false, error: "User ID required" });
    }

    const email = String(req.body?.email || "").trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required" });
    }
    if (!emailPattern.test(email)) {
      return res.status(400).json({ success: false, error: "Invalid email format" });
    }

    const payload = { ...req.body, email };

    const profile = await upsertProfile(userId, payload);
    res.status(200).json({
      success: true,
      message: "Profile saved successfully",
      data: profile,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

/**
 * Get Profile by ID
 */
export const getProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await getProfileById(id);
    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    res.status(404).json({ success: false, error: err.message });
  }
};

/**
 * Get My Profile (using logged-in user)
 */
export const getMyProfile = async (req, res) => {
  try {
    
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: "User not authenticated" 
      });
    }

    const profile = await getProfileByUserId(userId);
    return res.status(200).json({ success: true, data: profile });
  } catch (err) {
    // For users who haven't completed profile yet, return success with null data
    if (err.message === "Profile not found") {
      return res.status(200).json({
        success: true,
        data: null,
        message: "Profile not found",
      });
    }

    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Get All Profiles (For Matchmaking / Discovery)
 */
export const listProfiles = async (req, res) => {
  try {
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
    const userId = req.user?._id;
    const result = await deleteProfile(userId);
    res.status(200).json({ success: true, message: result.message });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

/**
 * Save search preferences for logged-in user profile
 */
export const updateSearchPreferences = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "User not authenticated" });
    }

    const allowed = ["gender", "state", "religion", "maritalStatus", "diet", "ageMin", "ageMax"];
    const payload = {};
    for (const key of allowed) {
      payload[key] = req.body?.[key] || "";
    }

    const preferences = await saveSearchPreferences(userId, payload);
    return res.status(200).json({
      success: true,
      message: "Search preferences saved",
      data: preferences,
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
};
