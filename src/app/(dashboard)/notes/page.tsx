import NotesList from "~/components/notes/NotesList";
import { auth } from "~/server/auth";
import { getNotes } from "~/server/actions/note";


export default async function NotesPage() {
  const session = await auth();
  const userId = session?.user.id ?? "";
  const notes = await getNotes(userId);

  return (
    <div className="h-full flex flex-col">
      <NotesList userId={userId} initialNotes={notes}/>
    </div>
  );
}
