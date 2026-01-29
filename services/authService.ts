
import { User } from '../types';

/**
 * MOCK AUTH SERVICE
 * In a production environment, this would call an endpoint like /auth/send-otp and /auth/verify-otp
 */

export const sendOTP = async (email: string): Promise<string> => {
  // Simulate a delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate a random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Log it to the console for simulation purposes (user can "find" it in their email)
  console.log(`[AUTH SYSTEM] Sending OTP ${otp} to ${email}`);
  
  return otp;
};

export const verifyOTP = async (email: string, enteredOtp: string, actualOtp: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  if (enteredOtp !== actualOtp) {
    throw new Error('Invalid security key. Please check your email and try again.');
  }

  const user: User = {
    id: btoa(email),
    email,
    name: email.split('@')[0],
    lastLogin: new Date().toISOString(),
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
  };

  return user;
};
