// components/SearchFilters.tsx
"use client";

import { useState } from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Search, Filter, SortDesc } from "lucide-react";

export default function SearchFilters() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
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
    </>
  );
}
