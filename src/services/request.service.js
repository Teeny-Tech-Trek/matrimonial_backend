import Request from "../models/request.model.js";
import User from "../models/auth.model.js";

/**
 * Send new connection request
 */
export const sendRequest = async (senderId, receiverId) => {
  try {
    if (senderId.toString() === receiverId.toString()) {
      throw new Error("You cannot send request to yourself");
    }

    // Check if users exist
    const [sender, receiver] = await Promise.all([
      User.findById(senderId),
      User.findById(receiverId)
    ]);

    if (!sender || !receiver) {
      throw new Error("User not found");
    }
    console.log(sender, receiver);

    // Check for existing request in either direction
    const existingRequest = await Request.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    });

    if (existingRequest) {
      if (existingRequest.sender.toString() === senderId.toString()) {
        throw new Error("Request already sent");
      } else {
        throw new Error("This user has already sent you a request");
      }
    }

    // Calculate compatibility (simple implementation)
    const compatibility = calculateCompatibility(sender, receiver);

    const request = await Request.create({ 
      sender: senderId, 
      receiver: receiverId,
      compatibility 
    });
    
    // Populate the request before returning
    const populatedRequest = await Request.findById(request._id)
      .populate("sender", "fullName gender dateOfBirth profileCreatedFor education occupation location profilePhotos")
      .populate("receiver", "fullName gender dateOfBirth profileCreatedFor education occupation location profilePhotos");

    return populatedRequest;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Calculate compatibility between two users
 */
const calculateCompatibility = (user1, user2) => {
  let score = 0;
  let totalFactors = 0;

  // Education compatibility
  if (user1.education && user2.education) {
    totalFactors++;
    if (user1.education === user2.education) score += 25;
  }

  // Location compatibility (simple check)
  if (user1.location && user2.location) {
    totalFactors++;
    if (user1.location.toLowerCase() === user2.location.toLowerCase()) score += 25;
  }

  // Age compatibility
  if (user1.dateOfBirth && user2.dateOfBirth) {
    totalFactors++;
    const age1 = calculateAge(user1.dateOfBirth);
    const age2 = calculateAge(user2.dateOfBirth);
    const ageDiff = Math.abs(age1 - age2);
    
    if (ageDiff <= 2) score += 25;
    else if (ageDiff <= 5) score += 15;
    else score += 5;
  }

  // Profile created for compatibility
  if (user1.profileCreatedFor && user2.profileCreatedFor) {
    totalFactors++;
    if (user1.profileCreatedFor === user2.profileCreatedFor) score += 25;
  }

  return totalFactors > 0 ? Math.min(Math.round(score / totalFactors), 95) : Math.floor(Math.random() * 30) + 60;
};

const calculateAge = (dateOfBirth) => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Get received requests with proper population
 */
export const getReceivedRequests = async (userId) => {
  try {
    const requests = await Request.find({ receiver: userId, status: { $in: ['pending', 'accepted', 'rejected'] } })
      .populate("sender", "fullName gender dateOfBirth profileCreatedFor education occupation location profilePhotos")
      .populate("receiver", "fullName gender dateOfBirth profileCreatedFor education occupation location profilePhotos")
      .sort({ createdAt: -1 })
      .lean();

    return requests.map(request => ({
      ...request,
      sender: request.sender ? {
        ...request.sender,
        _id: request.sender._id.toString()
      } : null,
      receiver: request.receiver ? {
        ...request.receiver,
        _id: request.receiver._id.toString()
      } : null
    }));
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Get sent requests with proper population
 */
export const getSentRequests = async (userId) => {
  try {
    const requests = await Request.find({ sender: userId, status: { $in: ['pending', 'accepted', 'rejected'] } })
      .populate("sender", "fullName gender dateOfBirth profileCreatedFor education occupation location profilePhotos")
      .populate("receiver", "fullName gender dateOfBirth profileCreatedFor education occupation location profilePhotos")
      .sort({ createdAt: -1 })
      .lean();

    return requests.map(request => ({
      ...request,
      sender: request.sender ? {
        ...request.sender,
        _id: request.sender._id.toString()
      } : null,
      receiver: request.receiver ? {
        ...request.receiver,
        _id: request.receiver._id.toString()
      } : null
    }));
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Accept or Reject a request
 */
export const updateRequestStatus = async (requestId, userId, status) => {
  try {
    const request = await Request.findById(requestId)
      .populate("sender", "fullName gender dateOfBirth profileCreatedFor education occupation location profilePhotos")
      .populate("receiver", "fullName gender dateOfBirth profileCreatedFor education occupation location profilePhotos");

    if (!request) {
      throw new Error("Request not found");
    }

    // Check if user is the receiver of this request
    if (request.receiver._id.toString() !== userId.toString()) {
      throw new Error("Not authorized to update this request");
    }

    request.status = status;
    await request.save();

    return {
      ...request.toObject(),
      sender: request.sender ? {
        ...request.sender.toObject(),
        _id: request.sender._id.toString()
      } : null,
      receiver: request.receiver ? {
        ...request.receiver.toObject(),
        _id: request.receiver._id.toString()
      } : null
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Delete request
 */
export const deleteRequest = async (requestId, userId) => {
  try {
    const request = await Request.findById(requestId);

    if (!request) {
      throw new Error("Request not found");
    }

    // Check if user is either sender or receiver
    if (
      request.sender.toString() !== userId.toString() &&
      request.receiver.toString() !== userId.toString()
    ) {
      throw new Error("Not authorized to delete this request");
    }

    await Request.findByIdAndDelete(requestId);
    
    return { message: "Request deleted successfully" };
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Get request counts for dashboard
 */
export const getRequestCounts = async (userId) => {
  try {
    const [receivedCount, sentCount, pendingReceivedCount] = await Promise.all([
      Request.countDocuments({ receiver: userId }),
      Request.countDocuments({ sender: userId }),
      Request.countDocuments({ receiver: userId, status: 'pending' })
    ]);

    return {
      received: receivedCount,
      sent: sentCount,
      pending: pendingReceivedCount
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const fetchAcceptedConnections = async (userId) => {
  const received = await Request.find({
    receiver: userId,
    status: "accepted",
  }).populate("sender", "name avatar");

  const sent = await Request.find({
    sender: userId,
    status: "accepted",
  }).populate("receiver", "name avatar");

  // Combine both lists
  const connections = [
    ...received.map((req) => ({
      _id: req.sender._id,
      name: req.sender.name,
      avatar: req.sender.avatar,
    })),
    ...sent.map((req) => ({
      _id: req.receiver._id,
      name: req.receiver.name,
      avatar: req.receiver.avatar,
    })),
  ];

  // Deduplicate users by ID
  const uniqueConnections = Array.from(
    new Map(connections.map((user) => [user._id, user])).values()
  );

  return uniqueConnections;
};