// Request validation middleware
import validator from 'validator';

// Sanitize string to prevent XSS
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return validator.escape(str.trim());
};

// Deep sanitize object
const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;
  
  const sanitized = Array.isArray(obj) ? [] : {};
  
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      sanitized[key] = sanitizeString(obj[key]);
    } else if (typeof obj[key] === 'object') {
      sanitized[key] = sanitizeObject(obj[key]);
    } else {
      sanitized[key] = obj[key];
    }
  }
  
  return sanitized;
};

// Validation schemas
export const validateRegistration = (req, res, next) => {
  const { email, password, name } = req.body;
  
  const errors = [];
  
  // Email validation
  if (!email || !validator.isEmail(email)) {
    errors.push('Valid email is required');
  }
  
  // Name validation
  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }
  
  // Password validation
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  
  if (password && !validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 0
  })) {
    errors.push('Password must contain at least one uppercase letter, one lowercase letter, and one number');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  
  // Sanitize inputs
  req.body.email = validator.normalizeEmail(email);
  req.body.name = sanitizeString(name);
  
  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  
  const errors = [];
  
  if (!email || !validator.isEmail(email)) {
    errors.push('Valid email is required');
  }
  
  if (!password || password.length === 0) {
    errors.push('Password is required');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  
  req.body.email = validator.normalizeEmail(email);
  
  next();
};

export const validateTransaction = (req, res, next) => {
  const { amount, type, category, accountId, description } = req.body;
  
  const errors = [];
  
  // Amount validation
  if (amount === undefined || amount === null) {
    errors.push('Amount is required');
  } else if (typeof amount !== 'number' || amount <= 0) {
    errors.push('Amount must be a positive number');
  } else if (amount > 1000000000) {
    errors.push('Amount exceeds maximum allowed value');
  }
  
  // Type validation
  if (!type || !['income', 'expense'].includes(type)) {
    errors.push('Type must be either "income" or "expense"');
  }
  
  // Category validation
  if (!category || category.trim().length === 0) {
    errors.push('Category is required');
  } else if (category.length > 50) {
    errors.push('Category must be less than 50 characters');
  }
  
  // Account ID validation
  if (!accountId || accountId.trim().length === 0) {
    errors.push('Account ID is required');
  }
  
  // Date validation (optional, can be empty)
  if (req.body.date && !validator.isISO8601(req.body.date)) {
    errors.push('Invalid date format');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  
  // Sanitize inputs
  req.body.category = sanitizeString(category);
  if (description) {
    req.body.description = sanitizeString(description);
  }
  
  next();
};

export const validateAccount = (req, res, next) => {
  const { name, balance, type } = req.body;
  
  const errors = [];
  
  // Name validation
  if (!name || name.trim().length === 0) {
    errors.push('Account name is required');
  } else if (name.length > 50) {
    errors.push('Account name must be less than 50 characters');
  }
  
  // Balance validation
  if (balance === undefined || balance === null) {
    errors.push('Balance is required');
  } else if (typeof balance !== 'number') {
    errors.push('Balance must be a number');
  } else if (balance < 0) {
    errors.push('Balance cannot be negative');
  } else if (balance > 1000000000) {
    errors.push('Balance exceeds maximum allowed value');
  }
  
  // Type validation
  if (!type || type.trim().length === 0) {
    errors.push('Account type is required');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  
  // Sanitize inputs
  req.body.name = sanitizeString(name);
  req.body.type = sanitizeString(type);
  
  next();
};

// General body sanitization middleware
export const sanitizeBody = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  next();
};

// For routes that need validator package
export { validator };
