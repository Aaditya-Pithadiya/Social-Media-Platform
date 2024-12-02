// Unit tests for: register

import axios from 'axios';
import bcrypt from "bcryptjs";
import { register } from '../../controllers/user.controller.js';
import { SendVerificationCode } from '../../middlewares/Email.js';
import { User } from "../../models/user.model.js";

jest.mock("../../models/user.model.js");
jest.mock("bcryptjs");
jest.mock("axios");
jest.mock("../../middlewares/Email.js");

describe('register() register method', () => {
    let req, res, mockUser;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        req = {
            body: {
                username: 'testuser',
                email: 'test@example.com',
                password: 'Password123!'
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Create a mock user instance with save method
        mockUser = {
            email: 'test@example.com',
            username: 'testuser',
            save: jest.fn().mockResolvedValue(true)
        };

        // Setup User constructor mock
        User.mockImplementation(() => mockUser);
        
        // Setup other required mocks
        User.findOne = jest.fn();
        SendVerificationCode.mockImplementation((email, code) => Promise.resolve());
        bcrypt.hash.mockResolvedValue('hashedPassword');
    });

    describe('Happy paths', () => {
        it('should register a new user successfully', async () => {
            // Arrange
            axios.get.mockResolvedValue({
                data: {
                    is_valid_format: { value: true },
                    deliverability: 'DELIVERABLE'
                }
            });
            User.findOne.mockResolvedValue(null);

            // Act
            await register(req, res);

            // Assert
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: "Account created successfully. Please verify your email.",
                success: true
            });
            expect(mockUser.save).toHaveBeenCalled();
            expect(SendVerificationCode).toHaveBeenCalledWith(
                'test@example.com',
                expect.any(String)
            );
        });
    });

    describe('Edge cases', () => {
        it('should return 400 if any field is missing', async () => {
            // Arrange
            req.body = { email: 'test@example.com', password: 'Password123!' };

            // Act
            await register(req, res);

            // Assert
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "All fields are required.",
                success: false
            });
        });

        it('should return 400 if email is invalid', async () => {
            // Arrange
            axios.get.mockResolvedValue({
                data: {
                    is_valid_format: { value: false },
                    deliverability: 'UNDELIVERABLE'
                }
            });

            // Act
            await register(req, res);

            // Assert
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "Please enter a valid email address.",
                success: false
            });
        });

        it('should return 400 if email is already in use', async () => {
            // Arrange
            axios.get.mockResolvedValue({
                data: {
                    is_valid_format: { value: true },
                    deliverability: 'DELIVERABLE'
                }
            });
            User.findOne.mockResolvedValue({ email: 'test@example.com' });

            // Act
            await register(req, res);

            // Assert
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "Email already in use.",
                success: false
            });
        });

        it('should return 500 on internal server error', async () => {
            // Arrange
            axios.get.mockResolvedValue({
                data: {
                    is_valid_format: { value: true },
                    deliverability: 'DELIVERABLE'
                }
            });
            User.findOne.mockRejectedValue(new Error('Internal error'));

            // Act
            await register(req, res);

            // Assert
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Internal server error.",
                success: false
            });
        });
    });
});

// End of unit tests for: register