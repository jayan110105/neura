"use client";

import { Calendar } from "~/components/ui/calendar";
import { Card } from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Button } from "~/components/ui/button";
import { Plus, Edit2, Trash2, Share2, Filter, ChevronDown} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  priority: 'high' | 'medium' | 'low';
  type: 'meeting' | 'task' | 'reminder';
}

const priorityColors = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
};

export default function CalendarPage() {
  const [events] = useState<Event[]>([
    {
      id: '1',
      title: 'Team Meeting',
      description: 'Weekly sync with the development team',
      date: new Date().toISOString(),
      priority: 'high',
      type: 'meeting',
    },
    {
      id: '2',
      title: 'Project Deadline',
      description: 'Submit final project documentation',
      date: new Date().toISOString(),
      priority: 'medium',
      type: 'task',
    },
  ]);

  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <div className="h-full flex flex-col lg:grid lg:grid-cols-[300px_1fr] divide-y lg:divide-y-0 lg:divide-x">
      {/* Mobile Calendar Toggle */}
      <div className="lg:hidden p-4 flex justify-between items-center border-b">
        <Button 
          variant="outline" 
          onClick={() => setShowSidebar(!showSidebar)}
          className="w-full flex justify-between items-center"
        >
          <span>Calendar View</span>
          <ChevronDown className={`h-4 w-4 transform transition-transform ${showSidebar ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Calendar Sidebar */}
      <div className={`${showSidebar ? 'block' : 'hidden'} lg:block`}>
        <div className="p-4 space-y-4">
          <Calendar
            mode="single"
            className="rounded-md border"
          />
        </div>
      </div>

      {/* Events List */}
      <div className="flex flex-col flex-1">
        <div className="p-4 border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">Events</h2>
            <Button variant="outline" className="hidden sm:flex">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="sm:hidden flex-1">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" className="flex-1 sm:flex-none">
              <Plus className="h-4 w-4 mr-2" />
              New Event
            </Button>
          </div>
        </div>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {events.map((event) => (
              <Card key={event.id} className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${priorityColors[event.priority]}`} />
                      <h3 className="font-semibold">{event.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {event.description}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(event.date), 'MMM d, yyyy HH:mm')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button variant="ghost" size="icon">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}