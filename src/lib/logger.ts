// Frontend logging utility
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogOptions {
  level?: LogLevel;
  component?: string;
  data?: any;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private formatMessage(level: LogLevel, component: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${component}]`;
    return `${prefix} ${message}`;
  }

  private log(level: LogLevel, component: string, message: string, data?: any) {
    if (!this.isDevelopment && level === 'debug') {
      return; // Skip debug logs in production
    }

    const formattedMessage = this.formatMessage(level, component, message, data);
    const logData = data ? { message, ...data } : message;

    switch (level) {
      case 'error':
        console.error(formattedMessage, logData);
        break;
      case 'warn':
        console.warn(formattedMessage, logData);
        break;
      case 'debug':
        console.debug(formattedMessage, logData);
        break;
      default:
        console.log(formattedMessage, logData);
    }
  }

  info(component: string, message: string, data?: any) {
    this.log('info', component, message, data);
  }

  warn(component: string, message: string, data?: any) {
    this.log('warn', component, message, data);
  }

  error(component: string, message: string, data?: any) {
    this.log('error', component, message, data);
  }

  debug(component: string, message: string, data?: any) {
    this.log('debug', component, message, data);
  }

  // API call logging
  apiCall(url: string, method: string, payload?: any) {
    this.info('API', `Making ${method} request to ${url}`, {
      method,
      url,
      payloadSize: payload ? JSON.stringify(payload).length : 0,
      timestamp: Date.now(),
    });
  }

  apiResponse(url: string, status: number, data?: any) {
    this.info('API', `Response from ${url}`, {
      status,
      statusText: status >= 200 && status < 300 ? 'SUCCESS' : 'ERROR',
      dataSize: data ? JSON.stringify(data).length : 0,
      timestamp: Date.now(),
    });
  }

  apiError(url: string, error: any) {
    this.error('API', `Error calling ${url}`, {
      error: error.message || error,
      stack: error.stack,
      timestamp: Date.now(),
    });
  }
}

export const logger = new Logger();
