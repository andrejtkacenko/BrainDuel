"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from '@/components/header';
import { Trophy } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const mockFinalResults = {
  winner: 'Current User',
  player1TotalScore: 8,
  player2TotalScore: 5,
};

export default function FinalResults() {
  const router = useRouter();
  const isWinner = mockFinalResults.winner === 'Current User';

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8 flex items-center justify-center">
        <Card className="max-w-md w-full text-center animate-in fade-in zoom-in-95 duration-500">
          <CardHeader>
            <div className="flex justify-center">
              <Trophy className={`h-16 w-16 ${isWinner ? 'text-accent' : 'text-slate-400'}`} />
            </div>
            <CardTitle className="text-3xl font-headline mt-4">
              {isWinner ? 'Victory!' : 'Defeat'}
            </CardTitle>
            <CardDescription className="text-lg">
              {isWinner ? "Congratulations, you are the BrainDuel champion!" : "A valiant effort! Better luck next time."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-around items-center">
              <div className="flex flex-col items-center gap-2">
                <Avatar className="w-16 h-16">
                  <AvatarImage src="https://picsum.photos/100" alt="Current User" data-ai-hint="profile picture"/>
                  <AvatarFallback>CU</AvatarFallback>
                </Avatar>
                <p className="font-semibold">You</p>
                <p className="text-3xl font-bold text-primary">{mockFinalResults.player1TotalScore}</p>
              </div>
              <p className="text-2xl font-bold text-muted-foreground">vs</p>
              <div className="flex flex-col items-center gap-2">
                <Avatar className="w-16 h-16">
                  <AvatarImage src="https://picsum.photos/100/100?random=1" alt="Challenger" data-ai-hint="profile picture"/>
                  <AvatarFallback>C</AvatarFallback>
                </Avatar>
                <p className="font-semibold">Challenger</p>
                <p className="text-3xl font-bold text-primary">{mockFinalResults.player2TotalScore}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button size="lg" className="w-full" onClick={() => router.push('/')}>Play Again</Button>
            <Button variant="link" onClick={() => router.push('/')}>Return to Dashboard</Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
