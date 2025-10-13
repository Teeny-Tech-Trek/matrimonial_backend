import {
  getUserConversations,
  getConversationMessages,
  sendMessage,
  createConversation,
} from "../services/message.service.js";

/**
 * Get all conversations of logged-in user
 */
export const listConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const data = await getUserConversations(userId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

/**
 * Get messages of a conversation
 */
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;
    const data = await getConversationMessages(conversationId, userId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

/**
 * Send message
 */
export const sendNewMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;
    const senderId = req.user._id;

    const message = await sendMessage(conversationId, senderId, text);
    res.status(201).json({ success: true, data: message });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

/**
 * Create a new conversation
 */
export const createNewConversation = async (req, res) => {
  try {
    const userA = req.user._id;
    const { userB } = req.body;

    const conversation = await createConversation(userA, userB);
    res.status(201).json({ success: true, data: conversation });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
