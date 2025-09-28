import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Extract just name & email
        const user = {
          name: profile.displayName,
          email: profile.emails?.[0].value,
        };
        return done(null, user);
      } catch (err) {
        return done(err, undefined);
      }
    }
  )
);

// Serialize & deserialize (keeps session user small)
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj: any, done) => done(null, obj));

export default passport;
