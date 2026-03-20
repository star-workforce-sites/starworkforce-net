// api/apply.js
// STAR Workforce Services — Job Application Handler
// - Sends notification email to info@starworkforce.net
// - Sends confirmation email to applicant
// - Stores submission in Vercel PostgreSQL (applications table)

import nodemailer from 'nodemailer';
import pkg from 'pg';
const { Pool } = pkg;

// DB pool — reuse across warm invocations
let pool;
function getPool() {
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.POSTGRES_URL,
            ssl: { rejectUnauthorized: false }
        });
    }
    return pool;
}

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', 'https://www.starworkforce.net');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const {
            fullName,
            email,
            phone,
            location,
            roleCategory,
            roleTitle,
            yearsExp,
            availability,
            workPreference,
            coverLetter,
            resumeFileName,
            resumeFileType,
            resumeBase64
        } = req.body;

        // --- Validate required fields ---
        if (!fullName || !email || !phone || !roleCategory) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['fullName', 'email', 'phone', 'roleCategory']
            });
        }

        if (!resumeBase64 || !resumeFileName) {
            return res.status(400).json({ error: 'Resume file is required' });
        }

        // --- Validate email format ---
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email address' });
        }

        // --- Validate file size (5MB max, base64 is ~4/3 of original) ---
        const fileSizeBytes = (resumeBase64.length * 3) / 4;
        if (fileSizeBytes > 5.5 * 1024 * 1024) {
            return res.status(400).json({ error: 'Resume file too large. Maximum 5MB.' });
        }

        // --- Convert base64 back to buffer for email attachment ---
        const resumeBuffer = Buffer.from(resumeBase64, 'base64');

        // ============================
        // 1. STORE IN DATABASE
        // ============================
        let applicationId = null;
        try {
            const db = getPool();

            // Create table if not exists
            await db.query(`
                CREATE TABLE IF NOT EXISTS applications (
                    id SERIAL PRIMARY KEY,
                    full_name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL,
                    phone VARCHAR(50),
                    location VARCHAR(255),
                    role_category VARCHAR(255),
                    role_title VARCHAR(255),
                    years_exp VARCHAR(50),
                    availability VARCHAR(100),
                    work_preference VARCHAR(100),
                    cover_letter TEXT,
                    resume_file_name VARCHAR(255),
                    resume_file_type VARCHAR(100),
                    status VARCHAR(50) DEFAULT 'New',
                    submitted_at TIMESTAMPTZ DEFAULT NOW(),
                    notes TEXT
                )
            `);

            const result = await db.query(
                `INSERT INTO applications
                    (full_name, email, phone, location, role_category, role_title,
                     years_exp, availability, work_preference, cover_letter,
                     resume_file_name, resume_file_type, status)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'New')
                 RETURNING id`,
                [
                    fullName, email, phone, location || null, roleCategory,
                    roleTitle || null, yearsExp || null, availability || null,
                    workPreference || null, coverLetter || null,
                    resumeFileName, resumeFileType || 'application/octet-stream'
                ]
            );
            applicationId = result.rows[0]?.id;
        } catch (dbErr) {
            // Log DB error but don't fail the request — email still goes out
            console.error('DB insert error (non-fatal):', dbErr.message);
        }

        // ============================
        // 2. SEND EMAILS
        // ============================
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp-relay.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,   // info@starworkforce.net
                pass: process.env.SMTP_PASSWORD // App Password
            },
            tls: { rejectUnauthorized: true }
        });

        // -- Internal notification email to team --
        const internalHtml = `
<!DOCTYPE html>
<html>
<head>
<style>
  body{font-family:Arial,sans-serif;line-height:1.6;color:#333;margin:0;padding:0}
  .container{max-width:600px;margin:0 auto;padding:20px}
  .header{background:linear-gradient(135deg,#1a0b2e 0%,#2a1540 100%);color:white;padding:30px;text-align:center;border-radius:8px 8px 0 0}
  .content{background:#f9fafb;padding:30px;border:1px solid #e5e7eb}
  .field{margin-bottom:16px}
  .label{font-weight:bold;color:#1a0b2e;margin-bottom:4px;font-size:12px;text-transform:uppercase;letter-spacing:0.5px}
  .value{background:white;padding:10px 14px;border-radius:4px;border:1px solid #e5e7eb;font-size:14px}
  .badge{display:inline-block;padding:6px 14px;border-radius:20px;font-weight:bold;font-size:12px;margin-top:4px}
  .badge-new{background:#E8C547;color:#1a0b2e}
  .footer{background:#1a0b2e;color:#E8C547;padding:16px;text-align:center;border-radius:0 0 8px 8px;font-size:12px}
  .id-box{background:#1a0b2e;color:#E8C547;padding:4px 10px;border-radius:4px;font-size:12px;font-weight:bold;display:inline-block}
  .divider{border:0;border-top:1px solid #e5e7eb;margin:20px 0}
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1 style="margin:0;font-size:22px;">🌟 New Job Application Received</h1>
    ${applicationId ? `<p style="margin:8px 0 0;opacity:0.8;font-size:13px;">Application #${applicationId}</p>` : ''}
  </div>
  <div class="content">
    <div class="field">
      <div class="label">Status</div>
      <span class="badge badge-new">🆕 New Application</span>
    </div>
    <div class="field">
      <div class="label">Applicant Name</div>
      <div class="value">${fullName}</div>
    </div>
    <div class="field">
      <div class="label">Email</div>
      <div class="value"><a href="mailto:${email}" style="color:#7C3AED;">${email}</a></div>
    </div>
    <div class="field">
      <div class="label">Phone</div>
      <div class="value"><a href="tel:${phone}" style="color:#7C3AED;">${phone}</a></div>
    </div>
    ${location ? `<div class="field"><div class="label">Location</div><div class="value">${location}</div></div>` : ''}
    <hr class="divider">
    <div class="field">
      <div class="label">Role Category</div>
      <div class="value"><strong>${roleCategory}</strong></div>
    </div>
    ${roleTitle ? `<div class="field"><div class="label">Role Title</div><div class="value">${roleTitle}</div></div>` : ''}
    ${yearsExp ? `<div class="field"><div class="label">Years of Experience</div><div class="value">${yearsExp}</div></div>` : ''}
    ${availability ? `<div class="field"><div class="label">Availability</div><div class="value">${availability}</div></div>` : ''}
    ${workPreference ? `<div class="field"><div class="label">Work Preference</div><div class="value">${workPreference}</div></div>` : ''}
    <hr class="divider">
    ${coverLetter ? `<div class="field"><div class="label">Cover Letter / Notes</div><div class="value" style="white-space:pre-wrap;">${coverLetter}</div></div>` : ''}
    <div class="field">
      <div class="label">Resume Attached</div>
      <div class="value">📎 ${resumeFileName}</div>
    </div>
  </div>
  <div class="footer">
    <strong>STAR Workforce Services</strong> — info@starworkforce.net — (469) 713-3993<br>
    5465 Legacy Drive Suite 650, Plano, TX 75024
  </div>
</div>
</body>
</html>`;

        await transporter.sendMail({
            from: `"STAR Workforce Applications" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER, // info@starworkforce.net
            replyTo: email,
            subject: `🆕 New Application: ${roleCategory} — ${fullName}${applicationId ? ` [#${applicationId}]` : ''}`,
            html: internalHtml,
            attachments: [{
                filename: resumeFileName,
                content: resumeBuffer,
                contentType: resumeFileType || 'application/octet-stream'
            }]
        });

        // -- Confirmation email to applicant --
        const confirmHtml = `
<!DOCTYPE html>
<html>
<head>
<style>
  body{font-family:Arial,sans-serif;line-height:1.6;color:#333}
  .container{max-width:600px;margin:0 auto;padding:20px}
  .header{background:linear-gradient(135deg,#1a0b2e 0%,#2a1540 100%);color:white;padding:30px;text-align:center;border-radius:8px 8px 0 0}
  .content{background:#f9fafb;padding:30px;border:1px solid #e5e7eb}
  .footer{background:#1a0b2e;color:#E8C547;padding:16px;text-align:center;border-radius:0 0 8px 8px;font-size:12px}
  .step{display:flex;align-items:flex-start;gap:12px;margin-bottom:16px;background:white;padding:14px;border-radius:8px;border:1px solid #e5e7eb}
  .step-num{width:28px;height:28px;border-radius:50%;background:#E8C547;color:#1a0b2e;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:13px;flex-shrink:0}
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1 style="margin:0;font-size:22px;">✅ Application Received!</h1>
    <p style="margin:8px 0 0;opacity:0.8;">STAR Workforce Services</p>
  </div>
  <div class="content">
    <p>Hi <strong>${fullName}</strong>,</p>
    <p>Thank you for applying with <strong>STAR Workforce Services</strong>. We've received your application for:</p>
    <div style="background:#E8C547;color:#1a0b2e;padding:12px 20px;border-radius:8px;font-weight:bold;margin:16px 0;text-align:center;font-size:16px;">
      ${roleCategory}
    </div>
    <p><strong>What happens next:</strong></p>
    <div class="step"><div class="step-num">1</div><div><strong>Review</strong> — A recruiter will review your profile within 1 business day.</div></div>
    <div class="step"><div class="step-num">2</div><div><strong>Matching</strong> — If we have a matching position, we'll contact you by phone or email to discuss it.</div></div>
    <div class="step"><div class="step-num">3</div><div><strong>Verification</strong> — For clinical roles, we'll begin credential and license verification.</div></div>
    <div class="step"><div class="step-num">4</div><div><strong>Placement</strong> — We'll work to find you the right opportunity as quickly as possible.</div></div>
    <p style="margin-top:20px;">In the meantime, feel free to <a href="https://www.starworkforce.net/pages/jobs" style="color:#7C3AED;">browse our open positions</a> or call us at <a href="tel:+14697133993" style="color:#7C3AED;">(469) 713-3993</a> with any questions.</p>
  </div>
  <div class="footer">
    <strong>STAR Workforce Services</strong><br>
    5465 Legacy Drive Suite 650, Plano, TX 75024<br>
    (469) 713-3993 | info@starworkforce.net | starworkforce.net
  </div>
</div>
</body>
</html>`;

        await transporter.sendMail({
            from: `"STAR Workforce Services" <${process.env.SMTP_USER}>`,
            to: email,
            subject: `Application Received — STAR Workforce Services`,
            html: confirmHtml
        });

        // ============================
        // 3. SUCCESS RESPONSE
        // ============================
        return res.status(200).json({
            success: true,
            message: 'Application submitted successfully',
            applicationId: applicationId || null
        });

    } catch (error) {
        console.error('Apply API error:', error);
        return res.status(500).json({
            error: 'Failed to submit application',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}
