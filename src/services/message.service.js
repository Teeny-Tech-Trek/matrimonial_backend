// import Conversation from "../models/conversation.model.js";
// import Message from "../models/message.model.js";
// import Request from "../models/request.model.js";
// import { fetchAcceptedConnections } from "./request.service.js";
// /**
//  * Get all conversations for a user
//  */



// /** message.service.js */
// /** message.service.js */
// export const getUserConversations = async (userId) => {
//   // ✅ Fetch accepted connections safely
//   const acceptedConnections = await fetchAcceptedConnections(userId);
//   const acceptedUserIds = acceptedConnections.map((conn) => conn._id);

//   // ✅ Fetch only conversations that involve accepted users
//  const conversations = await Conversation.find({
//   participants: { $all: [userId], $in: acceptedUserIds },
// })
//   .populate("participants", "fullName avatar") // pick the fields you need
//   .populate("lastMessage")
//   .populate("lastMessage.sender", "fullName avatar")
//   .sort({ updatedAt: -1 });


//   return conversations;
// };

// /**
//  * Get all messages in a conversation
//  */
// export const getConversationMessages = async (conversationId, userId) => {
//   // mark all as seen
//   await Message.updateMany(
//     { conversationId, seenBy: { $ne: userId } },
//     { $push: { seenBy: userId } }
//   );

//   const messages = await Message.find({ conversationId })
//     .populate("sender", "name avatar")
//     .sort({ createdAt: 1 });

//   return messages;
// };

// /**
//  * Send a message
//  */
// export const sendMessage = async (conversationId, senderId, text) => {
//   const message = await Message.create({
//     conversationId,
//     sender: senderId,
//     text,
//     seenBy: [senderId],
//   });

//   // update conversation
//   const conv = await Conversation.findById(conversationId);
//   if (conv) {
//     conv.lastMessage = message._id;
//     conv.unreadCount.set(
//       conv.participants.find((id) => id.toString() !== senderId.toString()),
//       (conv.unreadCount.get(senderId) || 0) + 1
//     );
//     await conv.save();
//   }

//   return message;
// };

// /**
//  * Start a new conversation (if not exists)
//  */
// export const createConversation = async (userA, userB) => {
//   let existing = await Conversation.findOne({
//     participants: { $all: [userA, userB], $size: 2 },
//   });

//   if (!existing) {
//     existing = await Conversation.create({ participants: [userA, userB] });
//   }

//   return existing;
// };
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import Profile from "../models/profile.model.js"; // ✅ Import Profile model

/**
 * Get all conversations of logged-in user WITH PROFILE PHOTOS
 */
export const getUserConversations = async (userId) => {
  const conversations = await Conversation.find({
    participants: userId,
  })
    .populate({
      path: "participants",
      select: "fullName email",
    })
    .populate({
      path: "lastMessage",
      select: "text createdAt sender",
    })
    .sort({ updatedAt: -1 });

  // ✅ Fetch profile photos for each participant
  const conversationsWithPhotos = await Promise.all(
    conversations.map(async (conv) => {
      const participantsWithPhotos = await Promise.all(
        conv.participants.map(async (user) => {
          const profile = await Profile.findOne({ userId: user._id })
            .select("photos")
            .lean();

          // ✅ Filter only approved photos
          const approvedPhotos = profile?.photos
            ?.filter((p) => p.status === "approved")
            .map((p) => p.photoUrl) || [];

          return {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePhotos: approvedPhotos, // ✅ AWS S3 URLs
          };
        })
      );

      return {
        _id: conv._id,
        participants: participantsWithPhotos,
        lastMessage: conv.lastMessage,
        unreadCount: conv.unreadCount,
        updatedAt: conv.updatedAt,
      };
    })
  );

  return conversationsWithPhotos;
};

/**
 * Get messages of a conversation WITH SENDER PROFILE PHOTOS
 */
export const getConversationMessages = async (conversationId, userId) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new Error("Conversation not found");

  if (!conversation.participants.includes(userId)) {
    throw new Error("Unauthorized");
  }

  const messages = await Message.find({ conversationId })
    .populate("sender", "fullName email")
    .sort({ createdAt: 1 });

  // ✅ Fetch profile photos for each sender
  const messagesWithPhotos = await Promise.all(
    messages.map(async (msg) => {
      const profile = await Profile.findOne({ userId: msg.sender._id })
        .select("photos")
        .lean();

      const approvedPhotos = profile?.photos
        ?.filter((p) => p.status === "approved")
        .map((p) => p.photoUrl) || [];

      return {
        _id: msg._id,
        conversationId: msg.conversationId,
        sender: {
          _id: msg.sender._id,
          fullName: msg.sender.fullName,
          email: msg.sender.email,
          profilePhotos: approvedPhotos, // ✅ AWS S3 URLs
        },
        text: msg.text,
        createdAt: msg.createdAt,
        seenBy: msg.seenBy,
      };
    })
  );

  // Mark messages as read
  await Message.updateMany(
    { conversationId, sender: { $ne: userId }, seenBy: { $ne: userId } },
    { $addToSet: { seenBy: userId } }
  );

  // Update unread count
  conversation.unreadCount.set(userId, 0);
  await conversation.save();

  return messagesWithPhotos;
};

/**
 * Send message WITH SENDER PROFILE PHOTO
 */
export const sendMessage = async (conversationId, senderId, text) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new Error("Conversation not found");

  const message = new Message({
    conversationId,
    sender: senderId,
    text,
    seenBy: [senderId],
  });

  await message.save();

  conversation.lastMessage = message._id;

  // Update unread count for other participants
  conversation.participants.forEach((participantId) => {
    if (participantId.toString() !== senderId.toString()) {
      const currentCount = conversation.unreadCount.get(participantId.toString()) || 0;
      conversation.unreadCount.set(participantId.toString(), currentCount + 1);
    }
  });

  await conversation.save();

  // ✅ Fetch sender's profile photo
  const profile = await Profile.findOne({ userId: senderId })
    .select("photos")
    .lean();

  const approvedPhotos = profile?.photos
    ?.filter((p) => p.status === "approved")
    .map((p) => p.photoUrl) || [];

  const populatedMessage = await Message.findById(message._id)
    .populate("sender", "fullName email")
    .lean();

  return {
    ...populatedMessage,
    sender: {
      ...populatedMessage.sender,
      profilePhotos: approvedPhotos, // ✅ AWS S3 URLs
    },
  };
};

/**
 * Create conversation WITH PROFILE PHOTOS
 */
export const createConversation = async (userA, userB) => {
  let conversation = await Conversation.findOne({
    participants: { $all: [userA, userB] },
  })
    .populate("participants", "fullName email")
    .populate("lastMessage");

  if (!conversation) {
    conversation = new Conversation({
      participants: [userA, userB],
      unreadCount: new Map(),
    });
    await conversation.save();
    await conversation.populate("participants", "fullName email");
  }

  // ✅ Fetch profile photos for participants
  const participantsWithPhotos = await Promise.all(
    conversation.participants.map(async (user) => {
      const profile = await Profile.findOne({ userId: user._id })
        .select("photos")
        .lean();

      const approvedPhotos = profile?.photos
        ?.filter((p) => p.status === "approved")
        .map((p) => p.photoUrl) || [];

      return {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePhotos: approvedPhotos, // ✅ AWS S3 URLs
      };
    })
  );

  return {
    _id: conversation._id,
    participants: participantsWithPhotos,
    lastMessage: conversation.lastMessage,
    unreadCount: conversation.unreadCount,
    updatedAt: conversation.updatedAt,
  };
};