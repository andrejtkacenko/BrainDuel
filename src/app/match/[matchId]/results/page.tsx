"use client";

import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from '@/components/header';
import { Trophy, Shield } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { useMatch } from '@/hooks/use-match';
import { Skeleton } from '@/components/ui/skeleton';

export default function FinalResults() {
  const router = useRouter();
  const params = useParams();
  const { matchId } = params;
  const { user } = useAuth();
  const { match, loading } = useMatch(matchId as string);

  if (loading || !match || !user) {
    return (
       <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto p-4 md:p-8 flex items-center justify-center">
          <Card className="max-w-md w-full text-center">
            <CardHeader>
              <Skeleton className="h-16 w-16 rounded-full mx-auto" />
              <Skeleton className="h-8 w-32 mx-auto mt-4" />
              <Skeleton className="h-6 w-64 mx-auto mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-around items-center">
                <div className="flex flex-col items-center gap-2">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-8 w-8" />
                </div>
                <p className="text-2xl font-bold text-muted-foreground">vs</p>
                <div className="flex flex-col items-center gap-2">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-10 w-48" />
            </CardFooter>
          </Card>
        </main>
      </div>
    );
  }

  const { winnerId, player1Id, player2Id, players, player1FinalScore, player2FinalScore } = match;

  const isWinner = winnerId === user.uid;
  const isTie = winnerId === null;
  
  const player1 = players[player1Id!];
  const player2 = players[player2Id!];
  
  const myPlayer = user.uid === player1Id ? player1 : player2;
  const opponentPlayer = user.uid === player1Id ? player2 : player1;

  const myScore = user.uid === player1Id ? player1FinalScore : player2FinalScore;
  const opponentScore = user.uid === player1Id ? player2FinalScore : player1FinalScore;

  let title, description, Icon;
  if(isTie) {
    title = "It's a Tie!";
    description = "An epic battle of wits ends in a draw!";
    Icon = <Shield className="h-16 w-16 text-blue-500" />;
  } else if (isWinner) {
    title = 'Victory!';
    description = "Congratulations, you are the BrainDuel champion!";
    Icon = <Trophy className="h-16 w-16 text-accent" />;
  } else {
    title = 'Defeat';
    description = "A valiant effort! Better luck next time.";
    Icon = <Trophy className="h-16 w-16 text-slate-400" />;
  }


  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8 flex items-center justify-center">
        <Card className="max-w-md w-full text-center animate-in fade-in zoom-in-95 duration-500">
          <CardHeader>
            <div className="flex justify-center">
              {Icon}
            </div>
            <CardTitle className="text-3xl font-headline mt-4">
              {title}
            </CardTitle>
            <CardDescription className="text-lg">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-around items-center">
              <div className="flex flex-col items-center gap-2">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={myPlayer?.avatarUrl} alt={myPlayer?.name} data-ai-hint="profile picture"/>
                  <AvatarFallback>{myPlayer?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <p className="font-semibold">You</p>
                <p className="text-3xl font-bold text-primary">{myScore}</p>
              </div>
              <p className="text-2xl font-bold text-muted-foreground">vs</p>
              <div className="flex flex-col items-center gap-2">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={opponentPlayer?.avatarUrl} alt={opponentPlayer?.name} data-ai-hint="profile picture"/>
                  <AvatarFallback>{opponentPlayer?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <p className="font-semibold">{opponentPlayer?.name}</p>
                <p className="text-3xl font-bold text-primary">{opponentScore}</p>
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
