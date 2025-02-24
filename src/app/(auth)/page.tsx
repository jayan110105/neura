"use client";

import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Search, AlarmClock, CheckSquare, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

const features = [
  {
    icon: Search,
    title: "Context-Aware Chat",
    description: "Ask Neura anything and get responses tailored to your notes, emails, and tasks—no need to switch apps."
  },
  {
    icon: CheckSquare,
    title: "Automated Notes",
    description: "Neura extracts key insights from your emails, chats, and documents, turning them into structured notes."
  },
  {
    icon: CheckSquare,
    title: "Task Automation",
    description: "Assign and track tasks with AI-powered prioritization, so nothing falls through the cracks."
  },
  {
    icon: AlarmClock,
    title: "Smart Reminders",
    description: "Neura intelligently schedules reminders based on your conversations and deadlines."
  }
];

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen ">

      {/* Hero Section */}
      <div className="ml-4 sm:ml-20 sm:mt-16 px-4 py-16">
        <div className="flex mb-8">
          <div className="bg-primary rounded-full p-4">
            <Sparkles className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-5xl md:text-8xl font-bold mb-6">
          Neura AI
        </h1>
        <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Your AI workspace. <br/>Simplified.
        </h2>
        <p className="text-xl text-muted-foreground mb-12 max-w-2xl">
            Neura empowers you to capture, organize, and retrieve information effortlessly. 
            Stay in control of your notes, tasks, emails, and calendar—all in one place. Automate the mundane,
            focus on what matters, and work smarter than ever before.
        </p>
        <div className="flex gap-4 mb-28">
          <Button className="rounded-full py-6" size="lg" onClick={() => router.push("/login")}>
            Try now
          </Button>
        </div>
            
      </div>
      {/* Feature Cards */}
      <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto pb-10 px-10 justify-center">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="p-6 text-left hover:shadow-lg transition-shadow">
                  <div className="flex flex-1 p-3 gap-4 mb-4 ">
                    <Icon className="h-6 w-6 text-primary" />
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  </div>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              );
            })}
          </div>
      </div>
    </div>
  );
}