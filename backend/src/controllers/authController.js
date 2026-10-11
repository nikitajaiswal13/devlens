const User = require("../models/User");
const { signToken } = require("../utils/jwt");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isDuplicateEmailError(error) {
  return Boolean(error && error.code === 11000);
}

function getRegisterValidationMessage(name, email, password) {
  if (!name || !email || !password) {
    return "Name, email, and password are required";
  }

  if (typeof name !== "string" || !name.trim()) {
    return "Name is required";
  }

  if (typeof email !== "string" || !EMAIL_PATTERN.test(email.trim())) {
    return "Please provide a valid email address";
  }

  if (typeof password !== "string" || password.length < 8) {
    return "Password must be at least 8 characters";
  }

  return null;
}

function getLoginValidationMessage(email, password) {
  if (!email || !password) {
    return "Email and password are required";
  }

  if (typeof email !== "string" || !EMAIL_PATTERN.test(email.trim())) {
    return "Please provide a valid email address";
  }

  return null;
}

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body || {};
    const validationMessage = getRegisterValidationMessage(name, email, password);

    if (validationMessage) {
      return res.status(400).json({
        success: false,
        message: validationMessage,
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    const token = signToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        user: user.toSafeObject(),
        token,
      },
    });
  } catch (error) {
    if (isDuplicateEmailError(error)) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    const validationMessage = getLoginValidationMessage(email, password);

    if (validationMessage) {
      return res.status(400).json({
        success: false,
        message: validationMessage,
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = signToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: user.toSafeObject(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

function me(req, res) {
  return res.status(200).json({
    success: true,
    data: {
      user: req.user.toSafeObject(),
    },
  });
}

module.exports = {
  register,
  login,
  me,
};
