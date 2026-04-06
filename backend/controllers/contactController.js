// controllers/contactController.js — Contact Form (ESM)

import Contact from '../models/Contact.js';
import nodemailer from 'nodemailer';

export const submitContact = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;
    
    // 1. Save to database
    const contact = await Contact.create({ name, email, message });

    // 2. Send Email Notification
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: `"${name}" <${process.env.EMAIL_USER}>`, 
        to: process.env.EMAIL_RECEIVER,
        subject: `New Contact Message: ${name}`,
        text: `You have received a new message from the GoHealthy contact form.\n\n👤 Name: ${name}\n✉️ Email: ${email}\n\n📝 Message:\n${message}`,
        replyTo: email,
      };

      await transporter.sendMail(mailOptions);
      console.log('Contact email sent successfully to', process.env.EMAIL_RECEIVER);
    } catch (emailError) {
      console.error('Failed to send contact email. Check EMAIL_USER and EMAIL_PASS:', emailError.message);
      // We don't fail the response if email fails, it's still saved in DB.
    }

    // 3. Respond to client
    res.status(201).json({
      success: true,
      data: { id: contact._id, name: contact.name, createdAt: contact.createdAt },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllMessages = async (req, res, next) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};
