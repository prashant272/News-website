const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const OTPModel = require("../Models/otp.model");

dotenv.config({ path: "./Config/config.env" })



exports.sendOTP = async (req, res) => {
  try {
    const { UserEmail } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });


  const mailOptions = {
  from: "tobi909144@gmail.com",
  to: "tobi909144@gmail.com",
  subject: "New Account Creation OTP – Action Required",
  html: `
    <h3>New Account Registration</h3>
    <p>A new user has requested account creation.</p>
    <p><strong>OTP:</strong> ${otp}</p>
    <p>This OTP will expire in 5 minutes.</p>
    <p>Please use this OTP to approve the account.</p>
  `,
};


    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return res.status(500).json({ Status: "Error sending email" });
      } else {
        res.json({ Status: "OTP Sent Successfully", email: UserEmail });
      }
    });

    const otpInstance = new OTPModel({
      email: UserEmail,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    await otpInstance.save();

  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ Status: "Error", message: error.message });
  }
}


exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await OTPModel.findOne({ email });

    if (!otpRecord) {
      return res.send({ msg: "No OTP found for this email" });
    }

    if (otpRecord.expiresAt < new Date()) {
      return res.send({ msg: "OTP has expired" });
    }

    if (otpRecord.otp !== otp) {
      return res.send({ msg: "Invalid OTP" });
    }


    await OTPModel.deleteOne({ email });

    res.status(200).send({ msg: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ msg: error.message });
  }
};
