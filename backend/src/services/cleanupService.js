const User = require('../models/User');

// Clean up expired email verifications (older than 5 minutes)
const cleanupExpiredVerifications = async () => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    // Find and delete users who:
    // 1. Have expired OTP
    // 2. Are not email verified
    // 3. Have temporary username (starts with 'temp_')
    // 4. Have temporary password hash
    const result = await User.deleteMany({
      emailVerificationOTPExpires: { $lt: fiveMinutesAgo },
      isEmailVerified: false,
      username: { $regex: '^temp_' },
      passwordHash: 'temp'
    });

    if (result.deletedCount > 0) {
      console.log(`Cleaned up ${result.deletedCount} expired email verification records`);
    }
  } catch (error) {
    console.error('Error cleaning up expired verifications:', error);
  }
};

// Start the cleanup service (runs every 2 minutes)
const startCleanupService = () => {
  console.log('Starting email verification cleanup service...');
  
  // Run immediately on start
  cleanupExpiredVerifications();
  
  // Then run every 2 minutes
  setInterval(cleanupExpiredVerifications, 2 * 60 * 1000);
};

module.exports = {
  cleanupExpiredVerifications,
  startCleanupService
};
