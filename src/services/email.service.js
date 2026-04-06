import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // IMPORTANT
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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


export const sendOTPEmail = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: `"Voxy Live" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      html: `<h2>Your OTP is: ${otp}</h2>`,
    });
  } catch (err) {
    console.error("EMAIL ERROR:", err.message);
    throw new Error("Email sending failed");
  }
};