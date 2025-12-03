export default function handler(req, res) {
  return res.json({
    hasHost: !!process.env.SMTP_HOST,
    hasUser: !!process.env.SMTP_USER,
    hasPassword: !!process.env.SMTP_PASSWORD,
    hostValue: process.env.SMTP_HOST || 'missing',
    userValue: process.env.SMTP_USER || 'missing'
  });
}
