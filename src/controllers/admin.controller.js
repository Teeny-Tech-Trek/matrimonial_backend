// controllers/admin.controller.js
import AdminService from "../services/admin.service.js";
import { Readable } from "stream";
import Review from "../models/review.model.js";

export const getAdminStats = async (req, res) => {
  try {
    const stats = await AdminService.getSiteStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || "Failed to fetch stats" });
  }
};

export const listUsers = async (req, res) => {
  try {
    const { page, limit, role, search, isActive } = req.query;
    const result = await AdminService.listUsers({ page, limit, role, search, isActive });
    res.json({ success: true, ...result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await AdminService.getUserById(req.params.userId);
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const updated = await AdminService.updateUserRole(req.params.userId, req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const deleted = await AdminService.deleteUser(req.params.userId);
    res.json({ success: true, data: deleted, message: "User deactivated" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ADD THIS - Permanent Delete (remove user completely)
export const permanentDeleteUser = async (req, res) => {
  try {
    const result = await AdminService.permanentDeleteUser(req.params.userId);
    res.json({ success: true, data: result, message: "User permanently deleted" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};






// profiles
export const listProfiles = async (req, res) => {
  try {
    const { page, limit, status, search } = req.query;
    const result = await AdminService.listProfiles({ page, limit, status, search });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const verifyProfile = async (req, res) => {
  try {
    const profile = await AdminService.verifyProfile(req.params.profileId, req.body.isVerified);
    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const moderatePhoto = async (req, res) => {
  try {
    const profile = await AdminService.moderatePhoto(req.params.profileId, req.params.photoId, req.body.status);
    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete profile (permanent) - removes profile and related data
export const deleteProfile = async (req, res) => {
  try {
    const result = await AdminService.deleteProfile(req.params.profileId);
    res.json({ success: true, data: result, message: "Profile permanently deleted" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// requests
export const listRequests = async (req, res) => {
  try {
    const { page, limit, status, search } = req.query;
    const result = await AdminService.listRequests({ page, limit, status, search });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// conversations
export const listConversations = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const result = await AdminService.listConversations({ page, limit, search });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// export CSV
export const exportUsers = async (req, res) => {
  try {
    const csv = await AdminService.exportUsersCSV(req.query);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="users_${Date.now()}.csv"`);
    // send as stream
    const stream = Readable.from(csv);
    stream.pipe(res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// quick search
export const quickSearch = async (req, res) => {
  try {
    const { q } = req.query;
    const data = await AdminService.quickSearch(q, 20);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const listReviews = async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const status = req.query.status || "";
    const search = req.query.search || "";

    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
        { text: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Review.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Review.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || "Failed to fetch reviews" });
  }
};

export const updateReviewStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["hold", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const updated = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { status, moderatedAt: new Date(), moderatedBy: req.user?._id || null },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    return res.json({ success: true, data: updated, message: "Review status updated" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || "Failed to update review status" });
  }
};
