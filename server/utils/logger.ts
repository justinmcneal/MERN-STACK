type LogLevel = 'info' | 'error' | 'warn' | 'success';

const colors = {
  info: '\x1b[36m',
  error: '\x1b[31m',
  warn: '\x1b[33m',
  success: '\x1b[32m',
  reset: '\x1b[0m'
};

const icons = {
  info: '🔵',
  error: '❌',
  warn: '⚠️',
  success: '✅'
};

class Logger {
  private log(level: LogLevel, message: string, meta?: any): void {
    const timestamp = new Date().toISOString();
    const color = colors[level];
    const icon = icons[level];
    const prefix = `${color}${icon} [${timestamp}]${colors.reset}`;
    
    if (meta) {
      process.stdout.write(`${prefix} ${message}\n${JSON.stringify(meta, null, 2)}\n`);
    } else {
      process.stdout.write(`${prefix} ${message}\n`);
    }
  }

  info(message: string, meta?: any): void {
    this.log('info', message, meta);
  }

  error(message: string, error?: any): void {
    this.log('error', message, error);
  }

  warn(message: string, meta?: any): void {
    this.log('warn', message, meta);
  }

  success(message: string, meta?: any): void {
    this.log('success', message, meta);
  }
}

export default new Logger();
