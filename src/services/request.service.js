// import Request from "../models/request.model.js";
// import User from "../models/auth.model.js";
// import Profile from "../models/profile.model.js";

// // ─────────────────────────────────────────────

// // ─────────────────────────────────────────────
// const attachPhotosToUser = async (user) => {
//   if (!user) return null;

//   const profile = await Profile.findOne({ userId: user._id })
//     .select("photos")
//     .lean();

//   // rejected photos exclude, pending + approved show karte hain
//   const photos =
//     profile?.photos
//       ?.filter((p) => p.status !== "rejected")
//       .map((p) => ({
//         photoUrl: p.photoUrl,
//         isPrimary: p.isPrimary,
//       })) || [];

//   // Primary photo pehle rakho
//   const primaryPhoto = photos.find((p) => p.isPrimary);
//   const profilePhotos = primaryPhoto
//     ? [primaryPhoto.photoUrl, ...photos.filter((p) => !p.isPrimary).map((p) => p.photoUrl)]
//     : photos.map((p) => p.photoUrl);

//   return {
//     ...user,
//     _id: user._id.toString(),
//     profilePhotos, // ✅ Frontend expects this field name
//   };
// };

// // ─────────────────────────────────────────────
// // Helper: request ke sender + receiver dono pe photos attach karta hai
// // ─────────────────────────────────────────────
// const attachPhotosToRequest = async (request) => {
//   const [sender, receiver] = await Promise.all([
//     attachPhotosToUser(request.sender),
//     attachPhotosToUser(request.receiver),
//   ]);

//   return {
//     ...request,
//     sender,
//     receiver,
//   };
// };

// /**
//  * Send new connection request
//  */
// export const sendRequest = async (senderId, receiverId) => {
//   try {
//     if (senderId.toString() === receiverId.toString()) {
//       throw new Error("You cannot send request to yourself");
//     }

//     // Check if users exist
//     const [sender, receiver] = await Promise.all([
//       User.findById(senderId),
//       User.findById(receiverId),
//     ]);

//     if (!sender || !receiver) {
//       throw new Error("User not found");
//     }

//     // Check for existing request in either direction
//     const existingRequest = await Request.findOne({
//       $or: [
//         { sender: senderId, receiver: receiverId },
//         { sender: receiverId, receiver: senderId },
//       ],
//     });

//     if (existingRequest) {
//       if (existingRequest.sender.toString() === senderId.toString()) {
//         throw new Error("Request already sent");
//       } else {
//         throw new Error("This user has already sent you a request");
//       }
//     }

//     // Calculate compatibility
//     const compatibility = calculateCompatibility(sender, receiver);

//     const request = await Request.create({
//       sender: senderId,
//       receiver: receiverId,
//       compatibility,
//     });

//     // Populate the request
//     const populatedRequest = await Request.findById(request._id)
//       .populate("sender", "fullName gender dateOfBirth profileCreatedFor education occupation location")
//       .populate("receiver", "fullName gender dateOfBirth profileCreatedFor education occupation location")
//       .lean();

//     // ✅ Profile se photos attach karo
//     const result = await attachPhotosToRequest(populatedRequest);

//     return result;
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

// /**
//  * Calculate compatibility between two users
//  */
// const calculateCompatibility = (user1, user2) => {
//   let score = 0;
//   let totalFactors = 0;

//   // Education compatibility
//   if (user1.education && user2.education) {
//     totalFactors++;
//     if (user1.education === user2.education) score += 25;
//   }

//   // Location compatibility
//   if (user1.location && user2.location) {
//     totalFactors++;
//     if (user1.location.toLowerCase() === user2.location.toLowerCase())
//       score += 25;
//   }

//   // Age compatibility
//   if (user1.dateOfBirth && user2.dateOfBirth) {
//     totalFactors++;
//     const age1 = calculateAge(user1.dateOfBirth);
//     const age2 = calculateAge(user2.dateOfBirth);
//     const ageDiff = Math.abs(age1 - age2);

//     if (ageDiff <= 2) score += 25;
//     else if (ageDiff <= 5) score += 15;
//     else score += 5;
//   }

//   // Profile created for compatibility
//   if (user1.profileCreatedFor && user2.profileCreatedFor) {
//     totalFactors++;
//     if (user1.profileCreatedFor === user2.profileCreatedFor) score += 25;
//   }

//   return totalFactors > 0
//     ? Math.min(Math.round(score / totalFactors), 95)
//     : Math.floor(Math.random() * 30) + 60;
// };

// const calculateAge = (dateOfBirth) => {
//   const birthDate = new Date(dateOfBirth);
//   const today = new Date();
//   let age = today.getFullYear() - birthDate.getFullYear();
//   const monthDiff = today.getMonth() - birthDate.getMonth();

//   if (
//     monthDiff < 0 ||
//     (monthDiff === 0 && today.getDate() < birthDate.getDate())
//   ) {
//     age--;
//   }

//   return age;
// };

// /**
//  * ✅ FIXED: Get received requests — Profile se photos attach karte hain
//  */
// export const getReceivedRequests = async (userId) => {
//   try {
//     const requests = await Request.find({
//       receiver: userId,
//       status: { $in: ["pending", "accepted", "rejected"] },
//     })
//       .populate("sender", "fullName gender dateOfBirth profileCreatedFor education occupation location")
//       .populate("receiver", "fullName gender dateOfBirth profileCreatedFor education occupation location")
//       .sort({ createdAt: -1 })
//       .lean();

//     // ✅ Har request pe Profile se photos attach karo
//     const result = await Promise.all(
//       requests.map((request) => attachPhotosToRequest(request))
//     );

//     return result;
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

// /**
//  * ✅ FIXED: Get sent requests — Profile se photos attach karte hain
//  */
// export const getSentRequests = async (userId) => {
//   try {
//     const requests = await Request.find({
//       sender: userId,
//       status: { $in: ["pending", "accepted", "rejected"] },
//     })
//       .populate("sender", "fullName gender dateOfBirth profileCreatedFor education occupation location")
//       .populate("receiver", "fullName gender dateOfBirth profileCreatedFor education occupation location")
//       .sort({ createdAt: -1 })
//       .lean();

//     // ✅ Har request pe Profile se photos attach karo
//     const result = await Promise.all(
//       requests.map((request) => attachPhotosToRequest(request))
//     );

//     return result;
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

// /**
//  * ✅ FIXED: Accept or Reject a request
//  */
// export const updateRequestStatus = async (requestId, userId, status) => {
//   try {
//     const request = await Request.findById(requestId)
//       .populate("sender", "fullName gender dateOfBirth profileCreatedFor education occupation location")
//       .populate("receiver", "fullName gender dateOfBirth profileCreatedFor education occupation location");

//     if (!request) {
//       throw new Error("Request not found");
//     }

//     if (request.receiver._id.toString() !== userId.toString()) {
//       throw new Error("Not authorized to update this request");
//     }

//     request.status = status;
//     await request.save();

//     // ✅ Profile se photos attach karo
//     const plain = request.toObject();
//     const result = await attachPhotosToRequest(plain);

//     return result;
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

// /**
//  * Delete request
//  */
// export const deleteRequest = async (requestId, userId) => {
//   try {
//     const request = await Request.findById(requestId);

//     if (!request) {
//       throw new Error("Request not found");
//     }

//     if (
//       request.sender.toString() !== userId.toString() &&
//       request.receiver.toString() !== userId.toString()
//     ) {
//       throw new Error("Not authorized to delete this request");
//     }

//     await Request.findByIdAndDelete(requestId);

//     return { message: "Request deleted successfully" };
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

// /**
//  * Get request counts for dashboard
//  */
// export const getRequestCounts = async (userId) => {
//   try {
//     const [receivedCount, sentCount, pendingReceivedCount] = await Promise.all([
//       Request.countDocuments({ receiver: userId }),
//       Request.countDocuments({ sender: userId }),
//       Request.countDocuments({ receiver: userId, status: "pending" }),
//     ]);

//     return {
//       received: receivedCount,
//       sent: sentCount,
//       pending: pendingReceivedCount,
//     };
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

// /**
//  * ✅ Fetch accepted connections WITH PROFILE PHOTOS
//  */
// export const fetchAcceptedConnections = async (userId) => {
//   try {
//     const [receivedRequests, sentRequests] = await Promise.all([
//       Request.find({
//         receiver: userId,
//         status: "accepted",
//       })
//         .populate("sender", "fullName email")
//         .lean(),
//       Request.find({
//         sender: userId,
//         status: "accepted",
//       })
//         .populate("receiver", "fullName email")
//         .lean(),
//     ]);

//     const allConnections = [
//       ...receivedRequests.map((req) => ({
//         _id: req.sender._id,
//         fullName: req.sender.fullName,
//         email: req.sender.email,
//       })),
//       ...sentRequests.map((req) => ({
//         _id: req.receiver._id,
//         fullName: req.receiver.fullName,
//         email: req.receiver.email,
//       })),
//     ];

//     // Deduplicate
//     const uniqueConnections = Array.from(
//       new Map(
//         allConnections.map((user) => [user._id.toString(), user]),
//       ).values(),
//     );

//     // ✅ Photos attach karo
//     const connectionsWithPhotos = await Promise.all(
//       uniqueConnections.map(async (user) => {
//         const profile = await Profile.findOne({ userId: user._id })
//           .select("photos")
//           .lean();

//         const photos =
//           profile?.photos
//             ?.filter((p) => p.status !== "rejected")
//             .map((p) => ({
//               photoUrl: p.photoUrl,
//               isPrimary: p.isPrimary,
//             })) || [];

//         return {
//           _id: user._id,
//           fullName: user.fullName,
//           email: user.email,
//           photos,
//         };
//       }),
//     );

//     return connectionsWithPhotos;
//   } catch (error) {
//     throw new Error(error.message || "Failed to fetch connections");
//   }
// };

import Request from "../models/request.model.js";
import User from "../models/auth.model.js";
import Profile from "../models/profile.model.js";

// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
const attachPhotosToUser = async (user) => {
  if (!user) return null;

  const profile = await Profile.findOne({ userId: user._id })
    .select("photos")
    .lean();

  // rejected photos exclude, pending + approved show karte hain
  const photos =
    profile?.photos
      ?.filter((p) => p.status !== "rejected")
      .map((p) => ({
        photoUrl: p.photoUrl,
        isPrimary: p.isPrimary,
      })) || [];

  // Primary photo pehle rakho
  const primaryPhoto = photos.find((p) => p.isPrimary);
  const profilePhotos = primaryPhoto
    ? [primaryPhoto.photoUrl, ...photos.filter((p) => !p.isPrimary).map((p) => p.photoUrl)]
    : photos.map((p) => p.photoUrl);

  return {
    ...user,
    _id: user._id.toString(),
    profilePhotos, // ✅ Frontend expects this field name
  };
};

// ─────────────────────────────────────────────
// Helper: request ke sender + receiver dono pe photos attach karta hai
// ─────────────────────────────────────────────
const attachPhotosToRequest = async (request) => {
  const [sender, receiver] = await Promise.all([
    attachPhotosToUser(request.sender),
    attachPhotosToUser(request.receiver),
  ]);

  return {
    ...request,
    sender,
    receiver,
  };
};

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
      User.findById(receiverId),
    ]);

    if (!sender || !receiver) {
      throw new Error("User not found");
    }

    // Check for existing request in either direction
    const existingRequest = await Request.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    });

    if (existingRequest) {
      if (existingRequest.sender.toString() === senderId.toString()) {
        throw new Error("Request already sent");
      } else {
        throw new Error("This user has already sent you a request");
      }
    }

    // Calculate compatibility
    const compatibility = calculateCompatibility(sender, receiver);

    const request = await Request.create({
      sender: senderId,
      receiver: receiverId,
      compatibility,
    });

    // Populate the request
    const populatedRequest = await Request.findById(request._id)
      .populate("sender", "fullName gender dateOfBirth profileCreatedFor education occupation location")
      .populate("receiver", "fullName gender dateOfBirth profileCreatedFor education occupation location")
      .lean();

    // ✅ Profile se photos attach karo
    const result = await attachPhotosToRequest(populatedRequest);

    return result;
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

  // Location compatibility
  if (user1.location && user2.location) {
    totalFactors++;
    if (user1.location.toLowerCase() === user2.location.toLowerCase())
      score += 25;
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

  return totalFactors > 0
    ? Math.min(Math.round(score / totalFactors), 95)
    : Math.floor(Math.random() * 30) + 60;
};

const calculateAge = (dateOfBirth) => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

/**
 * ✅ FIXED: Get received requests — Profile se photos attach karte hain
 */
export const getReceivedRequests = async (userId) => {
  try {
    const requests = await Request.find({
      receiver: userId,
      status: { $in: ["pending", "accepted", "rejected"] },
    })
      .populate("sender", "fullName gender dateOfBirth profileCreatedFor education occupation location")
      .populate("receiver", "fullName gender dateOfBirth profileCreatedFor education occupation location")
      .sort({ createdAt: -1 })
      .lean();

    // ✅ Har request pe Profile se photos attach karo
    const result = await Promise.all(
      requests.map((request) => attachPhotosToRequest(request))
    );

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * ✅ FIXED: Get sent requests — Profile se photos attach karte hain
 */
export const getSentRequests = async (userId) => {
  try {
    const requests = await Request.find({
      sender: userId,
      status: { $in: ["pending", "accepted", "rejected"] },
    })
      .populate("sender", "fullName gender dateOfBirth profileCreatedFor education occupation location")
      .populate("receiver", "fullName gender dateOfBirth profileCreatedFor education occupation location")
      .sort({ createdAt: -1 })
      .lean();

    // ✅ Har request pe Profile se photos attach karo
    const result = await Promise.all(
      requests.map((request) => attachPhotosToRequest(request))
    );

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * ✅ FIXED: Accept or Reject a request
 */
export const updateRequestStatus = async (requestId, userId, status) => {
  try {
    const request = await Request.findById(requestId)
      .populate("sender", "fullName gender dateOfBirth profileCreatedFor education occupation location")
      .populate("receiver", "fullName gender dateOfBirth profileCreatedFor education occupation location");

    if (!request) {
      throw new Error("Request not found");
    }

    if (request.receiver._id.toString() !== userId.toString()) {
      throw new Error("Not authorized to update this request");
    }

    request.status = status;
    await request.save();

    // ✅ Profile se photos attach karo
    const plain = request.toObject();
    const result = await attachPhotosToRequest(plain);

    return result;
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
      Request.countDocuments({ receiver: userId, status: "pending" }),
    ]);

    return {
      received: receivedCount,
      sent: sentCount,
      pending: pendingReceivedCount,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * ✅ Fetch accepted connections WITH PROFILE PHOTOS
 */
export const fetchAcceptedConnections = async (userId) => {
  try {
    const [receivedRequests, sentRequests] = await Promise.all([
      Request.find({
        receiver: userId,
        status: "accepted",
      })
        .populate("sender", "fullName email")
        .lean(),
      Request.find({
        sender: userId,
        status: "accepted",
      })
        .populate("receiver", "fullName email")
        .lean(),
    ]);

    const allConnections = [
      ...receivedRequests.map((req) => ({
        _id: req.sender._id,
        fullName: req.sender.fullName,
        email: req.sender.email,
      })),
      ...sentRequests.map((req) => ({
        _id: req.receiver._id,
        fullName: req.receiver.fullName,
        email: req.receiver.email,
      })),
    ];

    // Deduplicate
    const uniqueConnections = Array.from(
      new Map(
        allConnections.map((user) => [user._id.toString(), user]),
      ).values(),
    );

    // ✅ Photos attach karo
    const connectionsWithPhotos = await Promise.all(
      uniqueConnections.map(async (user) => {
        const profile = await Profile.findOne({ userId: user._id })
          .select("photos")
          .lean();

        const photos =
          profile?.photos
            ?.filter((p) => p.status !== "rejected")
            .map((p) => ({
              photoUrl: p.photoUrl,
              isPrimary: p.isPrimary,
            })) || [];

        return {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          photos,
        };
      }),
    );

    return connectionsWithPhotos;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch connections");
  }
};