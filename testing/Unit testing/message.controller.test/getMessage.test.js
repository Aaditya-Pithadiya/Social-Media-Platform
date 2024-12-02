import { Conversation } from "../../models/conversation.model.js";
import { getMessage } from "../../controllers/message.controller.js";

jest.mock("../../models/conversation.model.js", () => ({
    Conversation: {
        findOne: jest.fn()
    }
}));

describe("getMessage() method", () => {
    let req, res;

    beforeEach(() => {
        req = {
            id: "senderId123",
            params: { id: "receiverId456" }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe("Happy Paths", () => {
        it("should return messages for an existing conversation", async () => {
            const mockMessages = [{ _id: "msg1", message: "Hello" }];
            const mockConversation = {
                participants: ["senderId123", "receiverId456"],
                messages: mockMessages
            };

            Conversation.findOne.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockConversation)
            });

            await getMessage(req, res);

            expect(Conversation.findOne).toHaveBeenCalledWith({
                participants: { $all: ["senderId123", "receiverId456"] }
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                messages: mockMessages
            });
        });

        it("should return an empty array if no conversation exists", async () => {
            Conversation.findOne.mockReturnValue({
                populate: jest.fn().mockResolvedValue(null)
            });

            await getMessage(req, res);

            expect(Conversation.findOne).toHaveBeenCalledWith({
                participants: { $all: ["senderId123", "receiverId456"] }
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                messages: []
            });
        });
    });

    describe("Edge Cases", () => {
        it("should handle errors and return a 500 status", async () => {
            Conversation.findOne.mockReturnValue({
                populate: jest.fn().mockRejectedValue(new Error("Database error"))
            });

            await getMessage(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: "Internal Server Error"
            });
        });
    });
});