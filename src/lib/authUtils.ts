
import type { User } from 'firebase/auth';

const allowedEmails = [
  'epikmathdev@gmail.com',
  'npatel012010@gmail.com',
  'artval4games@gmail.com',
];

export function isDev(user: User | null): boolean {
  if (!user || !user.email) {
    return false;
  }
  return allowedEmails.includes(user.email);
}
