"use client";

import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { MessageSquare, Calendar, Mail, CheckSquare, ArrowRight, Brain } from "lucide-react";
import { useRouter } from "next/navigation";

const features = [
  {
    icon: MessageSquare,
    title: "Smart Chat Interface",
    description: "Interact naturally with your knowledge base through an AI-powered chat interface"
  },
  {
    icon: CheckSquare,
    title: "Task Management",
    description: "Organize and track your tasks with intelligent prioritization"
  },
  {
    icon: Calendar,
    title: "Calendar Integration",
    description: "Seamlessly schedule and manage your events and reminders"
  },
  {
    icon: Mail,
    title: "Email Summaries",
    description: "Get smart summaries of your important emails and communications"
  }
];

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="flex justify-center mb-8">
          <div className="bg-primary rounded-full p-4">
            <Brain className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Your Personal Knowledge Hub
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Transform the way you manage information with our AI-powered knowledge management system
        </p>
        <div className="flex gap-4 justify-center mb-16">
          <Button size="lg" onClick={() => router.push("/login")}>
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline">
            Watch Demo
          </Button>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="p-6 text-left hover:shadow-lg transition-shadow">
                <div className="bg-primary/10 rounded-lg p-3 inline-block mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
            <div>
              <div className="text-4xl font-bold mb-2 text-primary">10k+</div>
              <div className="text-muted-foreground">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2 text-primary">1M+</div>
              <div className="text-muted-foreground">Tasks Completed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2 text-primary">99%</div>
              <div className="text-muted-foreground">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}