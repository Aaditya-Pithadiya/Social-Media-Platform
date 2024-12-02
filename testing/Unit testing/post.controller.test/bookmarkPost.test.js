import { Post } from "../../models/post.model.js";
import { User } from "../../models/user.model.js";
import { bookmarkPost } from "../../controllers/post.controller.js";

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

describe('bookmarkPost() bookmarkPost method', () => {
    let req, res, mockPost, mockUser;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            params: { id: 'postId' },
            id: 'authorId'
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        mockPost = {
            _id: 'postId'
        };
        mockUser = {
            bookmarks: [],
            updateOne: jest.fn().mockResolvedValue({}),
            save: jest.fn().mockResolvedValue({})
        };
    });

    describe('Happy paths', () => {
        it('should bookmark a post successfully', async () => {
            Post.findById.mockResolvedValue(mockPost);
            User.findById.mockResolvedValue(mockUser);

            await bookmarkPost(req, res);

            expect(mockUser.updateOne).toHaveBeenCalledWith({ 
                $addToSet: { bookmarks: mockPost._id } 
            });
            expect(mockUser.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ 
                type: 'saved', 
                message: 'Post bookmarked', 
                success: true 
            });
        });

        it('should remove a post from bookmarks successfully', async () => {
            mockUser.bookmarks = ['postId'];
            Post.findById.mockResolvedValue(mockPost);
            User.findById.mockResolvedValue(mockUser);

            await bookmarkPost(req, res);

            expect(mockUser.updateOne).toHaveBeenCalledWith({ 
                $pull: { bookmarks: mockPost._id } 
            });
            expect(mockUser.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ 
                type: 'unsaved', 
                message: 'Post removed from bookmark', 
                success: true 
            });
        });
    });

    describe('Edge cases', () => {
        it('should return 404 if post is not found', async () => {
            Post.findById.mockResolvedValue(null);

            await bookmarkPost(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ 
                message: 'Post not found', 
                success: false 
            });
        });

        it('should handle errors gracefully', async () => {
            Post.findById.mockRejectedValue(new Error('Database error'));

            await bookmarkPost(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ 
                message: 'Internal server error', 
                success: false 
            });
        });
    });
});