"use client";

import { ScrollArea } from "~/components/ui/scroll-area";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger} from "~/components/ui/popover"
import { Calendar } from "~/components/ui/calendar"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "~/components/ui/select";
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from "~/components/ui/dialog";
import { Search, Plus, Filter, SortDesc, CalendarIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "~/lib/utils";
import { format } from "date-fns";

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
}

const priorityColors = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Complete project documentation',
      description: 'Write technical specifications and user guides',
      completed: false,
      dueDate: new Date().toISOString(),
      priority: 'high',
    },
    {
      id: '2',
      title: 'Review pull requests',
      description: 'Review and merge team pull requests',
      completed: true,
      dueDate: new Date().toISOString(),
      priority: 'medium',
    },
  ]);

  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    completed: false,
    dueDate: "",
    priority: "medium",
  });

  const addTask = () => {
    if (!newTask.title) return;
    setTasks([...tasks, { ...newTask, id: Date.now().toString(), completed: false } as Task]);
    setNewTask({
      title: "",
      description: "",
      completed: false,
      dueDate: "",
      priority: "medium",
    });
  };


  return (
    <div className="h-full flex flex-col">
      {/* Search and Filters */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search tasks..." className="pl-8" />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline">
            <SortDesc className="h-4 w-4 mr-2" />
            Sort
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">All</Button>
          <Button variant="ghost" size="sm">Active</Button>
          <Button variant="ghost" size="sm">Completed</Button>
          <Button variant="ghost" size="sm">High Priority</Button>
        </div>
      </div>

      {/* Tasks List */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          {tasks.map((task) => (
            <Card key={task.id} className="p-4">
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => {
                    setTasks(tasks.map(t =>
                      t.id === task.id ? { ...t, completed: !t.completed } : t
                    ));
                  }}
                  className="mt-1.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${priorityColors[task.priority]}`} />
                    <h3 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </h3>
                  </div>
                  <p className={`text-sm mb-2 ${task.completed ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>
                    {task.description}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      {format(new Date(task.dueDate), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Add Task Modal */}
      <Dialog>
        <DialogTrigger asChild>
          <Button size="lg" className="fixed bottom-6 right-6 rounded-full shadow-lg">
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg p-6 bg-white rounded-lg shadow-lg">
          <DialogTitle className="text-lg font-semibold">
            <Input
                className="sm:text-2xl md:text-2xl font-semibold shadow-none border-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
                placeholder="Title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
          </DialogTitle>

          <Textarea
            className="border-none sm:text-l md:text-l shadow-none text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none resize-none"
            placeholder="Description"
            value={newTask.description}
            rows={2}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          />

          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[130px] justify-start text-left font-normal",
                    !newTask.dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon />
                  {newTask.dueDate ? format(new Date(newTask.dueDate), "MMM d") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={newTask.dueDate ? new Date(newTask.dueDate) : undefined} onSelect={(date) => setNewTask({ ...newTask, dueDate: date?.toISOString() })} initialFocus />
              </PopoverContent>
            </Popover>
            <Select value={newTask.priority} onValueChange={(val) => setNewTask({ ...newTask, priority: val as Task['priority'] })}>
              <SelectTrigger className="text-muted-foreground w-[100px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-end">
            <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">
                Cancel
              </Button>
            </DialogClose>

            <DialogClose asChild>
              <Button onClick={addTask}>Add Task</Button>
            </DialogClose>
          </DialogFooter>
          </div>          
        </DialogContent>
      </Dialog>
    </div>
  );
}