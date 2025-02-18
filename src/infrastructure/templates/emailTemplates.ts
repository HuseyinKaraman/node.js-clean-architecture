export const emailTemplates = {
    welcome: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h1>Welcome {{name}}!</h1>
            <p>Thank you for joining our platform.</p>
            <p>Your email: {{email}}</p>
        </div>
    `,
    
    resetPassword: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h1>Password Reset</h1>
            <p>Hello {{name}},</p>
            <p>Click the link below to reset your password:</p>
            <a href="{{resetLink}}">Reset Password</a>
        </div>
    `,

    // diğer templateler...
};