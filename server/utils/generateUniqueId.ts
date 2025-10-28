const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export const generateUniqueId = (length = 8): string =>
  Array.from({ length }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
