"use client"

import { Card } from "~/components/ui/card";
import { format } from "date-fns";
import { Tag} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState } from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Search, Filter } from "lucide-react";
import { ScrollArea } from "~/components/ui/scroll-area";
import { deleteNote } from "~/server/actions/note";
import { Trash2 } from "lucide-react";
import NoteForm from "~/components/notes/NoteForm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"

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
  work: "bg-blue-500",
  personal: "bg-green-500",
  ideas: "bg-purple-500",
  tasks: "bg-yellow-500",
};


export default function NotesList({ userId, initialNotes }: { userId: string; initialNotes: Note[] }) {

  const [notes, setNotes] = useState(initialNotes);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const categories = ['work', 'personal', 'ideas', 'tasks'];

  const handleNoteAdded = (newNote: Note) => {
    setNotes((prev) => [newNote, ...prev]); // Add the new note instantly to the list
  }

  const handleDelete = async (noteId: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== noteId));
    await deleteNote(noteId);
  };

  const filteredNotes = notes.filter(
    (note) => {
      const matchTitle = note.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchTags = note.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchCategory = selectedCategories.length === 0 || selectedCategories.some((category) => note.category == category)

      return (matchTitle || matchTags) && matchCategory ;
    }  
  );

  return (
    <>
      <div className="p-4 border-b">
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    <div className="hidden sm:flex">
                      Filters
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {categories.map((category) => (
                    <DropdownMenuCheckboxItem
                      key={category}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={(checked) => {
                        setSelectedCategories(checked ? [...selectedCategories, category] : selectedCategories.filter((t) => t !== category))
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${categoryColors[category as keyof typeof categoryColors]}`} />
                        {category}
                      </div>
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
          </div>
      </div>
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
                  <Button variant="ghost" onClick={() => handleDelete(note.id)}>
                      <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <ReactMarkdown className="text-sm text-muted-foreground mb-4" remarkPlugins={[remarkGfm]}>{note.content}</ReactMarkdown>
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
      <NoteForm userId={userId} onNoteAdded={handleNoteAdded}/>
    </>
  );
}
