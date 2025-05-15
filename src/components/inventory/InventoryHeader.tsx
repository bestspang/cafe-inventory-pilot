
import React from 'react';
import { FormattedMessage } from 'react-intl';

interface InventoryHeaderProps {
  title?: string;
  subtitle?: string;
  canModify: boolean;
  onOpenArchives: () => void;
}

const InventoryHeader: React.FC<InventoryHeaderProps> = ({ 
  title, 
  subtitle, 
  canModify, 
  onOpenArchives 
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">
          {title || <FormattedMessage id="inventory.title" defaultMessage="Global Ingredient Registry" />}
        </h1>
        <p className="text-muted-foreground">
          {subtitle || (canModify 
            ? <FormattedMessage id="inventory.subtitle.modify" defaultMessage="Add, edit, and manage your global ingredient list." />
            : <FormattedMessage id="inventory.subtitle.view" defaultMessage="View the global ingredient list." />
          )}
        </p>
      </div>
    </div>
  );
};

export default InventoryHeader;
