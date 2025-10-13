import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import Request from "../models/request.model.js";
import { fetchAcceptedConnections } from "./request.service.js";
/**
 * Get all conversations for a user
 */



/** message.service.js */
/** message.service.js */
export const getUserConversations = async (userId) => {
  // ✅ Fetch accepted connections safely
  const acceptedConnections = await fetchAcceptedConnections(userId);
  const acceptedUserIds = acceptedConnections.map((conn) => conn._id);

  // ✅ Fetch only conversations that involve accepted users
 const conversations = await Conversation.find({
  participants: { $all: [userId], $in: acceptedUserIds },
})
  .populate("participants", "fullName avatar") // pick the fields you need
  .populate("lastMessage")
  .populate("lastMessage.sender", "fullName avatar")
  .sort({ updatedAt: -1 });


  return conversations;
};

/**
 * Get all messages in a conversation
 */
export const getConversationMessages = async (conversationId, userId) => {
  // mark all as seen
  await Message.updateMany(
    { conversationId, seenBy: { $ne: userId } },
    { $push: { seenBy: userId } }
  );

  const messages = await Message.find({ conversationId })
    .populate("sender", "name avatar")
    .sort({ createdAt: 1 });

  return messages;
};

/**
 * Send a message
 */
export const sendMessage = async (conversationId, senderId, text) => {
  const message = await Message.create({
    conversationId,
    sender: senderId,
    text,
    seenBy: [senderId],
  });

  // update conversation
  const conv = await Conversation.findById(conversationId);
  if (conv) {
    conv.lastMessage = message._id;
    conv.unreadCount.set(
      conv.participants.find((id) => id.toString() !== senderId.toString()),
      (conv.unreadCount.get(senderId) || 0) + 1
    );
    await conv.save();
  }

  return message;
};

/**
 * Start a new conversation (if not exists)
 */
export const createConversation = async (userA, userB) => {
  let existing = await Conversation.findOne({
    participants: { $all: [userA, userB], $size: 2 },
  });

  if (!existing) {
    existing = await Conversation.create({ participants: [userA, userB] });
  }

  return existing;
};
