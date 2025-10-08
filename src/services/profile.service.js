import Profile from "../models/profile.model.js";

/**
 * Create or Update User Profile
 */
export const upsertProfile = async (userId, data) => {
  const profile = await Profile.findOneAndUpdate(
    { userId },
    { $set: data },
    { new: true, upsert: true }
  );
  return profile;
};

/**
 * Get Profile by ID
 */
export const getProfileById = async (id) => {
  const profile = await Profile.findById(id);
  if (!profile) throw new Error("Profile not found");
  return profile;
};

/**
 * Get Profile by User ID
 */
export const getProfileByUserId = async (userId) => {
  const profile = await Profile.findOne({ userId });
  if (!profile) throw new Error("Profile not found");
  return profile;
};

/**
 * Get All Profiles (For Matches / Discovery)
 */
export const getAllProfiles = async (filters = {}) => {
  const query = {};

  if (filters.gender) query.gender = filters.gender;
  if (filters.religion) query["religiousDetails.religion"] = filters.religion;
  if (filters.city) query["familyDetails.currentResidenceCity"] = filters.city;

  const profiles = await Profile.find(query).limit(50).sort({ createdAt: -1 });
  return profiles;
};

/**
 * Delete Profile
 */
export const deleteProfile = async (userId) => {
  const profile = await Profile.findOneAndDelete({ userId });
  if (!profile) throw new Error("Profile not found or already deleted");
  return { message: "Profile deleted successfully" };
};
