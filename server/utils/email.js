const nodemailer = require('nodemailer');

let cachedTransporter = null;

const buildTransporter = async () => {
    if (cachedTransporter) return cachedTransporter;

    const smtpUrl = process.env.SMTP_URL;
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    const mailUser = process.env.MAIL_USER;
    const mailPass = process.env.MAIL_PASS;

    let transporter;
    if (smtpUrl) {
        transporter = nodemailer.createTransport(smtpUrl);
    } else if (smtpHost && smtpPort && smtpUser && smtpPass) {
        transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: { user: smtpUser, pass: smtpPass }
        });
    } else if (mailUser && mailPass) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: mailUser, pass: mailPass }
        });
    } else {
        return null;
    }

    await transporter.verify();
    cachedTransporter = transporter;
    return cachedTransporter;
};

const sendEmail = async (to, subject, text) => {
    try {
        const transporter = await buildTransporter();
        if (!transporter) {
            if (process.env.NODE_ENV !== 'production') {
                console.log(`[SIMULATION] Email to ${to}: ${subject}`);
                return { simulated: true };
            }
            throw new Error('Email is not configured');
        }

        const from = process.env.MAIL_FROM || process.env.SMTP_FROM || process.env.MAIL_USER || process.env.SMTP_USER;
        const info = await transporter.sendMail({
            from,
            to,
            subject,
            text
        });
        return { messageId: info.messageId };
    } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Email send failed:', err);
        }
        throw new Error('Failed to send email');
    }
};

module.exports = sendEmail;
