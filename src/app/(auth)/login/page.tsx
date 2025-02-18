"use client";

import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Sparkles } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { signIn } from "next-auth/react"

export default function LoginPage() {

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary rounded-full p-3">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">
            Sign in to access your AI assistant
          </p>
        </div>

        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full py-6"
            onClick={() => signIn("google", { callbackUrl: "/chat" })}
          >
            <FaGithub  className="mr-2 h-5 w-5" />
            Continue with GitHub
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            className="w-full py-6"
            onClick={() => signIn("google", { callbackUrl: "/chat" })}
          >
            Continue with Google
          </Button>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          By continuing, you agree to our{" "}
          <a href="#" className="underline underline-offset-4 hover:text-primary">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline underline-offset-4 hover:text-primary">
            Privacy Policy
          </a>
        </p>
      </Card>
    </div>
  );
}