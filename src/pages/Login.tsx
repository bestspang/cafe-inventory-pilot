
import React from 'react';
import LoginForm from '@/components/auth/LoginForm';

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-cafe-100 to-cafe-50 p-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-cafe-800 mb-2">Café Inventory</h1>
        <p className="text-cafe-600">Manage your cafe inventory with ease</p>
      </div>
      <LoginForm />
    </div>
  );
};

export default Login;
