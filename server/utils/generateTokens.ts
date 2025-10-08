
import jwt from 'jsonwebtoken';
import ms from 'ms';

const parseExpire = (value: string): number => {
  const duration = ms(value as ms.StringValue);
  if (duration === undefined) throw new Error(`Invalid expire format: ${value}`);
  return Math.floor(duration / 1000);
};


export const generateAccessToken = (id: string): string => {
  const JWT_SECRET = process.env.JWT_SECRET;
  const ACCESS_TOKEN_EXPIRE = process.env.ACCESS_TOKEN_EXPIRE;
  if (!JWT_SECRET) throw new Error('JWT_SECRET not set');
  if (!ACCESS_TOKEN_EXPIRE) throw new Error('ACCESS_TOKEN_EXPIRE not set');
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: parseExpire(ACCESS_TOKEN_EXPIRE),
  });
};

export const generateRefreshToken = (id: string): string => {
  const JWT_SECRET = process.env.JWT_SECRET;
  const REFRESH_TOKEN_EXPIRE = process.env.REFRESH_TOKEN_EXPIRE;
  if (!JWT_SECRET) throw new Error('JWT_SECRET not set');
  if (!REFRESH_TOKEN_EXPIRE) throw new Error('REFRESH_TOKEN_EXPIRE not set');
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: parseExpire(REFRESH_TOKEN_EXPIRE),
  });
};
