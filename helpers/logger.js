/**
 * Logger simple pour l'application
 */

const logger = {
  info: (message, data = {}) => {
    console.log(`ℹ️ [INFO] ${message}`, data);
  },

  error: (message, error = null) => {
    console.error(`❌ [ERROR] ${message}`, error || '');
  },

  warn: (message, data = {}) => {
    console.warn(`⚠️ [WARN] ${message}`, data);
  },

  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🐛 [DEBUG] ${message}`, data);
    }
  },

  success: (message, data = {}) => {
    console.log(`✅ [SUCCESS] ${message}`, data);
  }
};

module.exports = logger;
