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
    const userId = req.user?._id || req.body.userId; // from auth middleware or request
    if (!userId) return res.status(400).json({ success: false, error: "User ID required" });

    const profile = await upsertProfile(userId, req.body);
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
    const profile = await getProfileByUserId(userId);
    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    res.status(404).json({ success: false, error: err.message });
  }
};

/**
 * Get All Profiles (For Matchmaking / Discovery)
 */
export const listProfiles = async (req, res) => {
  try {
    const filters = req.query;

    // Fetch filtered profiles
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
    console.error("Error in listProfiles:", err);
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
