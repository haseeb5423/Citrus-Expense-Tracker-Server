// Simple but effective logging utility
const LogLevel = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

const colors = {
  ERROR: '\x1b[31m', // Red
  WARN: '\x1b[33m',  // Yellow
  INFO: '\x1b[36m',  // Cyan
  DEBUG: '\x1b[90m', // Gray
  RESET: '\x1b[0m'
};

class Logger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production';
  }
  
  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const color = colors[level] || colors.RESET;
    const reset = colors.RESET;
    
    let logMessage = `${color}[${timestamp}] [${level}]${reset} ${message}`;
    
    if (Object.keys(meta).length > 0) {
      logMessage += `\n${color}Meta:${reset} ${JSON.stringify(meta, null, 2)}`;
    }
    
    return logMessage;
  }
  
  log(level, message, meta = {}) {
    const formattedMessage = this.formatMessage(level, message, meta);
    
    if (level === LogLevel.ERROR) {
      console.error(formattedMessage);
    } else if (level === LogLevel.WARN) {
      console.warn(formattedMessage);
    } else {
      console.log(formattedMessage);
    }
  }
  
  error(message, meta = {}) {
    this.log(LogLevel.ERROR, message, meta);
  }
  
  warn(message, meta = {}) {
    this.log(LogLevel.WARN, message, meta);
  }
  
  info(message, meta = {}) {
    this.log(LogLevel.INFO, message, meta);
  }
  
  debug(message, meta = {}) {
    if (this.isDevelopment) {
      this.log(LogLevel.DEBUG, message, meta);
    }
  }
  
  // HTTP request logger middleware
  requestLogger() {
    return (req, res, next) => {
      const start = Date.now();
      
      // Log request
      this.debug(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('user-agent')
      });
      
      // Log response when finished
      res.on('finish', () => {
        const duration = Date.now() - start;
        const level = res.statusCode >= 400 ? LogLevel.ERROR : LogLevel.DEBUG;
        
        this.log(level, `${req.method} ${req.path} - ${res.statusCode}`, {
          duration: `${duration}ms`,
          ip: req.ip
        });
      });
      
      next();
    };
  }
}

export const logger = new Logger();
