// Vercel Serverless Function - Google Workspace SMTP
// Path: /api/contact.js

import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, phone, company, reason, message } = req.body;

    // Validate required fields
    if (!name || !email || !reason || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['name', 'email', 'reason', 'message']
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Create transporter using Google Workspace SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp-relay.gmail.com',
      port: 587,
      secure: false, // Use STARTTLS
      auth: {
        user: process.env.SMTP_USER, // info@starworkforce.net
        pass: process.env.SMTP_PASSWORD // App Password (16 chars)
      },
      tls: {
        rejectUnauthorized: true
      }
    });

    // Email to your team
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1a0b2e 0%, #2a1540 50%, #1a0b2e 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .field { margin-bottom: 20px; }
          .label { font-weight: bold; color: #1a0b2e; margin-bottom: 5px; }
          .value { background: white; padding: 12px; border-radius: 4px; border: 1px solid #e5e7eb; }
          .reason-badge { display: inline-block; background: #E8C547; color: #1a0b2e; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin-top: 10px; }
          .footer { background: #1a0b2e; color: #E8C547; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌟 New Contact Form Submission</h1>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">Contact Reason:</div>
              <div class="reason-badge">${reason}</div>
            </div>
            <div class="field">
              <div class="label">Name:</div>
              <div class="value">${name}</div>
            </div>
            <div class="field">
              <div class="label">Email:</div>
              <div class="value"><a href="mailto:${email}">${email}</a></div>
            </div>
            ${phone ? `
            <div class="field">
              <div class="label">Phone:</div>
              <div class="value">${phone}</div>
            </div>
            ` : ''}
            ${company ? `
            <div class="field">
              <div class="label">Company:</div>
              <div class="value">${company}</div>
            </div>
            ` : ''}
            <div class="field">
              <div class="label">Message:</div>
              <div class="value">${message.replace(/\n/g, '<br>')}</div>
            </div>
          </div>
          <div class="footer">
            <p><strong>STAR Workforce Services</strong></p>
            <p>5465 Legacy Drive Suite 650, Plano, TX 75024</p>
            <p>Phone: (469) 713-3993</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
New Contact Form Submission

Contact Reason: ${reason}
Name: ${name}
Email: ${email}
${phone ? `Phone: ${phone}` : ''}
${company ? `Company: ${company}` : ''}

Message:
${message}

---
STAR Workforce Services
5465 Legacy Drive Suite 650, Plano, TX 75024
Phone: (469) 713-3993
    `;

    // Send email to your team
    await transporter.sendMail({
      from: `"STAR Workforce Contact Form" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      replyTo: email,
      subject: `New Contact: ${reason} - ${name}`,
      text: textContent,
      html: htmlContent
    });

    // Send confirmation email to submitter
    const confirmationHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1a0b2e 0%, #2a1540 50%, #1a0b2e 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .footer { background: #1a0b2e; color: #E8C547; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Message Received!</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Thank you for contacting <strong>STAR Workforce Services</strong>. We've received your inquiry regarding <strong>${reason}</strong> and will respond within 24 hours.</p>
            <p>In the meantime, feel free to:</p>
            <ul>
              <li>Browse our <a href="https://starworkforce.net/pages/jobs">238+ open positions</a></li>
              <li>Calculate your <a href="https://startekk.net/cost-calculator.html">offshore team savings</a></li>
              <li>Read our <a href="https://starworkforce.net/blog.html">latest insights</a></li>
            </ul>
            <p>If urgent, call us at <strong>(469) 713-3993</strong>.</p>
            <p>Best regards,<br><strong>STAR Workforce Team</strong></p>
          </div>
          <div class="footer">
            <p><strong>STAR Workforce Services, LLC</strong></p>
            <p>5465 Legacy Drive Suite 650, Plano, TX 75024</p>
            <p>Phone: (469) 713-3993 | Email: info@starworkforce.net</p>
            <p style="margin-top: 15px; color: #a0aec0;">Global Offices: USA 🇺🇸 | India 🇮🇳 | Canada 🇨🇦 | Australia 🇦🇺</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"STAR Workforce Services" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Thank you for contacting STAR Workforce Services',
      html: confirmationHtml
    });

    // Success
    return res.status(200).json({ 
      success: true,
      message: 'Email sent successfully! We\'ll respond within 24 hours.'
    });

  } catch (error) {
    console.error('Email send error:', error);
    
    return res.status(500).json({ 
      error: 'Failed to send email',
      message: 'Please try again or contact us directly at info@starworkforce.net',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
