"use client";

import { useState, useEffect, useTransition } from "react";
import { getNotes, addNote, deleteNote } from "~/server/actions/note"
import { ScrollArea } from "~/components/ui/scroll-area";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from "~/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { Search, Plus, Filter, SortDesc, Tag, X, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { useSession } from "next-auth/react"
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Note {
  id: string;
  title: string;
  content: string;
  createdById: string;
  createdAt: Date;
  tags: string[];
  category: 'work' | 'personal' | 'ideas' | 'tasks';
}

const categoryColors = {
  work: 'bg-blue-500',
  personal: 'bg-green-500',
  ideas: 'bg-purple-500',
  tasks: 'bg-yellow-500',
};

export default function NotesPage() {
  const { data: session } = useSession()
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newNote, setNewNote] = useState<{ 
    title: string; 
    content: string; 
    tags: string[];
    category: string; 
  }>({
    title: "",
    content: "",
    tags: [], 
    category: "work",
  });
  const [tagInput, setTagInput] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function fetchNotes() {
      const notesFromDb = await getNotes(session?.user.id ?? "");
      setNotes(notesFromDb);
    }
    fetchNotes().catch((error) => {
      console.error("Failed to fetch notes:", error);
    });

  }, [session?.user.id]);

  const handleDeleteNote = async (noteId: string) => {
    startTransition(async () => {
      await deleteNote(noteId);
      const updatedNotes = await getNotes(session?.user.id ?? "");
      setNotes(updatedNotes);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      e.preventDefault();
      if (!newNote.tags.includes(tagInput.trim())) {
        setNewNote((prevNote) => ({
          ...prevNote,
          tags: [...prevNote.tags, tagInput.trim()], // Update tags inside newNote
        }));
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewNote((prevNote) => ({
      ...prevNote,
      tags: prevNote.tags.filter((tag) => tag !== tagToRemove), // Remove the selected tag
    }));
  };

  const filteredNotes = notes
    .filter((note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleAddNote = () => {
    if (!newNote.title || !newNote.content) return;

    const note: Note = {
      id: uuidv4(),
      title: newNote.title,
      content: newNote.content,
      createdById: session?.user.id ?? "", // Replace with actual user ID
      createdAt: new Date(),
      tags: newNote.tags,
      category: newNote.category as Note["category"],
    };

    startTransition(async () => {
      await addNote(note);
      setNewNote({ title: "", content: "", tags: [], category: "work" });
      const updatedNotes = await getNotes(session?.user.id ?? "");
      setNotes(updatedNotes);
    });
    // setDialogOpen(false);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search and Filters */}
      <div className="p-4 border-b bg-card">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search notes..." 
              className="pl-8" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
      </div>

      {/* Notes Grid */}
      <ScrollArea className="flex-1 p-4">
      {filteredNotes.length === 0 ? (
          <p className="text-center text-muted-foreground">No notes found.</p>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <Card key={note.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2 justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${categoryColors[note.category]}`} />
                  <h3 className="font-semibold">{note.title}</h3>
                </div>
                <div>
                  <Button variant="ghost" onClick={() => handleDeleteNote(note.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <ReactMarkdown className="text-sm text-muted-foreground mb-4" remarkPlugins={[remarkGfm]}>{note.content}</ReactMarkdown>
              {/* <p className="text-sm text-muted-foreground mb-4">{note.content}</p> */}
              <div className="flex flex-wrap gap-2 mb-3">
                {note.tags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center bg-secondary px-2 py-1 rounded-full text-xs"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </div>
                ))}
              </div>
              <div className="text-xs text-muted-foreground">
                {format(new Date(note.createdAt), 'MMM d, yyyy HH:mm')}
              </div>
            </Card>
          ))}
        </div>
        )}
      </ScrollArea>

      {/* Add Note Dialog */}
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
    </div>
  );
}