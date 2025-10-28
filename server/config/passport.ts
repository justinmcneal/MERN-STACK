import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

interface GoogleProfile {
  displayName: string;
  emails?: Array<{ value: string }>;
}

interface GoogleUser {
  name: string;
  email: string;
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (accessToken: string, refreshToken: string, profile: GoogleProfile, done: (error: any, user?: GoogleUser) => void) => {
      try {
        const user: GoogleUser = {
          name: profile.displayName,
          email: profile.emails?.[0]?.value || '',
        };
        return done(null, user);
      } catch (err) {
        return done(err, undefined);
      }
    }
  )
);

passport.serializeUser((user: any, done: (error: any, user: any) => void) => done(null, user));
passport.deserializeUser((obj: any, done: (error: any, user: any) => void) => done(null, obj));

export default passport;

