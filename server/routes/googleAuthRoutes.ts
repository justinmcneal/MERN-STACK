// routes/googleAuthRoutes.ts

import express from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import session from "express-session";

interface GoogleProfile {
  displayName: string;
  emails?: Array<{ value: string }>;
}

interface GoogleUser {
  name: string;
  email: string;
}

const router = express.Router();

// Session middleware (needed by Passport)
router.use(session({ secret: "secret", resave: false, saveUninitialized: true }));
router.use(passport.initialize());
router.use(passport.session());

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (accessToken: string, refreshToken: string, profile: GoogleProfile, done: (error: any, user?: GoogleUser) => void) => {
      // You can add DB lookup here to save/find user
      const user: GoogleUser = {
        name: profile.displayName,
        email: profile.emails?.[0]?.value || '',
      };
      return done(null, user);
    }
  )
);

passport.serializeUser((user: any, done: (error: any, user: any) => void) => done(null, user));
passport.deserializeUser((user: any, done: (error: any, user: any) => void) => done(null, user));

// Start Google Login
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Handle Callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req: any, res) => {
    if (!req.user) {
      console.error("No user object from Google OAuth");
      return res.redirect(`${process.env.CLIENT_URL}/login?error=google_failed`);
    }

    // Build a safe payload
    const payload = {
      name: req.user.name,
      email: req.user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "1h" });

    // Redirect to your frontend with the token
    res.redirect(`${process.env.CLIENT_URL}/google-auth?token=${token}`);
  }
);

// Verify token and return user
router.get("/google/me", (req, res) => {
  try {
    const token = req.query.token as string;
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    res.json(decoded);
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
