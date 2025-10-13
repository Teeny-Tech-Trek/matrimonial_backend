import mongoose from "mongoose";
import Profile from "../models/profile.model.js";
import Request from "../models/request.model.js";
import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import User from "../models/auth.model.js";

class DashboardService {
  /**
   * Fetches complete dashboard data for a user
   */
  static async getDashboardData(userId) {
    try {
      const [stats, recommendedProfiles, pendingRequests, quickFilters] = await Promise.all([
        this.getDashboardStats(userId),
        this.getRecommendedProfiles(userId, 1, 6),
        this.getPendingRequestsCount(userId),
        this.getQuickFilters(userId),
      ]);

      return {
        stats,
        recommendedProfiles,
        pendingRequests,
        quickFilters,
        quickActions: this.getQuickActions(),
      };
    } catch (error) {
      console.error("❌ Error in getDashboardData:", error);
      throw new Error("Failed to load dashboard data");
    }
  }

  // ============================================================
  // 📊 DASHBOARD STATS
  // ============================================================

  static async getDashboardStats(userId) {
    try {
      const [
        profileViews,
        interestsReceived,
        unreadMessages,
        matches,
        pendingRequests,
        profileCompletion,
      ] = await Promise.all([
        this.getProfileViews(userId),
        this.getInterestsReceived(userId),
        this.getUnreadMessagesCount(userId),
        this.getMatchesCount(userId),
        this.getPendingRequestsCount(userId),
        this.calculateProfileCompletion(userId),
      ]);

      return {
        profileViews,
        interests: interestsReceived,
        messages: unreadMessages,
        matches,
        pendingRequests,
        profileCompletion,
      };
    } catch (error) {
      console.error("Error getting dashboard stats:", error);
      return {
        profileViews: 0,
        interests: 0,
        messages: 0,
        matches: 0,
        pendingRequests: 0,
        profileCompletion: 0,
      };
    }
  }

  // ============================================================
  // 💞 RECOMMENDED PROFILES
  // ============================================================

  static async getRecommendedProfiles(userId, page = 1, limit = 20, filters = {}) {
    try {
      const userProfile = await Profile.findOne({ userId });
      if (!userProfile) return [];

      const skip = (page - 1) * limit;

      // 🧠 Match opposite gender + optional filters
      const matchCriteria = {
        userId: { $ne: new mongoose.Types.ObjectId(userId) },
        gender: userProfile.gender === "male" ? "female" : "male", // ✅ Fixed: show opposite gender
      };

      if (userProfile.religiousDetails?.religion) {
        matchCriteria["religiousDetails.religion"] = userProfile.religiousDetails.religion;
      }
      if (userProfile.familyDetails?.currentResidenceCity) {
        matchCriteria["familyDetails.currentResidenceCity"] =
          userProfile.familyDetails.currentResidenceCity;
      }

      const profiles = await Profile.aggregate([
        { $match: matchCriteria },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $addFields: {
            age: {
              $floor: {
                $divide: [
                  { $subtract: [new Date(), "$dateOfBirth"] },
                  365 * 24 * 60 * 60 * 1000,
                ],
              },
            },
            compatibility: {
              $literal: 0, // Placeholder — we’ll compute later
            },
          },
        },
        {
          $project: {
            "user.password": 0,
            "user.phoneNumber": 0,
            "user.__v": 0,
            "__v": 0,
          },
        },
        { $sort: { createdAt: -1 } },
      ]);

      // Post-process compatibility in JS for accuracy
      return profiles.map((p) => ({
        ...p,
        compatibility: this.calculateCompatibility(userProfile, p),
      }));
    } catch (error) {
      console.error("Error getting recommended profiles:", error);
      throw new Error("Failed to fetch recommended profiles");
    }
  }

  // ============================================================
  // ⚡ QUICK FILTERS
  // ============================================================

  static async getQuickFilters(userId) {
    try {
      const userProfile = await Profile.findOne({ userId });
      if (!userProfile) return [];

      const baseCriteria = {
        userId: { $ne: new mongoose.Types.ObjectId(userId) },
        gender: userProfile.gender === "male" ? "female" : "male",
      };

      const filters = [];

      const [allCount, religionCount, cityCount, educationCount] = await Promise.all([
        Profile.countDocuments(baseCriteria),
        userProfile.religiousDetails?.religion
          ? Profile.countDocuments({
              ...baseCriteria,
              "religiousDetails.religion": userProfile.religiousDetails.religion,
            })
          : 0,
        userProfile.familyDetails?.currentResidenceCity
          ? Profile.countDocuments({
              ...baseCriteria,
              "familyDetails.currentResidenceCity":
                userProfile.familyDetails.currentResidenceCity,
            })
          : 0,
        userProfile.educationDetails?.highestEducation
          ? Profile.countDocuments({
              ...baseCriteria,
              "educationDetails.highestEducation":
                userProfile.educationDetails.highestEducation,
            })
          : 0,
      ]);

      filters.push(
        { id: "all", name: "All Profiles", icon: "Users", count: allCount },
        ...(userProfile.religiousDetails?.religion
          ? [{ id: "religion", name: "Same Religion", icon: "Star", count: religionCount }]
          : []),
        ...(userProfile.familyDetails?.currentResidenceCity
          ? [{ id: "city", name: "Same City", icon: "MapPin", count: cityCount }]
          : []),
        ...(userProfile.educationDetails?.highestEducation
          ? [{ id: "education", name: "Similar Education", icon: "GraduationCap", count: educationCount }]
          : [])
      );

      return filters;
    } catch (error) {
      console.error("Error getting quick filters:", error);
      return [];
    }
  }

  // ============================================================
  // 🧮 COMPATIBILITY LOGIC
  // ============================================================

  static calculateCompatibility(userProfile, targetProfile) {
    try {
      let score = 0;

      const { religiousDetails, familyDetails, educationDetails, professionalDetails } =
        userProfile;

      if (
        religiousDetails?.religion &&
        targetProfile.religiousDetails?.religion === religiousDetails.religion
      )
        score += 30;

      if (
        familyDetails?.currentResidenceCity &&
        targetProfile.familyDetails?.currentResidenceCity === familyDetails.currentResidenceCity
      )
        score += 25;

      if (
        educationDetails?.highestEducation &&
        targetProfile.educationDetails?.highestEducation ===
          educationDetails.highestEducation
      )
        score += 20;

      const userAge = this.calculateAge(userProfile.dateOfBirth);
      const targetAge = this.calculateAge(targetProfile.dateOfBirth);
      const diff = Math.abs(userAge - targetAge);
      score += diff <= 5 ? 15 : diff <= 10 ? 10 : 5;

      if (professionalDetails?.occupation && targetProfile.professionalDetails?.occupation)
        score += 10;

      return Math.min(Math.round(score), 95);
    } catch {
      return 0;
    }
  }

  static calculateAge(dob) {
    return Math.floor((Date.now() - new Date(dob)) / (365 * 24 * 60 * 60 * 1000));
  }

  // ============================================================
  // 📈 HELPER COUNTS
  // ============================================================

  static async getProfileViews() {
    return Math.floor(Math.random() * 50) + 10;
  }

  static async getInterestsReceived(userId) {
    return await Request.countDocuments({
      receiver: userId,
      status: "pending",
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });
  }

  static async getUnreadMessagesCount(userId) {
    const conversations = await Conversation.find({ participants: userId }).populate("lastMessage");

    let unreadCount = 0;
    conversations.forEach((c) => {
      if (c.unreadCount && c.unreadCount.get(userId.toString())) {
        unreadCount += c.unreadCount.get(userId.toString());
      }
    });

    return unreadCount;
  }

  static async getMatchesCount(userId) {
    return await Request.countDocuments({
      $or: [
        { sender: userId, status: "accepted" },
        { receiver: userId, status: "accepted" },
      ],
    });
  }

  static async getPendingRequestsCount(userId) {
    return await Request.countDocuments({ receiver: userId, status: "pending" });
  }

  static async calculateProfileCompletion(userId) {
    const profile = await Profile.findOne({ userId });
    if (!profile) return 20;

    let completed = 20;
    const checks = [
      profile.personalDetails?.heightCm,
      profile.religiousDetails?.religion,
      profile.educationDetails?.highestEducation,
      profile.professionalDetails?.occupation,
      profile.familyDetails?.currentResidenceCity,
      profile.lifestylePreferences?.aboutMe,
    ];

    completed += checks.filter(Boolean).length * 13;
    return Math.min(completed, 100);
  }

  // ============================================================
  // ⚡ QUICK ACTIONS
  // ============================================================

  static getQuickActions() {
    return [
      {
        id: "complete-profile",
        title: "Complete Profile",
        description: "Add more details to get better matches",
        icon: "UserCheck",
        action: "profile-setup",
        priority: "high",
      },
      {
        id: "view-requests",
        title: "View Requests",
        description: "Check your connection requests",
        icon: "UserPlus",
        action: "requests",
        priority: "medium",
      },
      {
        id: "upgrade-membership",
        title: "Upgrade Membership",
        description: "Get premium features",
        icon: "Crown",
        action: "membership",
        priority: "low",
      },
    ];
  }
}

export default DashboardService;
