"use client";

import { ScrollArea } from "~/components/ui/scroll-area";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
  Search, RefreshCcw, Archive, Reply, Flag, MoreHorizontal
} from "lucide-react";
import { format } from "date-fns";

interface Email {
  id: string;
  subject: string;
  sender: string;
  preview: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
  read: boolean;
}

const emails: Email[] = [
  {
    id: '1',
    subject: 'Project Update: Q1 Goals',
    sender: 'Sarah Johnson',
    preview: 'Here are the key points from our quarterly review...',
    timestamp: new Date().toISOString(),
    priority: 'high',
    read: false,
  },
  {
    id: '2',
    subject: 'Team Meeting Notes',
    sender: 'Mike Chen',
    preview: 'Summary of action items from today\'s meeting...',
    timestamp: new Date().toISOString(),
    priority: 'medium',
    read: true,
  },
];

export default function EmailPage() {
  return (
      <div className="flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search emails..." className="pl-8" />
            </div>
            <Button variant="outline" className="ml-4">
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">All</Button>
            <Button variant="ghost" size="sm">Unread</Button>
            <Button variant="ghost" size="sm">Flagged</Button>
            <Button variant="ghost" size="sm">Attachments</Button>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="divide-y">
            {emails.map((email) => (
              <Card
                key={email.id}
                className="p-4 rounded-none border-x-0 hover:bg-muted/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      email.priority === 'high' ? 'bg-red-500' :
                      email.priority === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`} />
                    <span className="font-medium">{email.subject}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(email.timestamp), 'MMM d, HH:mm')}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      From: {email.sender}
                    </p>
                    <p className="text-sm">{email.preview}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Archive className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Reply className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Flag className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
  );
}