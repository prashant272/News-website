const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../Models/user.model');
const permissionsByRole = require('../Config/permissions.js');

const SIGNUP_SECRET_KEY = process.env.SIGNUP_SECRET_KEY;
const SIGNIN_SECRET_KEY = process.env.SIGNIN_SECRET_KEY;


exports.UserSignUp = async (req, res) => {
  try {
    const { email, password, role, secretKey } = req.body;


    if (!SIGNUP_SECRET_KEY) {
      return res.status(500).json({
        success: false,
        msg: "Server configuration error: Secret key not set"
      });
    }

    if (!secretKey || secretKey !== SIGNUP_SECRET_KEY) {
      return res.status(401).json({
        success: false,
        msg: "Invalid secret key"
      });
    }

    const checkUser = await User.findOne({ email: email });
    if (checkUser) {
      return res.status(409).json({
        success: false,
        msg: "User already exists"
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        msg: "Password must be at least 6 characters long"
      });
    }

    const userRole = role || 'USER';
    const permissions = permissionsByRole[userRole] || permissionsByRole['USER'];

    const Salt = await bcrypt.genSalt(12);
    const hashpassword = await bcrypt.hash(password, Salt);

    const NewUser = new User({
      ...req.body,
      password: hashpassword,
      role: userRole,
      permissions: permissions
    });

    const user = await NewUser.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(201).json({
      success: true,
      user: userResponse,
      msg: "Your Account is Created"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: "Server error during registration"
    });
  }
};

exports.UserSignIn = async (req, res) => {
  try {
    const { email, password, role, secretKey } = req.body;


    if (!email || !password) {
      return res.status(400).json({
        success: false,
        msg: "Email and password are required"
      });
    }

    // Normalize role to uppercase to match database
    const userRole = role ? role.toUpperCase() : null;

    if (userRole === "SUPER_ADMIN") {
      if (!SIGNIN_SECRET_KEY) {
        return res.status(500).json({
          success: false,
          msg: "Server configuration error: Secret key not set"
        });
      }

      if (!secretKey || secretKey !== SIGNIN_SECRET_KEY) {
        return res.status(401).json({
          success: false,
          msg: "Invalid secret key for Super Admin"
        });
      }
    }

    const query = { email: email };
    if (userRole && userRole !== "SUPER_ADMIN") {
      query.role = userRole;
    }

    const user = await User.findOne(query).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: `User with role "${userRole || 'any'}" does not exist`
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        msg: "Account is deactivated"
      });
    }

    const verify = await bcrypt.compare(password, user.password);

    if (!verify) {
      return res.status(401).json({
        success: false,
        msg: "Wrong password"
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      },
      process.env.SECRET,
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.REFRESH_SECRET || process.env.SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      token,
      refreshToken,
      userId: user._id,
      profilepic: user.ProfilePicture,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
      msg: "Welcome"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: "Server error during login"
    });
  }
};
