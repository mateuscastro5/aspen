// Database utility functions for Fastify
export class DatabaseUtils {
  // Simulate database connection
  static async connect(): Promise<boolean> {
    try {
      // In a real app, this would connect to your database
      console.log('📦 Database connected successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to connect to database:', error);
      return false;
    }
  }

  // Simulate database disconnection
  static async disconnect(): Promise<void> {
    try {
      // In a real app, this would close database connections
      console.log('📦 Database disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting from database:', error);
    }
  }
}

// Validation utilities
export class ValidationUtils {
  // Validate email format
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate string length
  static isValidLength(str: string, min: number, max: number): boolean {
    return str.length >= min && str.length <= max;
  }

  // Sanitize string input
  static sanitizeString(str: string): string {
    return str.trim().replace(/[<>]/g, '');
  }
}

// Response utilities
export class ResponseUtils {
  // Standard success response
  static success(data: any, message = 'Success') {
    return {
      success: true,
      message,
      data
    };
  }

  // Standard error response
  static error(message: string, code = 'INTERNAL_ERROR') {
    return {
      success: false,
      error: {
        message,
        code
      }
    };
  }
}
