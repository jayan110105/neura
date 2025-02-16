"use client";

import { Calendar } from "~/components/ui/calendar";
import { Card } from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Button } from "~/components/ui/button";
import { Plus, Edit2, Trash2, Share2, Filter } from "lucide-react";
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

  return (
    <div className="h-full grid grid-cols-[300px_1fr] divide-x">
      <div className="p-4 space-y-4">
        <Calendar
          mode="single"
          className="rounded-md border"
        />
        <div className="space-y-2">
          <h3 className="font-medium text-sm">Event Types</h3>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start">
              <div className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
              Meetings
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
              Tasks
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2" />
              Reminders
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">Events</h2>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </Button>
        </div>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {events.map((event) => (
              <Card key={event.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${priorityColors[event.priority]}`} />
                    <h3 className="font-semibold">{event.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {event.description}
                </p>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(event.date), 'MMM d, yyyy HH:mm')}
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}