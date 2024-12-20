import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import passport from "passport";
import bcrypt from "bcryptjs";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

const prisma = new PrismaClient();

passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser(async (id, done) => {
  try {
    // Fetch the user object from your database using the ID
    const user = await prisma.users.findUnique({
      where: { user_id: id as string },
    });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "/api/v1/auth/google/callback",
      scope: ["email", "profile"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.users.findUnique({
          where: { email: profile.emails![0].value },
        });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(
          profile.emails![0].value,
          salt
        );

        if (!user) {
          user = await prisma.users.create({
            data: {
              email: profile.emails![0].value,
              role: "student",
              user_id: profile.id,
              password: hashedPassword,
            },
          });

          return done(null, {
            success: true,
            user,
          });
        }

        return done(null, {
          success: true,
          user,
        });
      } catch (error) {
        return done(error);
      }
    }
  )
);

export default passport;
