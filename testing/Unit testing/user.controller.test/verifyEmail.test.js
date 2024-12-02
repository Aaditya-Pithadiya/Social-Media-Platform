// Unit tests for: Verifyemail


import { welcomeEmail } from '../../middlewares/Email.js';
import { User } from "../../models/user.model.js";
import { Verifyemail } from '../user.controller';

jest.mock("../../models/user.model.js");
jest.mock("../../middlewares/Email.js");

describe('Verifyemail() Verifyemail method', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    describe('Happy Paths', () => {
        it('should verify email successfully when valid email and OTP are provided', async () => {
            // Arrange
            req.body.email = 'test@example.com';
            req.body.otp = '123456';

            const user = {
                email: 'test@example.com',
                verificationCode: '123456',
                verificationExpires: Date.now() + 10000,
                save: jest.fn()
            };

            User.findOne.mockResolvedValue(user);

            // Act
            await Verifyemail(req, res);

            // Assert
            expect(user.isVerified).toBe(true);
            expect(user.verificationExpires).toBeNull();
            expect(user.verificationCode).toBeUndefined();
            expect(user.save).toHaveBeenCalled();
            expect(welcomeEmail).toHaveBeenCalledWith(user.email, user.username);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: "Email verified successfully!", success: true });
        });
    });

    describe('Edge Cases', () => {
        it('should return 400 if email or OTP is missing', async () => {
            // Arrange
            req.body.email = 'test@example.com';

            // Act
            await Verifyemail(req, res);

            // Assert
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Email and OTP are required.", success: false });
        });

        it('should return 400 if user is not found or OTP is expired', async () => {
            // Arrange
            req.body.email = 'test@example.com';
            req.body.otp = '123456';

            User.findOne.mockResolvedValue(null);

            // Act
            await Verifyemail(req, res);

            // Assert
            expect(User.deleteOne).toHaveBeenCalledWith({ email: req.body.email, isVerified: false });
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "Invalid or expired code. User has been removed.",
                success: false
            });
        });

        it('should handle internal server errors gracefully', async () => {
            // Arrange
            req.body.email = 'test@example.com';
            req.body.otp = '123456';

            User.findOne.mockRejectedValue(new Error('Database error'));

            // Act
            await Verifyemail(req, res);

            // Assert
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: "Internal server error.", success: false });
        });
    });
});

// End of unit tests for: Verifyemail