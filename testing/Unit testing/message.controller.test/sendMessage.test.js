// Unit tests for: sendMessage

import { Conversation } from "../../models/conversation.model.js";
import { Message } from "../../models/message.model.js";
import { getReceiverSocketId, io } from "../../socket/socket.js";
import { sendMessage } from '../message.controller';

// Mocking the necessary modules
jest.mock("../../socket/socket.js", () => {
  const originalModule = jest.requireActual("../../socket/socket.js");
  return {
    __esModule: true,
    ...originalModule,
    getReceiverSocketId: jest.fn(),
    io: {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    },
  };
});

jest.mock("../../models/conversation.model.js", () => ({
  Conversation: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock("../../models/message.model.js", () => ({
  Message: {
    create: jest.fn(),
  },
}));

describe('sendMessage() sendMessage method', () => {
  let req, res, senderId, receiverId, message, conversation, newMessage;

  beforeEach(() => {
    senderId = 'sender123';
    receiverId = 'receiver456';
    message = 'Hello, World!';
    req = {
      id: senderId,
      params: { id: receiverId },
      body: { textMessage: message },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    conversation = {
      participants: [senderId, receiverId],
      messages: [],
      save: jest.fn(),
    };
    newMessage = {
      _id: 'message789',
      senderId,
      receiverId,
      message,
      save: jest.fn(),
    };
  });

  describe('Happy paths', () => {
    it('should create a new message and return it when a conversation exists', async () => {
      // Mocking existing conversation
      Conversation.findOne.mockResolvedValue(conversation);
      Message.create.mockResolvedValue(newMessage);

      await sendMessage(req, res);

      expect(Conversation.findOne).toHaveBeenCalledWith({
        participants: { $all: [senderId, receiverId] },
      });
      expect(Message.create).toHaveBeenCalledWith({
        senderId,
        receiverId,
        message,
      });
      expect(conversation.messages).toContain(newMessage._id);
      expect(conversation.save).toHaveBeenCalled();
      expect(newMessage.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        newMessage,
      });
    });

    it('should create a new conversation and message if no conversation exists', async () => {
      // Mocking no existing conversation
      Conversation.findOne.mockResolvedValue(null);
      Conversation.create.mockResolvedValue(conversation);
      Message.create.mockResolvedValue(newMessage);

      await sendMessage(req, res);

      expect(Conversation.create).toHaveBeenCalledWith({
        participants: [senderId, receiverId],
      });
      expect(conversation.messages).toContain(newMessage._id);
      expect(conversation.save).toHaveBeenCalled();
      expect(newMessage.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        newMessage,
      });
    });

    it('should emit a new message event if receiver is connected', async () => {
      // Mocking existing conversation and socket connection
      Conversation.findOne.mockResolvedValue(conversation);
      Message.create.mockResolvedValue(newMessage);
      getReceiverSocketId.mockReturnValue('socket123');

      await sendMessage(req, res);

      expect(io.to).toHaveBeenCalledWith('socket123');
      expect(io.to('socket123').emit).toHaveBeenCalledWith('newMessage', newMessage);
    });
  });

  describe('Edge cases', () => {
    it('should handle errors gracefully', async () => {
      // Mocking an error
      const error = new Error('Database error');
      Conversation.findOne.mockRejectedValue(error);

      await sendMessage(req, res);

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    // it('should not emit a message if receiver is not connected', async () => {
    //   // Mocking existing conversation and no socket connection
    //   Conversation.findOne.mockResolvedValue(conversation);
    //   Message.create.mockResolvedValue(newMessage);
    //   getReceiverSocketId.mockReturnValue(null); // Simulate receiver not being connected
    
    //   await sendMessage(req, res);
    
    //   expect(io.to).not.toHaveBeenCalled(); // Ensure io.to is not called
    // });
  });
});

// End of unit tests for: sendMessage