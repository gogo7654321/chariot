'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// A serializable user object to safely pass to server actions.
export type SerializableUser = {
  uid: string;
  email: string | null;
} | null;

export type UserAction =
  | 'login'
  | 'login_google'
  | 'signup'
  | 'logout'
  | 'add_course'
  | 'remove_course';

export async function logUserAction(
  user: SerializableUser,
  action: UserAction,
  details: Record<string, any> = {}
) {
  if (!user) return;

  try {
    await addDoc(collection(db, 'user_logs'), {
      userId: user.uid,
      userEmail: user.email,
      action,
      details,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error logging user action:', error);
    // In a real app, you might want more robust error handling,
    // like sending to an external monitoring service.
  }
}
