import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

export const registerController = async (req, res) => {
  const { name, email, password, phone, address, answer } = req.body;

  try {
    if (!name || !email || !password || !phone || !address || !answer) {
      return res.send({
        error: true,
        message: "Fields can't be empty it is required",
      });
    }

    const user = await userModel.findOne({ email });

    if (user) {
      res
        .status(200)
        .send({ success: true, message: "User Already Exists,Kindly Login" });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await userModel({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      answer,
    });

    await newUser.save();

    res
      .status(201)
      .send({ success: true, message: "Successfully Created User", newUser });
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .send({ success: false, message: "Error in Registration", error });
  }
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .send({ success: false, message: "Fields can't be empty" });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .send({ success: false, message: "User Not Found" });
    }

    const doMatch = await bcrypt.compare(password, user.password);

    if (!doMatch) {
      return res
        .status(400)
        .send({ success: false, message: "Invalid Username or Password" });
    }

    // Create a token only upon successful authentication
    const token = jwt.sign({ _id: user._id }, "" + process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).send({
      token,
      success: true,
      message: "Login Successfully",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};

export const forgotPasswordController = async (req, res) => {
  const { email, answer, newpassword } = req.body;
  try {
    if (!email || !newpassword || !answer) {
      res
        .status(400)
        .json({ message: "Fields can't be empty", success: false });
    }
    const user = await userModel.findOne({ email, answer });
    if (!user) {
      res
        .status(400)
        .send({ success: false, message: "Wrong Email or password" });
    }
    const hashed = await hashPassword(newpassword);
    await userModel.findByIdAndUpdate(user._id, { password: hashed });
    res
      .status(200)
      .send({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ success: false, error, message: "Something went wrong" });
  }
};

export const updateProfileController = async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;

    const user = await userModel.findOne({email});

    if (password && password.length < 6) {
      return res.json({ error: "Password Required and 6 chars long" });
    }
    const hashedPassword = password ? await hashPassword(password) : undefined;
    const updatedUser = await userModel.findByIdAndUpdate(
     user._id,
      {       
        name: name || user.name,
        password: hashedPassword || user.password,
        email:email || user.email,
        phone: phone || user.phone,
        address: address || user.address,
      },
      { new: true }
    );
    res.status(200).send({success:true,message:"Profile Updated Successfully",updatedUser});
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, error, message: "Internal Server Error" });
  }
};


export const allUserController = async (req, res) => {
  try {
    
    const Users=await userModel.find({});
    res.status(200).send({success:true,message:"Fetched Data Successfully",Users});
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, error, message: "Internal Server Error" });
  }
};