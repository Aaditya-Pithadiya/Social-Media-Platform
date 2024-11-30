import { transporter } from "./Email.config.js";

// OTP Verification Code Email Template
export const SendVerificationCode = async (email, verificationCode) => {
    try {
        const response = await transporter.sendMail({
            from: '"TheGroup14" <kenilsarang@gmail.com>', // sender address
            to: email, // list of receivers
            subject: "OTP Verification Code", // Subject line
            text: "Verify your email", // plain text body (fallback)
            html: `
                <div style="font-family: Arial, sans-serif; background-color: #f7f7f7; padding: 20px;">
                    <div style="background-color: #ffffff; max-width: 600px; margin: 0 auto; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        <h2 style="color: #333333; text-align: center;">Email Verification</h2>
                        <p style="font-size: 16px; color: #333333;">Hello,</p>
                        <p style="font-size: 16px; color: #333333;">To verify your account, please enter the following verification code:</p>
                        <div style="text-align: center; margin: 20px;">
                            <span style="font-size: 30px; font-weight: bold; color: #4CAF50;">${verificationCode}</span>
                        </div>
                        <p style="font-size: 16px; color: #333333;">If you did not request this verification, please ignore this email.</p>
                        <p style="font-size: 16px; color: #333333;">Best regards,</p>
                        <p style="font-size: 16px; color: #333333;">The Group 14 Team</p>
                    </div>
                </div>
            `, // HTML body with styling
        });
        console.log("Email sent successfully:", response);
    } catch (error) {
        console.error("Failed to send email:", error);
        throw new Error("Failed to send email");
    }
};

// Welcome Email Template
export const welcomeEmail = async (email, verificationCode) => {
    try {
        const response = await transporter.sendMail({
            from: '"TheGroup14" <kenilsarang@gmail.com>', // sender address
            to: email, // list of receivers
            subject: "Successfully Registered", // Subject line
            text: "Welcome to the Social Media Platform", // plain text body (fallback)
            html: 
            `    
                <span style="font-size: 30px; font-weight: bold; color: #4CAF50;">${verificationCode}</span>
                <div style="font-family: Arial, sans-serif; background-color: #f7f7f7; padding: 20px;">
                    <div style="background-color: #ffffff; max-width: 600px; margin: 0 auto; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        <h2 style="color: #333333; text-align: center;">Welcome to Our Platform!</h2>
                        <p style="font-size: 16px; color: #333333; text-align: center;">Congratulations on successfully registering with our platform!</p>
                        <p style="font-size: 16px; color: #333333;">We are excited to have you join our community. Here's a quick overview of what's next:</p>
                        <ul style="font-size: 16px; color: #333333;">
                            <li>Complete your profile</li>
                            <li>Start exploring content</li>
                            <li>Engage with other users</li>
                        </ul>
                        <div style="text-align: center; margin: 20px;">
                     
                        </div>
                        <p style="font-size: 16px; color: #333333;">We look forward to your participation in our platform!</p>
                        <p style="font-size: 16px; color: #333333;">Best regards,</p>
                        <p style="font-size: 16px; color: #333333;">The Group 14 Team</p>
                    </div>
                </div>
            `, // HTML body with styling
        });
        console.log('Email sent successfully:', response);
    } catch (error) {
        console.error('Email sending error:', error);
    }
};
