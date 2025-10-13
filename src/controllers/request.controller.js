import {
  sendRequest,
  getReceivedRequests,
  getSentRequests,
  updateRequestStatus,
  deleteRequest,
  getRequestCounts,
  fetchAcceptedConnections,
} from "../services/request.service.js";

/**
 * Send Connection Request
 */
export const createRequest = async (req, res) => {
  try {
    const senderId = req.user?._id;
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({ 
        success: false, 
        error: "Receiver ID is required" 
      });
    }

    const request = await sendRequest(senderId, receiverId);

    res.status(201).json({ 
      success: true, 
      message: "Request sent successfully", 
      data: request 
    });
  } catch (err) {
    res.status(400).json({ 
      success: false, 
      error: err.message 
    });
  }
};

/**
 * Get all received requests for logged-in user
 */
export const getMyReceivedRequests = async (req, res) => {
  try {
    const userId = req.user?._id;
    const requests = await getReceivedRequests(userId);
    
    res.status(200).json({ 
      success: true, 
      data: requests,
      count: requests.length
    });
  } catch (err) {
    res.status(400).json({ 
      success: false, 
      error: err.message 
    });
  }
};

/**
 * Get all sent requests for logged-in user
 */
export const getMySentRequests = async (req, res) => {
  try {
    const userId = req.user?._id;
    const requests = await getSentRequests(userId);
    
    res.status(200).json({ 
      success: true, 
      data: requests,
      count: requests.length
    });
  } catch (err) {
    res.status(400).json({ 
      success: false, 
      error: err.message 
    });
  }
};

/**
 * Accept or Reject Request
 */
export const updateStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;
    const userId = req.user?._id;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid status. Must be 'accepted' or 'rejected'" 
      });
    }

    const updatedRequest = await updateRequestStatus(requestId, userId, status);

    res.status(200).json({
      success: true,
      message: `Request ${status} successfully`,
      data: updatedRequest,
    });
  } catch (err) {
    res.status(400).json({ 
      success: false, 
      error: err.message 
    });
  }
};

/**
 * Delete Request
 */
export const removeRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user?._id;

    const result = await deleteRequest(requestId, userId);
    
    res.status(200).json({ 
      success: true, 
      message: result.message 
    });
  } catch (err) {
    res.status(400).json({ 
      success: false, 
      error: err.message 
    });
  }
};

/**
 * Get request counts for dashboard
 */
export const getRequestStatistics = async (req, res) => {
  try {
    const userId = req.user?._id;
    const counts = await getRequestCounts(userId);
    
    res.status(200).json({ 
      success: true, 
      data: counts 
    });
  } catch (err) {
    res.status(400).json({ 
      success: false, 
      error: err.message 
    });
  }
};
/** request.controller.js */
export const getAcceptedConnections = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) throw new Error("User not authenticated");

    const connections = await fetchAcceptedConnections(userId);
    res
      .status(200)
      .json({ success: true, data: connections, count: connections.length });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};