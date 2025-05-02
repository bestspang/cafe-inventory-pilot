
import React from 'react';
import { CalendarClock } from 'lucide-react';

interface ComingSoonProps {
  title?: string;
  description?: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ 
  title = "Coming Soon", 
  description = "This feature is currently under development and will be available soon." 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 h-[60vh] animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-cafe-100 flex items-center justify-center text-cafe-500 mb-4">
        <CalendarClock className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-muted-foreground text-center max-w-md">{description}</p>
    </div>
  );
};

export default ComingSoon;
