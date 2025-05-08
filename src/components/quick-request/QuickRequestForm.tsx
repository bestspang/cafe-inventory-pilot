
import React from 'react';
import QuickRequestFormContainer from './QuickRequestFormContainer';

interface QuickRequestFormProps {
  onBranchChange: (branchId: string) => void;
}

const QuickRequestForm: React.FC<QuickRequestFormProps> = ({ onBranchChange }) => {
  return <QuickRequestFormContainer onBranchChange={onBranchChange} />;
};

export default QuickRequestForm;
