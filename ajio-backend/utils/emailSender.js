const axios = require('axios');

const sendBrevoEmail = async (toEmail, subject, htmlContent, attachmentPath) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "AJIO Clone",
          email: process.env.EMAIL_USER,
        },
        to: [{ email: toEmail }],
        subject,
        htmlContent,
        textContent: "Order placed successfully",
        attachment: [
          {
            url: attachmentPath,
            name: attachmentPath.split("/").pop(),  
          },
        ],
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "content-type": "application/json",
          accept: "application/json",
        },
      }
    );

    console.log("Email sent:", response.data);
  } catch (error) {
    console.error("Error sending email with attachment:", error.response?.data || error.message);
  }
};

module.exports = { sendBrevoEmail };