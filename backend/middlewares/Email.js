import { transporter } from "./Email.config.js";


export const SendVerificationCode = async(email,verificationCode)=>{
    try{
        const response = await transporter.sendMail({
            from: '"TheGroup14" <kenilsarang@gmail.com>', // sender address
            to: email, // list of receivers
            subject: "OTP verification code", // Subject line
            text: "Verify your Email", // plain text body
            html: verificationCode, // html body
        });
        console.log('Email send Successfully',response)
    }
    catch(error){
        console.log('Email error')
    }
}
export const welcomeEmail = async(email,verificationCode)=>{
    try{
        const response = await transporter.sendMail({
            from: '"TheGroup14" <kenilsarang@gmail.com>', // sender address
            to: email, // list of receivers
            subject: "Successfully Registered", // Subject line
            text: "Welcome to Social media Platform Created by G14", // plain text body
            html: verificationCode, // html body
        });
        console.log('Email send Successfully',response)
    }
    catch(error){
        console.log('Email error')
    }
}

