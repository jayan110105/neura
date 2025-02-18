"use client";

import { useState, useTransition } from "react";
import { addNote } from "~/server/actions/note";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from "~/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { Plus, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface Note {
  id: string;
  title: string;
  content: string;
  createdById: string;
  createdAt: Date;
  tags: string[];
  category: 'work' | 'personal' | 'ideas' | 'tasks';
}

interface NoteFormProps {
  userId: string;
  onNoteAdded: (note: Note) => void;
}

export default function NoteForm({ userId, onNoteAdded }: NoteFormProps) {
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    tags: [] as string[],
    category: "work",
  });
  const [tagInput, setTagInput] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      e.preventDefault();
      if (!newNote.tags.includes(tagInput.trim())) {
        setNewNote((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewNote((prev) => ({ ...prev, tags: prev.tags.filter((tag) => tag !== tagToRemove) }));
  };

  const handleAddNote = () => {
    if (!newNote.title || !newNote.content) return;

    const note = {
      id: uuidv4(),
      title: newNote.title,
      content: newNote.content,
      createdById: userId,
      createdAt: new Date(),
      tags: newNote.tags,
      category: newNote.category as "work" | "personal" | "ideas" | "tasks",
    };

    onNoteAdded(note);

    startTransition(async () => {
      await addNote(note);
      setNewNote({ title: "", content: "", tags: [], category: "work" });
    });
  };

  return (
    <Dialog>
        <DialogTrigger asChild>
          <Button className="fixed h-14 w-14 bottom-6 right-6 rounded-full shadow-lg">
            <Plus className="h-10 w-10" />
          </Button>
        </DialogTrigger>

        {/* Add Note Dialog */}
        <DialogContent className="max-w-lg p-5">
          <DialogHeader>
            <DialogTitle className="text-4xl">
              <Input
                className="sm:text-2xl md:text-2xl font-semibold shadow-none border-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
                placeholder="Title"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              />
            </DialogTitle>
          </DialogHeader>

          {/* Description Input */}
          <Textarea
            className="border-none sm:text-l md:text-l shadow-none text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none resize-none"
            placeholder="Description"
            value={newNote.content}
            rows={5}
            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
          />

          {/* Action Buttons (Date, Priority, Reminders) */}
          <div className="flex flex-col gap-3 my-3">
          {/* Tag Input Field */}
          <Input
              className="text-sm border rounded-md px-3 py-2 focus:ring-0 focus:border-gray-300"
              placeholder="Add tags and press Enter..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            {/* Display Tags as Badges */}
            <div className="flex flex-wrap gap-2">
              {newNote.tags.map((tag) => (
                <Badge key={tag} className="flex items-center gap-1 px-2 py-1 rounded-full">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="ml-1 text-xs text-white">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Bottom Section with Category & Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Select value={newNote.category} onValueChange={(val) => setNewNote({ ...newNote, category: val })}>
                <SelectTrigger className="text-muted-foreground">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="ideas">Ideas</SelectItem>
                  <SelectItem value="tasks">Tasks</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="flex gap-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>

              <DialogClose asChild>
                <Button onClick={handleAddNote} disabled={!newNote.title.trim() || isPending}>
                  {isPending ? "Saving..." : "Add Note"}
                </Button>
              </DialogClose>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
  );
}
