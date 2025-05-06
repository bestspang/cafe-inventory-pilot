
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import ActivityLog from './ActivityLog';
import StaffManager from './StaffManager';

interface BranchDetailPanelProps {
  branchId: string;
}

export default function BranchDetailPanel({ branchId }: BranchDetailPanelProps) {
  const [activeTab, setActiveTab] = useState('staff');
  
  return (
    <div className="p-4 pb-6">
      <Tabs defaultValue="staff" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>
        
        <TabsContent value="staff" className="mt-4">
          <StaffManager branchId={branchId} />
        </TabsContent>
        
        <TabsContent value="activity" className="mt-4">
          <ActivityLog branchId={branchId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
