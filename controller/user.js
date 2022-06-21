const randomToken = require("random-token");
const nodemailer = require("nodemailer");
const passwordHash = require("password-hash");
const User = require("../model/User");

const createUser = async (req, res) => {
  try {
    const { email } = req.body;

    const existUser = await User.findOne({ email: email });

    // Check for existing emails
    if (existUser) {
      res.status(400).json({ success: false, message: "Email already exist" });
      return;
    }

    // Creating user
    const user = await User.create({ ...req.body });

    // Creating jwt token
    const token = await user.createJwtToken(user._id);

    res.status(200).json({ success: true, token: token });
  } catch (error) {
    res.status(400).json({ success: false, message: "Somthing went wrong" });
  }
};

const checkUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existUser = await User.findOne({ email: email });

    // Check for existing emails
    if (!existUser) {
      res.status(400).json({
        success: false,
        message: "Email dose not exist please sign-up",
      });
      return;
    }

    // Check for password
    if (!existUser.checkPassword(password, existUser.password)) {
      res.status(400).json({ success: false, message: "Password is invalid" });
      return;
    }

    // Creating jwt token
    const token = await existUser.createJwtToken(existUser._id);

    res.status(200).json({ success: true, token: token });
  } catch (error) {
    res.status(400).json({ success: false, message: "Somthing went wrong" });
  }
};

const resetToken = async (req, res) => {
  try {
    const { email } = req.body;

    const existUser = await User.findOne({ email: email });

    // Check for existing emails
    if (!existUser) {
      res.status(400).json({
        success: false,
        message: "Email dose not exist please sign-up",
      });
      return;
    }

    const reset_token = randomToken(16);

    const reset_token_expire_date = new Date(
      new Date().getTime() + 15 * 60000
    ).toString();

    // Update token and expire date
    await User.findOneAndUpdate(
      { email },
      { reset_token, reset_token_expire_date }
    );

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_USER_PASSWORD,
      },
    });

    var mailOptions = {
      from: process.env.NODEMAILER_USER,
      to: email,
      subject: "Reset password",
      html: `<div>
      <h3>Please click on the link given below to reset password <h3/>
      <a href=http://localhost:3000/update-password/${reset_token}>http://localhost:3000/update-password/${reset_token}</a>
      </div>`,
    };

    // Send email
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    res.status(200).json({
      success: true,
      message: "Please check your email for resetting your password",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, message: "Somthing went wrong" });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { password, conform_password } = req.body;

    const { reset_token } = req.params;

    const existUser = await User.findOne({ reset_token });

    // Check for existing token
    if (!existUser) {
      res.status(400).json({
        success: false,
        message: "Wrong update token please try again",
      });
      return;
    }

    // Check for expire token
    if (existUser.reset_token_expire_date < new Date()) {
      res.status(400).json({
        success: false,
        message: "Link expire please try again",
      });
      return;
    }

    // Check for password
    if (password !== conform_password) {
      res.status(400).json({
        success: false,
        message: "Password and Coform Password should be same",
      });
      return;
    }

    // Update passwords
    const updatedUser = await User.findOneAndUpdate(
      { reset_token },
      { password: passwordHash.generate(password) }
    );

    res.status(200).json({
      success: true,
      message: "Updated password",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, message: "Somthing went wrong" });
  }
};

module.exports = {
  createUser,
  checkUser,
  resetToken,
  updatePassword,
};
