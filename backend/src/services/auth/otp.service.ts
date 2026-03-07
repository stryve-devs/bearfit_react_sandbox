import nodemailer from 'nodemailer';
import redisClient, { connectRedis } from '../../config/redisClient';

const OTP_TTL_SECONDS = 60 * 5; // 5 minutes

function _generateOtp(): string {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

export async function sendOtpToEmail(email: string): Promise<void> {
  const otp = _generateOtp();
  const key = `otp:${email}`;

  // ensure redis connected
  try {
    await connectRedis();
    await redisClient.set(key, otp, { EX: OTP_TTL_SECONDS });
  } catch (err) {
    console.error('Failed to store OTP in redis', err);
    throw new Error('internal');
  }

  // Prepare transporter using env config
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = Number(process.env.EMAIL_PORT || '587');
  const secure = (process.env.EMAIL_SECURE || 'false') === 'true';
  // Read env vars and normalize: strip surrounding quotes and internal whitespace in pass
  const rawUser = process.env.EMAIL_USER || '';
  const rawPass = process.env.EMAIL_PASS || '';
  const user = rawUser.replace(/(^\")|("$)/g, '').trim(); // remove possible surrounding quotes
  // some users paste app passwords with spaces — remove all whitespace characters
  const pass = rawPass.replace(/(^\")|("$)/g, '').replace(/\s+/g, '').trim(); // required
  const from = process.env.EMAIL_FROM || 'jeffamiduu@gmail.com';

  if (!user || !pass) {
    console.error('EMAIL_USER/EMAIL_PASS not configured');
    throw new Error('email_not_configured');
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  console.log('SMTP config', { host, port, secure, user, passLength: pass.length });

  try {
    // verify SMTP connection/auth early so errors are clearer
    // (this will surface auth errors like invalid credentials)
    // Note: verify() will throw if auth fails
    // eslint-disable-next-line @typescript-eslint/await-thenable
    await transporter.verify();
  } catch (err) {
    console.error('SMTP verify failed', err);
    throw new Error('email_auth_error');
  }

  const mailOpts = {
    from,
    to: email,
    subject: 'Your Bearfit verification code',
    text: `Your Bearfit verification code is ${otp}. It expires in 5 minutes.`,
    html: `<p>Your Bearfit verification code is <strong>${otp}</strong>. It expires in 5 minutes.</p>`,
  };

  try {
    await transporter.sendMail(mailOpts);
  } catch (err) {
    console.error('Failed to send OTP email', err);
    // if this is an auth error surfaced at send time, map to auth error
    // nodemailer errors often include a `code` or `responseCode` property
    // but we'll keep mapping simple
    throw new Error('email_send_failed');
  }
}

export async function verifyOtpForEmail(email: string, code: string): Promise<boolean> {
  try {
    await connectRedis();
    const key = `otp:${email}`;
    const stored = await redisClient.get(key);
    if (!stored) return false;
    if (stored !== code) return false;
    // delete the key so code cannot be reused
    await redisClient.del(key);
    return true;
  } catch (err) {
    console.error('Failed to verify OTP', err);
    return false;
  }
}

export default {
  sendOtpToEmail,
  verifyOtpForEmail,
};
