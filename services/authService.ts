
import { User } from '../types';

declare const puter: any;

export const signInWithPuter = async (): Promise<User> => {
  try {
    const puterUser = await puter.auth.signIn();
    return {
      id: puterUser.id,
      email: puterUser.email || 'user@puter.com',
      name: puterUser.username || puterUser.email?.split('@')[0] || 'Cloud User',
      lastLogin: new Date().toISOString(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${puterUser.id}`
    };
  } catch (error) {
    console.error("Puter Auth Error:", error);
    throw new Error("Authentication failed. Please try again.");
  }
};

export const getCurrentPuterUser = async (): Promise<User | null> => {
  if (await puter.auth.isSignedIn()) {
    const puterUser = await puter.auth.getUser();
    return {
      id: puterUser.id,
      email: puterUser.email || 'user@puter.com',
      name: puterUser.username || puterUser.email?.split('@')[0] || 'Cloud User',
      lastLogin: new Date().toISOString(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${puterUser.id}`
    };
  }
  return null;
};

export const signOutPuter = async () => {
  await puter.auth.signOut();
};
