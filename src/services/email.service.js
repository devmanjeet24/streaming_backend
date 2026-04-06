// import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// export const sendOTPEmail = async (email, otp) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     await transporter.sendMail({
//       from: `"Voxy Live" <${process.env.EMAIL_USER}>`,
//       to: email,
//       subject: "Your OTP Code",
//       html: `<h2>Your OTP is: ${otp}</h2>`,
//     });

//   } catch (err) {
//     console.error("EMAIL ERROR:", err.message);
//     throw new Error("Email sending failed");
//   }
// };

// ############# NEW CODE BY MANJEET ############# 


import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendOTPEmail = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: `"Voxy Live" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your OTP Code",
      html: `
        <h2>Your OTP is: ${otp}</h2>
        <p>Valid for 30 seconds</p>
      `,
    });

    console.log("✅ OTP SENT");

  } catch (err) {
    console.error("❌ EMAIL ERROR:", err);
    throw new Error("Email sending failed");
  }
};