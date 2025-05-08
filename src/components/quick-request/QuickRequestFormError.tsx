
import React from 'react';

interface QuickRequestFormErrorProps {
  message: string;
}

const QuickRequestFormError: React.FC<QuickRequestFormErrorProps> = ({ message }) => {
  return (
    <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4">
      {message}
    </div>
  );
};

export default QuickRequestFormError;
