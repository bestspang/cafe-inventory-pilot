
import { useBranchActivity } from '@/hooks/branches/useBranchActivity';
import { format, formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity } from 'lucide-react';

interface ActivityLogProps {
  branchId: string;
}

export default function ActivityLog({ branchId }: ActivityLogProps) {
  const { activities, isLoading } = useBranchActivity(branchId);
  
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div 
            key={i} 
            className="h-12 bg-muted/60 animate-pulse rounded-md"
          />
        ))}
      </div>
    );
  }
  
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground flex flex-col items-center gap-2">
        <Activity className="h-8 w-8" />
        <p>No activity recorded yet</p>
      </div>
    );
  }
  
  return (
    <ScrollArea className="h-[250px] rounded-md border">
      <div className="p-4 space-y-4">
        {activities.map((activity) => {
          const actionColor = getActionColor(activity.action);
          
          return (
            <div key={activity.id} className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${actionColor}`} />
              <div className="flex-1">
                <p>
                  <span className="font-medium capitalize">{activity.action}</span>
                  {activity.user && (
                    <span className="text-muted-foreground"> by {activity.user.name || activity.user.email}</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(activity.performed_at), 'PPpp')} 
                  {' '}
                  ({formatDistanceToNow(new Date(activity.performed_at), { addSuffix: true })})
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

function getActionColor(action: string): string {
  switch (action) {
    case 'created':
      return 'bg-green-500';
    case 'updated':
      return 'bg-blue-500';
    case 'deleted':
      return 'bg-red-500';
    case 'opened':
    case 'reopened':
      return 'bg-green-500';
    case 'closed':
      return 'bg-amber-500';
    default:
      return 'bg-gray-500';
  }
}
