"use client";

import { deleteNote } from "~/server/actions/note";
import { Button } from "~/components/ui/button";
import { Trash2 } from "lucide-react";

export default function DeleteNoteButton({ noteId }: { noteId: string }) {
  return (
    <Button variant="ghost" onClick={() => deleteNote(noteId)}>
        <Trash2 className="h-4 w-4" />
    </Button>
  );
}
