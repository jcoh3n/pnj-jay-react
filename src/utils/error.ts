export const getFirebaseErrorMessage = (error: any): string => {
  const code = error?.code || '';
  
  switch (code) {
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/user-disabled':
      return 'User account has been disabled';
    case 'auth/user-not-found':
      return 'User not found';
    case 'auth/wrong-password':
      return 'Invalid password';
    case 'auth/email-already-in-use':
      return 'Email already in use';
    case 'auth/weak-password':
      return 'Password is too weak';
    default:
      return error?.message || 'An unknown error occurred';
  }
};
