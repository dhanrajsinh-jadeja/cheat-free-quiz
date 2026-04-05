import nodemailer from 'nodemailer';

const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
    const emailUser = process.env.EMAIL_USER || 'yourgmail@gmail.com';
    const emailPass = (process.env.EMAIL_PASS || 'your_app_password').replace(/\s/g, '');

    // Create a transporter using Gmail service
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: emailUser,
            pass: emailPass
        }
    });

    const mailOptions = {
        from: `Quiz App <${emailUser}>`,
        to: to,
        subject: subject,
        text: text,
        html: html
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        throw error;
    }
};

export default sendEmail;
