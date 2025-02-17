// components/NotesList.tsx (Server Component)
import { getNotes } from "~/server/actions/note";
import { Card } from "~/components/ui/card";
import { format } from "date-fns";
import { Tag} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DeleteNoteButton from "./DeleteNoteButton";

const categoryColors = {
  work: "bg-blue-500",
  personal: "bg-green-500",
  ideas: "bg-purple-500",
  tasks: "bg-yellow-500",
};


export default async function NotesList({ userId, searchQuery }: { userId: string; searchQuery : string }) {
  let notes = await getNotes(userId);

  if (searchQuery) {
    const lowerQuery = searchQuery.toLowerCase();
    notes = notes.filter(
      (note) =>
        note.title.toLowerCase().includes(lowerQuery) ||
        note.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  }

  if (!notes.length) {
    return <p className="text-center text-muted-foreground">No notes found.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note) => (
        <Card key={note.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2 justify-between">
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${categoryColors[note.category]}`} />
                <h3 className="font-semibold">{note.title}</h3>
            </div>
            <div>
              <DeleteNoteButton noteId={note.id}/>
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
  );
}
