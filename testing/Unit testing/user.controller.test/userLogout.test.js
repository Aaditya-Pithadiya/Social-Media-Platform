
// Unit tests for: logout


import { logout } from '../user.controller';

// Import necessary modules
// Mock the response object
const mockResponse = () => {
    const res = {};
    res.cookie = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('logout() logout method', () => {
    describe('Happy Paths', () => {
        it('should clear the token cookie and return a success message', async () => {
            // Arrange
            const res = mockResponse();

            // Act
            await logout(null, res);

            // Assert
            expect(res.cookie).toHaveBeenCalledWith('token', '', { maxAge: 0 });
            expect(res.json).toHaveBeenCalledWith({
                message: 'Logged out successfully.',
                success: true
            });
        });
    });

    describe('Edge Cases', () => {
        it('should handle errors gracefully', async () => {
            // Arrange
            const res = mockResponse();
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

            // Simulate an error by throwing an error in the response methods
            res.cookie.mockImplementation(() => { throw new Error('Test error'); });

            // Act
            await logout(null, res);

            // Assert
            expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));

            // Clean up
            consoleSpy.mockRestore();
        });
    });
});

// End of unit tests for: logout