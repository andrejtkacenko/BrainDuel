"use client";

import { useRouter } from "next/navigation";
import { BrainCircuit, LogIn, UserPlus } from "lucide-react";
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
import { signInAnonymously, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { doc, setDoc } from "firebase/firestore";

export default function AuthPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuthAction = async () => {
    if (!name.trim()) {
      toast({
        title: "Name is required",
        description: "Please enter your name to continue.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;
      
      await updateProfile(user, { displayName: name });
      
      // Store user info in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name,
        avatarUrl: `https://picsum.photos/seed/${user.uid}/100`,
        wins: 0,
        losses: 0,
        online: true,
      });

      router.push("/");

    } catch (error: any) {
       if (error.code === 'auth/configuration-not-found') {
        toast({
          title: "Authentication Not Configured",
          description: "Anonymous sign-in is not enabled. Please enable it in your Firebase Console: Authentication > Sign-in method > Add new provider > Anonymous.",
          variant: "destructive",
          duration: 9000,
        });
      } else {
        console.error("Authentication failed:", error);
        toast({
          title: "Authentication Failed",
          description: "Could not sign you in. Please try again.",
          variant: "destructive",
        });
      }
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <div className="flex items-center gap-4 mb-8">
        <BrainCircuit className="h-12 w-12 text-primary" />
        <h1 className="text-5xl font-headline font-bold text-primary">BrainDuel</h1>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Join the Duel</CardTitle>
          <CardDescription>
            Enter your name to start challenging players.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name-signup">Name</Label>
            <Input 
              id="name-signup" 
              placeholder="Your Name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAuthAction()}
              disabled={loading}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleAuthAction} disabled={loading}>
            {loading ? 'Joining...' : <> <UserPlus className="mr-2 h-4 w-4" /> Join Game </>}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
