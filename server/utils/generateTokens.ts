import { TokenService } from '../services/TokenService';

export const generateAccessToken = (id: string): string => TokenService.generateAccessToken(id);
export const generateRefreshToken = (id: string): string => TokenService.generateRefreshToken(id);

