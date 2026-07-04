const nodemailer = require("nodemailer");

const emailUser = process.env.EMAIL;
const emailPassword = process.env.EMAIL_PASSWORD;

if (!emailUser || !emailPassword) {
  throw new Error("EMAIL and EMAIL_PASSWORD must be set in .env");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPassword,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"ScholarHub" <${emailUser}>`,
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;