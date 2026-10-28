import React from 'react';
import { AuthLayout, SlidingAuthContainer } from '../../features/auth';

interface LoginPageProps {
  isSignUp: boolean;
  onToggleMode: (isSignUp: boolean) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ 
  isSignUp, 
  onToggleMode 
}) => {
  return (
    <AuthLayout>
      <SlidingAuthContainer 
        isSignUp={isSignUp} 
        onToggleMode={onToggleMode} 
      />
    </AuthLayout>
  );
};

export default LoginPage;