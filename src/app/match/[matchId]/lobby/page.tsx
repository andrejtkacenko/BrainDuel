"use client";

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Swords, ChevronLeft } from 'lucide-react';
import Header from '@/components/header';

const PlayerCard = ({ name, avatarUrl, isCreator }: { name: string, avatarUrl: string, isCreator?: boolean }) => (
  <Card className="flex flex-col items-center p-6 bg-card">
    <Avatar className="w-24 h-24 mb-4 border-2 border-primary">
      <AvatarImage src={avatarUrl} alt={name} data-ai-hint="profile picture" />
      <AvatarFallback>{name.charAt(0)}</AvatarFallback>
    </Avatar>
    <p className="text-xl font-semibold font-headline">{name}</p>
    {isCreator && <p className="text-sm text-primary font-medium">Creator</p>}
  </Card>
);

export default function MatchLobby() {
  const router = useRouter();
  const params = useParams();
  const matchId = params.matchId as string;
  const [rounds, setRounds] = useState('3');

  // For this example, we assume the current user is player 1 and the creator
  const isCreator = true; 

  const handleStartMatch = () => {
    // In a real app, you'd update the match state
    router.push(`/match/${matchId}/category-select`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <Button variant="ghost" onClick={() => router.push('/')} className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <Card className="max-w-4xl mx-auto shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline">Match Lobby</CardTitle>
            <CardDescription>Prepare for battle! The creator is setting up the game.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4 md:gap-8">
              <PlayerCard name="Current User" avatarUrl="https://picsum.photos/100" isCreator />
              <Swords className="h-8 w-8 md:h-12 md:w-12 text-primary/50 mx-auto" />
              <PlayerCard name="Challenger" avatarUrl="https://picsum.photos/100/100?random=1" />
            </div>

            {isCreator && (
              <div className="flex flex-col items-center space-y-4 p-6 bg-secondary rounded-lg">
                <Label htmlFor="rounds" className="text-lg font-semibold">Number of Rounds</Label>
                <Select value={rounds} onValueChange={setRounds}>
                  <SelectTrigger className="w-[180px]" id="rounds">
                    <SelectValue placeholder="Select rounds" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                      <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="flex justify-center">
              {isCreator ? (
                <Button size="lg" onClick={handleStartMatch}>Start Match</Button>
              ) : (
                <p className="text-lg text-muted-foreground animate-pulse">Waiting for creator to start the match...</p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
