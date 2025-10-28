import jwt from 'jsonwebtoken';
import ms from 'ms';

const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_EXPIRE = process.env.ACCESS_TOKEN_EXPIRE;
const REFRESH_TOKEN_EXPIRE = process.env.REFRESH_TOKEN_EXPIRE;

if (!JWT_SECRET || !ACCESS_TOKEN_EXPIRE || !REFRESH_TOKEN_EXPIRE) {
  throw new Error('Missing required JWT environment variables');
}

const parseExpire = (value: string): number => {
  const duration = ms(value as ms.StringValue);
  if (duration === undefined) throw new Error(`Invalid expire format: ${value}`);
  return Math.floor(duration / 1000);
};

const generateToken = (id: string, expiresIn: string): string => 
  jwt.sign({ id }, JWT_SECRET, { expiresIn: parseExpire(expiresIn) });

export const generateAccessToken = (id: string): string => generateToken(id, ACCESS_TOKEN_EXPIRE);
export const generateRefreshToken = (id: string): string => generateToken(id, REFRESH_TOKEN_EXPIRE);
