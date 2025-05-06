
import React from 'react';
import ManageStaffForm from '@/components/staff/ManageStaffForm';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

const ManageStaff: React.FC = () => {
  const { user } = useAuth();
  
  // Only owners can access this page
  if (!user || user.role !== 'owner') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manage Staff</h1>
          <p className="text-muted-foreground">Add and remove staff members for quick requests</p>
        </div>
      </div>
      
      <div className="bg-card border rounded-lg p-6 shadow-sm">
        <ManageStaffForm />
      </div>
    </div>
  );
};

export default ManageStaff;
