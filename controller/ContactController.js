const Contact = require("../model/contactModel");
const sendEmail  = require("../config/email"); 

const sendContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Save to MongoDB
    const contact = new Contact({
      name,
      email,
      subject,
      message,
    });

    const savedContact = await contact.save();

    // Send confirmation email to user
    await sendEmail({
      to: email,
      subject: "Thank You for Contacting Us",
      html: `
        <h2>Hello ${name},</h2>

        <p>Thank you for contacting us.</p>

        <p>We have successfully received your message. Our team will contact you as soon as possible.</p>

        <hr>

        <h3>Your Submitted Details</h3>

        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong> ${message}</p>

        <br>

        <p>Regards,</p>
        <h3>ScholarHub</h3>
      `,
    });

    // Send email to admin
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: "New Contact Form Submission",
      html: `
        <h2>New Contact Form Received</h2>

        <table border="1" cellpadding="8" cellspacing="0">
          <tr>
            <th align="left">Name</th>
            <td>${name}</td>
          </tr>

          <tr>
            <th align="left">Email</th>
            <td>${email}</td>
          </tr>

          <tr>
            <th align="left">Subject</th>
            <td>${subject}</td>
          </tr>

          <tr>
            <th align="left">Message</th>
            <td>${message}</td>
          </tr>
        </table>
      `,
    });

    return res.status(201).json({
      success: true,
      message: "Message sent successfully.",
      contact: savedContact,
    });

  } catch (err) {
    console.error("Contact Error:", err);

    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
      error: err.message,
    });
  }
};

module.exports = {
  sendContact,
};