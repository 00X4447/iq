import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { UserInterface } from "../user/interfaces/interface.user";

dotenv.config();

const classroomRouter = express.Router();
const prisma = new PrismaClient();

classroomRouter.post(
  "/create",
  async (request: Request, response: Response): Promise<any> => {
    const { name, description } = request.body;

    if (!name || !description) {
      return response.status(400).json({
        success: false,
        message: "Please enter all fields",
      });
    }
    try {
      const authHeader = request.headers.authorization;

      // Check for Authorization header
      if (!authHeader) {
        return response.status(401).json({
          success: false,
          message: "Missing Authorization header",
        });
      }

      const token = authHeader.split(" ")[1];

      // Check for token
      if (!token) {
        return response.status(401).json({
          success: false,
          message: "Missing Authorization header",
        });
      }

      // Verify the token
      const decodedToken = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as UserInterface;

      if (!decodedToken || !decodedToken.user_id) {
        return response.status(403).json({
          success: false,
          message: "Invalid or missing user_id in token",
        });
      }

      // Check if the user is a teacher
      const user = await prisma.users.findUnique({
        where: {
          user_id: decodedToken.user_id,
          role: "teacher",
        },
      });

      if (!user) {
        return response.status(403).json({
          success: false,
          message: "You are not authorized to create a classroom",
        });
      }

      const classroomExists = await prisma.classrooms.findFirst({
        where: {
          teacher_id: decodedToken.user_id,
          name: name,
        },
      });

      if (classroomExists) {
        return response.status(400).json({
          success: false,
          message: "Classroom already exists",
        });
      }

      const classroom_code = Math.random().toString(36).substring(7);

      const newClassroom = await prisma.classrooms.create({
        data: {
          name,
          description,
          teacher_id: decodedToken.user_id,
          classroom_code,
        },
      });

      if (!newClassroom) {
        return response.status(500).json({
          success: false,
          message: "Failed to create classroom",
        });
      }

      return response.status(201).json({
        success: true,
        message: "Classroom created successfully",
        data: newClassroom,
      });
    } catch (error) {
      console.error(error);
      return response.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

classroomRouter.post(
  "/join",
  async (request: Request, response: Response): Promise<any> => {
    const { classroom_code } = request.body;

    if (!classroom_code) {
      return response.status(400).json({
        success: false,
        message: "Please enter all fields",
      });
    }

    try {
      const authHeader = request.headers.authorization;

      // Check for Authorization header
      if (!authHeader) {
        return response.status(401).json({
          success: false,
          message: "Missing Authorization header",
        });
      }

      const token = authHeader.split(" ")[1];

      // Check for token
      if (!token) {
        return response.status(401).json({
          success: false,
          message: "Missing Authorization header",
        });
      }

      // Verify the token
      const decodedToken = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as UserInterface;

      if (!decodedToken || !decodedToken.user_id) {
        return response.status(403).json({
          success: false,
          message: "Invalid or missing user_id in token",
        });
      }

      const classroom = await prisma.classrooms.findFirst({
        where: {
          classroom_code: classroom_code,
        },
      });

      if (!classroom) {
        return response.status(404).json({
          success: false,
          message: "Classroom not found",
        });
      }

      const user = await prisma.users.findUnique({
        where: {
          user_id: decodedToken.user_id,
        },
      });

      if (!user) {
        return response.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const classroomJoin = await prisma.users.update({
        where: {
          user_id: decodedToken.user_id,
        },
        data: {
          classrooms: {
            connect: {
              classroom_code: classroom_code,
            },
          },
        },
      });

      if (!classroomJoin) {
        return response.status(500).json({
          success: false,
          message: "Failed to join classroom",
        });
      }

      return response.status(200).json({
        success: true,
        message: "Classroom joined successfully",
        data: classroomJoin,
      });
    } catch (error) {
      console.error(error);
      return response.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

classroomRouter.get(
  "/classrooms",
  async (request: Request, response: Response): Promise<any> => {
    try {
      const authHeader = request.headers.authorization;

      // Check for Authorization header
      if (!authHeader) {
        return response.status(401).json({
          success: false,
          message: "Missing Authorization header",
        });
      }

      const token = authHeader.split(" ")[1];

      // Check for token
      if (!token) {
        return response.status(401).json({
          success: false,
          message: "Missing Authorization header",
        });
      }

      // Verify the token
      const decodedToken = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as UserInterface;

      if (!decodedToken || !decodedToken.user_id) {
        return response.status(403).json({
          success: false,
          message: "Invalid or missing user_id in token",
        });
      }

      // Fetch the user with their joined classrooms
      const user = await prisma.users.findUnique({
        where: {
          user_id: decodedToken.user_id,
        },
        include: {
          classrooms: true, // Include the classrooms the user has joined
        },
      });

      if (!user) {
        return response.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Extract the classrooms from the user object
      const classrooms = user.classrooms;

      return response.status(200).json({
        success: true,
        message: "Classrooms found",
        data: classrooms,
      });
    } catch (error) {
      console.error(error);
      return response.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

export default classroomRouter;
