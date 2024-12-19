import express, { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { UserInterface } from "../interfaces/interface.user";

dotenv.config();

const userAuthRouter = express.Router();
const prisma = new PrismaClient();

// Register
userAuthRouter.post(
  "/register",
  async (request: Request, response: Response): Promise<any> => {
    const { email, password, role } = request.body;

    // Validate request body
    if (!role || !email || !password) {
      return response.status(400).json({
        success: false,
        message: "Please enter all fields",
      });
    }

    try {
      // Verify if email exists on db.
      const credentialExists = await prisma.users.findUnique({
        where: {
          email: email,
        },
      });

      if (credentialExists) {
        return response.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }

      // Hash password.
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user: UserInterface = await prisma.users.create({
        data: {
          role: role,
          email: email,
          password: hashedPassword,
        },
      });

      const token = jwt.sign(
        {
          user_id: user.user_id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET as string,
        { expiresIn: "30d" }
      );

      // Token generated
      if (token) {
        return response.status(200).json({
          success: true,
          message: "User created successfully",
          token: token,
        });
      } else {
        return response.status(400).json({
          success: false,
          message: "user not created",
        });
      }
    } catch (error) {
      console.error(error);
      return response.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// Login
userAuthRouter.post(
  "/login",
  async (request: Request, response: Response): Promise<any> => {
    const { email, password } = request.body;

    // Validate request body
    if (!email || !password) {
      return response.status(400).json({
        success: false,
        message: "Please enter all fields",
      });
    }

    try {
      // Verify if email exists on db.
      const credentialExists = await prisma.users.findUnique({
        where: {
          email: email,
        },
      });

      if (!credentialExists) {
        return response.status(400).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Hash password.
      const isPasswordMatch = await bcrypt.compare(
        password,
        credentialExists.password
      );

      if (!isPasswordMatch) {
        return response.status(400).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      const token = jwt.sign(
        {
          user_id: credentialExists.user_id,
          email: credentialExists.email,
          role: credentialExists.role,
        },
        process.env.JWT_SECRET as string,
        { expiresIn: "30d" }
      );

      // Token generated
      if (token) {
        return response.status(200).json({
          success: true,
          message: "User logged in successfully",
          token: token,
        });
      } else {
        return response.status(400).json({
          success: false,
          message: "User not logged in",
        });
      }
    } catch (error) {
      console.error(error);
      return response.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

export default userAuthRouter;
