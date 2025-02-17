import { ScrollArea } from "~/components/ui/scroll-area";
import NotesList from "~/components/notes/NotesList";
import NoteForm from "~/components/notes/NoteForm";
import SearchFilters from "~/components/notes/SearchFilters";
import { auth } from "~/server/auth";


export default async function NotesPage() {
  const session = await auth();
  const userId = session?.user.id ?? "";

  return (
    <div className="h-full flex flex-col">
      {/* Search and Filters */}
      <SearchFilters/>

      {/* Notes Grid */}
      <ScrollArea className="flex-1 p-4">
          <NotesList userId={userId} searchQuery=""/>
      </ScrollArea>

      {/* Add Note Dialog */}
      <NoteForm userId={userId}/>
    </div>
  );
}