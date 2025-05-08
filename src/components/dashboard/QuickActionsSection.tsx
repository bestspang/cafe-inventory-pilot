
import React from 'react';
import QuickActions from '@/components/dashboard/QuickActions';
import { FormattedMessage } from 'react-intl';

interface QuickActionsSectionProps {
  isLoading: boolean;
}

const QuickActionsSection: React.FC<QuickActionsSectionProps> = ({ isLoading }) => {
  return (
    <div className="pt-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          <FormattedMessage id="dashboard.quick.actions" defaultMessage="Quick Actions" />
        </h2>
      </div>
      <QuickActions isLoading={isLoading} />
    </div>
  );
};

export default QuickActionsSection;
