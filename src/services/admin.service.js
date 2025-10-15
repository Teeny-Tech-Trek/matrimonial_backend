// services/admin.service.js
import mongoose from "mongoose";
import User from "../models/auth.model.js";
import Profile from "../models/profile.model.js";
import Request from "../models/request.model.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

/**
 * AdminService: functions used by admin controllers
 */
class AdminService {
  // --- Basic stats for dashboard header
  static async getSiteStats() {
    const [usersCount, activeProfiles, pendingPhotos, requestsCount, conversationsCount] =
      await Promise.all([
        User.countDocuments({}),
        Profile.countDocuments({}),
        Profile.countDocuments({ "photos.status": "pending" }),
        Request.countDocuments({}),
        Conversation.countDocuments({}),
      ]);

    return {
      users: usersCount,
      profiles: activeProfiles,
      pendingPhotos,
      requests: requestsCount,
      conversations: conversationsCount,
    };
  }

  // --- Paginated user listing + search + filter by role / active
  static async listUsers({ page = 1, limit = 20, role, search, isActive } = {}) {
    const query = {};
    if (role) query.role = role;
    if (typeof isActive !== "undefined") query.isActive = isActive === "true" || isActive === true;
    if (search) {
      const re = new RegExp(search, "i");
      query.$or = [{ fullName: re }, { phoneNumber: re }];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      User.find(query).select("-password").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(query),
    ]);

    return { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit), data };
  }

  static async getUserById(userId) {
    const user = await User.findById(userId).select("-password");
    if (!user) throw new Error("User not found");
    return user;
  }

  static async updateUserRole(userId, updates = {}) {
    const allowed = ["role", "isActive", "fullName", "avatar"];
    const payload = {};
    for (const k of Object.keys(updates)) {
      if (allowed.includes(k)) payload[k] = updates[k];
    }
    const user = await User.findByIdAndUpdate(userId, payload, { new: true }).select("-password");
    if (!user) throw new Error("User not found");
    return user;
  }

  static async deleteUser(userId) {
    // Soft delete: set isActive false (safer)
    const user = await User.findByIdAndUpdate(userId, { isActive: false }, { new: true });
    if (!user) throw new Error("User not found");
    return user;
  }

  // --- Profile moderation
  static async listProfiles({ page = 1, limit = 20, status, search } = {}) {
    const query = {};
    if (typeof status !== "undefined") {
      if (status === "verified") query.isVerified = true;
      else if (status === "unverified") query.isVerified = false;
    }
    if (search) {
      const re = new RegExp(search, "i");
      query.$or = [{ fullName: re }, { "familyDetails.currentResidenceCity": re }];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      Profile.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate("userId", "fullName phoneNumber avatar"),
      Profile.countDocuments(query),
    ]);
    return { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit), data };
  }

  static async verifyProfile(profileId, verified = true) {
    const profile = await Profile.findByIdAndUpdate(profileId, { isVerified: verified }, { new: true });
    if (!profile) throw new Error("Profile not found");
    return profile;
  }

  // --- Photo moderation
  static async moderatePhoto(profileId, photoId, status = "approved") {
    const profile = await Profile.findById(profileId);
    if (!profile) throw new Error("Profile not found");
    const photo = profile.photos.id(photoId);
    if (!photo) throw new Error("Photo not found");
    photo.status = status;
    await profile.save();
    return profile;
  }

  // --- Requests (connections) analytics / management
  static async listRequests({ page = 1, limit = 20, status, search } = {}) {
    const query = {};
    if (status) query.status = status;
    if (search) {
      const re = new RegExp(search, "i");
      query.$or = [{}, {}]; // placeholder; will populate below using aggregation
    }

    const skip = (Number(page) - 1) * Number(limit);
    const requests = await Request.find(query)
      .populate("sender", "fullName phoneNumber avatar")
      .populate("receiver", "fullName phoneNumber avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Request.countDocuments(query);
    return { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit), data: requests };
  }

  // --- Conversations overview for admin
  static async listConversations({ page = 1, limit = 20, search } = {}) {
    const skip = (Number(page) - 1) * Number(limit);
    const query = {};
    // we can support search by participant name using populate and filter on client side
    const conversations = await Conversation.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("participants", "fullName avatar")
      .populate("lastMessage");
    const total = await Conversation.countDocuments(query);
    return { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit), data: conversations };
  }

  // --- Export simple CSV for users (returns string)
  static async exportUsersCSV({ role } = {}) {
    const query = {};
    if (role) query.role = role;
    const users = await User.find(query).select("fullName phoneNumber role createdAt").lean();
    const header = ["Full Name", "Phone", "Role", "Created At"];
    const rows = users.map(u => [u.fullName, u.phoneNumber, u.role, new Date(u.createdAt).toISOString()]);
    const csv = [header.join(","), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
    return csv;
  }

  // --- Quick admin search across users & profiles
  static async quickSearch(term, limit = 20) {
    if (!term) return { users: [], profiles: [] };
    const re = new RegExp(term, "i");
    const [users, profiles] = await Promise.all([
      User.find({ $or: [{ fullName: re }, { phoneNumber: re }] }).limit(limit).select("-password").lean(),
      Profile.find({ $or: [{ fullName: re }, { "familyDetails.currentResidenceCity": re }] }).limit(limit).lean(),
    ]);
    return { users, profiles };
  }
}

export default AdminService;
