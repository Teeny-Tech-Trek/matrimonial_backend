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

  // 🧍 Basic Filters
  if (filters.gender) query.gender = filters.gender;
  if (filters.maritalStatus) query["personalDetails.maritalStatus"] = filters.maritalStatus;
  if (filters.motherTongue) query["personalDetails.motherTongue"] = filters.motherTongue;

  // 🧠 Religion & Community
  if (filters.religion) query["religiousDetails.religion"] = filters.religion;
  if (filters.caste) query["religiousDetails.caste"] = filters.caste;
  if (filters.subCaste) query["religiousDetails.subCaste"] = filters.subCaste;
  if (filters.manglik) query["religiousDetails.manglik"] = filters.manglik === "true";

  // 🏙️ Family & Location
  if (filters.city) query["familyDetails.currentResidenceCity"] = filters.city;
  if (filters.state) query["familyDetails.currentResidenceState"] = filters.state;
  if (filters.familyType) query["familyDetails.familyType"] = filters.familyType;

  // 🎓 Education & Career
  if (filters.highestEducation) query["educationDetails.highestEducation"] = filters.highestEducation;
  if (filters.educationField) query["educationDetails.educationField"] = filters.educationField;
  if (filters.occupation) query["professionalDetails.occupation"] = filters.occupation;

  // 💰 Income Range
  if (filters.annualIncomeMin || filters.annualIncomeMax) {
    query["professionalDetails.annualIncomeMin"] = {};
    if (filters.annualIncomeMin) query["professionalDetails.annualIncomeMin"].$gte = Number(filters.annualIncomeMin);
    if (filters.annualIncomeMax) query["professionalDetails.annualIncomeMin"].$lte = Number(filters.annualIncomeMax);
  }

  // 📏 Height Filter
  if (filters.heightMin || filters.heightMax) {
    query["personalDetails.heightCm"] = {};
    if (filters.heightMin) query["personalDetails.heightCm"].$gte = Number(filters.heightMin);
    if (filters.heightMax) query["personalDetails.heightCm"].$lte = Number(filters.heightMax);
  }

  // 🧓 Age Range (convert from DOB)
  if (filters.ageMin || filters.ageMax) {
    const today = new Date();
    const minDOB = filters.ageMax
      ? new Date(today.getFullYear() - Number(filters.ageMax), today.getMonth(), today.getDate())
      : null;
    const maxDOB = filters.ageMin
      ? new Date(today.getFullYear() - Number(filters.ageMin), today.getMonth(), today.getDate())
      : null;

    query.dateOfBirth = {};
    if (minDOB) query.dateOfBirth.$lte = minDOB;
    if (maxDOB) query.dateOfBirth.$gte = maxDOB;
  }

  // 🌿 Lifestyle
  if (filters.diet) query["lifestylePreferences.diet"] = filters.diet;
  if (filters.smoking) query["lifestylePreferences.smoking"] = filters.smoking === "true";
  if (filters.drinking) query["lifestylePreferences.drinking"] = filters.drinking === "true";

  // ✅ Verified & Subscription
  if (filters.isVerified) query.isVerified = filters.isVerified === "true";
  if (filters.subscriptionTier) query["subscription.tier"] = filters.subscriptionTier;

  // 🔎 Pagination
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 20;
  const skip = (page - 1) * limit;

  // 🧭 Sorting
  const sortBy = filters.sortBy || "createdAt";
  const sortOrder = filters.sortOrder === "asc" ? 1 : -1;

  // 🧩 Fetch Profiles
  const profiles = await Profile.find(query)
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);

  // 🧮 Count Total
  const total = await Profile.countDocuments(query);

  return {
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
    data: profiles,
  };
};


/**
 * Delete Profile
 */
export const deleteProfile = async (userId) => {
  const profile = await Profile.findOneAndDelete({ userId });
  if (!profile) throw new Error("Profile not found or already deleted");
  return { message: "Profile deleted successfully" };
};
