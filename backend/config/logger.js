/**
 * Simple production-safe logger
 * In production: only logs warnings and errors
 * In development: logs everything
 */
const isProduction = process.env.NODE_ENV === 'production';

const logger = {
  info: (...args) => {
    if (!isProduction) {
      console.log('[INFO]', new Date().toISOString(), ...args);
    }
  },
  warn: (...args) => {
    console.warn('[WARN]', new Date().toISOString(), ...args);
  },
  error: (...args) => {
    console.error('[ERROR]', new Date().toISOString(), ...args);
  },
  debug: (...args) => {
    if (!isProduction) {
      console.log('[DEBUG]', new Date().toISOString(), ...args);
    }
  }
};

module.exports = logger;
