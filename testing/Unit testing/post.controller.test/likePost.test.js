import { Post } from "../../models/post.model.js";
import { User } from "../../models/user.model.js";
import { getReceiverSocketId, io } from "../../socket/socket.js";
import { likePost } from "../../controllers/post.controller.js";

// Mock setup
jest.mock("../../models/post.model.js", () => ({
    Post: {
        findById: jest.fn()
    }
}));

jest.mock("../../models/user.model.js", () => ({
    User: {
        findById: jest.fn()
    }
}));

jest.mock("../../socket/socket.js", () => ({
    getReceiverSocketId: jest.fn(),
    io: {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn()
    }
}));

describe('likePost() likePost method', () => {
    let req, res, mockPost, mockUser;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            id: 'user123',
            params: { id: 'post123' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        mockPost = {
            _id: 'post123',
            author: {
                toString: () => 'author123'
            },
            updateOne: jest.fn().mockResolvedValue({}),
            save: jest.fn().mockResolvedValue({}),
            likes: []
        };

        mockUser = {
            _id: 'user123',
            username: 'testuser',
            profilePicture: 'profile.jpg'
        };

        Post.findById.mockResolvedValue(mockPost);
        User.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(mockUser)
        });
        getReceiverSocketId.mockReturnValue('socket123');
    });

    describe('Happy Paths', () => {
        it('should like a post successfully', async () => {
            await likePost(req, res);

            expect(Post.findById).toHaveBeenCalledWith('post123');
            expect(mockPost.updateOne).toHaveBeenCalledWith({ 
                $addToSet: { likes: 'user123' } 
            });
            expect(mockPost.save).toHaveBeenCalled();
            expect(getReceiverSocketId).toHaveBeenCalledWith('author123');
            expect(io.to).toHaveBeenCalledWith('socket123');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Post liked',
                success: true
            });
        });

        it('should not send a notification if the liker is the post author', async () => {
            mockPost.author.toString = () => 'user123';
            
            await likePost(req, res);

            expect(io.to).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Post liked',
                success: true
            });
        });
    });

    describe('Edge Cases', () => {
        it('should return 404 if the post is not found', async () => {
            Post.findById.mockResolvedValue(null);

            await likePost(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Post not found',
                success: false
            });
        });

        it('should handle errors gracefully', async () => {
            Post.findById.mockRejectedValue(new Error('Database error'));

            await likePost(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Internal server error',
                success: false
            });
        });
    });
});