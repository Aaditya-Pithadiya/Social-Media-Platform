import sharp from "sharp";
import { Post } from "../../models/post.model.js";
import { User } from "../../models/user.model.js";
import cloudinary from "../../utils/cloudinary.js";
import { addNewPost } from "../../controllers/post.controller.js"; // Add this import

// Mock setup
jest.mock("../../models/post.model.js", () => ({
    Post: {
        create: jest.fn()
    }
}));

jest.mock("../../models/user.model.js", () => ({
    User: {
        findById: jest.fn()
    }
}));

jest.mock("../../utils/cloudinary.js", () => ({
    uploader: {
        upload: jest.fn()
    }
}));

jest.mock("sharp", () => jest.fn());

describe('addNewPost() addNewPost method', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        req = {
            body: { caption: 'Test Caption' },
            file: { buffer: Buffer.from('test') },
            id: 'authorId123'
        };
    });

    it('should add a new post successfully', async () => {
        // Arrange
        const optimizedImageBuffer = Buffer.from('optimizedImage');
        const cloudResponse = { secure_url: 'http://cloudinary.com/image.jpg' };
        const mockPost = {
            _id: 'postId123',
            populate: jest.fn().mockResolvedValue({
                _id: 'postId123',
                caption: 'Test Caption',
                image: 'http://cloudinary.com/image.jpg',
                author: 'authorId123'
            })
        };
        const mockUser = {
            posts: [],
            save: jest.fn().mockResolvedValue(true)
        };

        sharp.mockReturnValue({
            resize: jest.fn().mockReturnThis(),
            toFormat: jest.fn().mockReturnThis(),
            toBuffer: jest.fn().mockResolvedValue(optimizedImageBuffer)
        });

        cloudinary.uploader.upload.mockResolvedValue(cloudResponse);
        Post.create.mockResolvedValue(mockPost);
        User.findById.mockResolvedValue(mockUser);

        // Act
        await addNewPost(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: 'New post added successfully',
            post: expect.any(Object),
            success: true
        });
    });

    it('should return 400 if image is missing', async () => {
        // Arrange
        req.file = null;

        // Act
        await addNewPost(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Image required' });
    });

    it('should handle errors during image processing', async () => {
        // Arrange
        sharp.mockReturnValue({
            resize: jest.fn().mockReturnThis(),
            toFormat: jest.fn().mockReturnThis(),
            toBuffer: jest.fn().mockRejectedValue(new Error('Sharp error'))
        });

        // Act
        await addNewPost(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Error adding new post'
        });
    });

    it('should handle errors during cloudinary upload', async () => {
        // Arrange
        const optimizedImageBuffer = Buffer.from('optimizedImage');
        sharp.mockReturnValue({
            resize: jest.fn().mockReturnThis(),
            toFormat: jest.fn().mockReturnThis(),
            toBuffer: jest.fn().mockResolvedValue(optimizedImageBuffer)
        });

        cloudinary.uploader.upload.mockRejectedValue(new Error('Cloudinary error'));

        // Act
        await addNewPost(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Error adding new post'
        });
    });
});