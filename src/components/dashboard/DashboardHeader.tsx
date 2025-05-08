import React from 'react';

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
}

const extractNameFromEmail = (email: string): string => {
  // Extract the part before @ and capitalize the first letter
  const namePart = email.split('@')[0];
  return namePart.charAt(0).toUpperCase() + namePart.slice(1);
};

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title, subtitle }) => {
  // If title contains "Welcome, User" pattern, we keep it as is
  // This allows for passing in already formatted titles or custom ones
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="text-muted-foreground">{subtitle}</p>
    </div>
  );
};

export default DashboardHeader;
