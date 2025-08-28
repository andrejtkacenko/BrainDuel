"use client";

import { useRouter } from "next/navigation";
import { BrainCircuit, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AuthPage() {
  const router = useRouter();

  // In a real app, you'd use react-hook-form, zod, and server actions
  // to handle form submission and validation.
  const handleAuthAction = () => {
    // Simulate a successful login/signup
    router.push("/");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="flex items-center gap-4 mb-8">
        <BrainCircuit className="h-12 w-12 text-primary" />
        <h1 className="text-5xl font-headline font-bold text-primary">BrainDuel</h1>
      </div>
      <Tabs defaultValue="sign-in" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sign-in">Sign In</TabsTrigger>
          <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="sign-in">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Welcome Back</CardTitle>
              <CardDescription>
                Sign in to challenge your friends and prove your knowledge.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-signin">Email</Label>
                <Input id="email-signin" type="email" placeholder="you@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-signin">Password</Label>
                <Input id="password-signin" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleAuthAction}>
                <LogIn className="mr-2 h-4 w-4" /> Sign In
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="sign-up">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Create an Account</CardTitle>
              <CardDescription>
                Join BrainDuel today and start your journey to become a quiz champion.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                <Label htmlFor="name-signup">Name</Label>
                <Input id="name-signup" placeholder="Your Name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-signup">Email</Label>
                <Input id="email-signup" type="email" placeholder="you@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-signup">Password</Label>
                <Input id="password-signup" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleAuthAction}>
                Create Account
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
