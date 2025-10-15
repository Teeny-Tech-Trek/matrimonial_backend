// controllers/admin.controller.js
import AdminService from "../services/admin.service.js";
import { Readable } from "stream";

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
