import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import session from 'express-session';

interface GoogleProfile {
  displayName: string;
  emails?: Array<{ value: string }>;
}

interface GoogleUser {
  name: string;
  email: string;
}

const router = express.Router();
const hasGoogleConfig = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

router.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
router.use(passport.initialize());
router.use(passport.session());

if (hasGoogleConfig) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5001/api/auth/google/callback',
      },
      async (_accessToken: string, _refreshToken: string, profile: GoogleProfile, done: (error: unknown, user?: GoogleUser) => void) => {
        const user: GoogleUser = {
          name: profile.displayName,
          email: profile.emails?.[0]?.value || '',
        };
        return done(null, user);
      }
    )
  );

  passport.serializeUser((user: unknown, done: (error: unknown, user: unknown) => void) => done(null, user));
  passport.deserializeUser((user: unknown, done: (error: unknown, user: unknown) => void) => done(null, user));

  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

  router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req: any, res) => {
      if (!req.user) {
        return res.redirect(`${process.env.CLIENT_URL}/login?error=google_failed`);
      }

      const secret = process.env.JWT_SECRET;
      if (!secret) {
        return res.redirect(`${process.env.CLIENT_URL}/login?error=missing_jwt_secret`);
      }

      const payload = {
        name: req.user.name,
        email: req.user.email,
      };

      const token = jwt.sign(payload, secret, { expiresIn: '1h' });
      return res.redirect(`${process.env.CLIENT_URL}/google-auth?token=${token}`);
    }
  );
} else {
  router.get('/google', (_req, res) => {
    res.status(501).json({
      message: 'Google OAuth not configured',
      error: 'Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file',
    });
  });
}

router.get('/google/me', (req, res) => {
  try {
    const token = req.query.token as string;
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'JWT secret not configured' });
    }

    const decoded = jwt.verify(token, secret);
    return res.json(decoded);
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
