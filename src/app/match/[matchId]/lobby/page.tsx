"use client";

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Swords, ChevronLeft, User, Users } from 'lucide-react';
import Header from '@/components/header';
import { useAuth } from '@/hooks/use-auth';
import { useMatch } from '@/hooks/use-match';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

const PlayerCard = ({ name, avatarUrl, isCreator, isYou }: { name?: string, avatarUrl?: string, isCreator?: boolean, isYou?: boolean }) => (
  <Card className="flex flex-col items-center p-6 bg-card">
    <Avatar className="w-24 h-24 mb-4 border-2 border-primary">
      <AvatarImage src={avatarUrl} alt={name} data-ai-hint="profile picture" />
      <AvatarFallback>{name ? name.charAt(0) : <User />}</AvatarFallback>
    </Avatar>
    <p className="text-xl font-semibold font-headline">{name || 'Waiting...'}</p>
    {isCreator && <p className="text-sm text-primary font-medium">Creator</p>}
    {isYou && <p className="text-xs text-muted-foreground">(You)</p>}
  </Card>
);


export default function MatchLobby() {
  const router = useRouter();
  const params = useParams();
  const matchId = params.matchId as string;
  const { user } = useAuth();
  const { match, loading } = useMatch(matchId);

  const isCreator = user && match && match.creatorId === user.uid;
  const canStart = match && Object.keys(match.players).length === 2;
  const player1 = match ? match.players[match.player1Id!] : null;
  const player2 = match ? match.players[match.player2Id!] : null;

  useEffect(() => {
    if (match && match.status !== 'lobby') {
      router.push(`/match/${matchId}/category-select`);
    }
  }, [match, matchId, router]);


  const handleStartMatch = async () => {
    if (!isCreator || !canStart || !match) return;

    const rounds = Array.from({ length: match.numberOfRounds }, (_, i) => ({
      number: i + 1,
      category: '',
      questions: [],
      player1Answers: [],
      player2Answers: [],
    }));

    const matchRef = doc(db, 'matches', matchId);
    await updateDoc(matchRef, {
      status: 'category-select',
      rounds: rounds,
    });
  };

  const handleRoundsChange = async (value: string) => {
    if (!isCreator || !match) return;
    const matchRef = doc(db, 'matches', matchId);
    await updateDoc(matchRef, { numberOfRounds: parseInt(value, 10) });
  };


  if (loading || !match || !user) {
    return (
       <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto p-4 md:p-8">
           <Skeleton className="h-9 w-48 mb-4" />
           <Card className="max-w-4xl mx-auto shadow-lg">
            <CardHeader className="text-center">
              <Skeleton className="h-8 w-48 mx-auto" />
              <Skeleton className="h-5 w-80 mx-auto mt-2" />
            </CardHeader>
            <CardContent className="space-y-8 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4 md:gap-8">
                <Skeleton className="h-48 w-full" />
                <Swords className="h-8 w-8 md:h-12 md:w-12 text-primary/20 mx-auto" />
                <Skeleton className="h-48 w-full" />
              </div>
              <Skeleton className="h-24 w-full" />
              <div className="flex justify-center">
                 <Skeleton className="h-12 w-32" />
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

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
            <CardDescription>
              {canStart ? "The game is ready!" : "Waiting for a challenger to join..."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4 md:gap-8">
              <PlayerCard 
                name={player1?.name} 
                avatarUrl={player1?.avatarUrl} 
                isCreator={match.creatorId === match.player1Id}
                isYou={user.uid === match.player1Id}
              />
              <Swords className="h-8 w-8 md:h-12 md:w-12 text-primary/50 mx-auto" />
              {player2 ? (
                <PlayerCard 
                  name={player2.name} 
                  avatarUrl={player2.avatarUrl} 
                  isCreator={match.creatorId === match.player2Id} 
                  isYou={user.uid === match.player2Id}
                />
              ) : (
                <Card className="flex flex-col items-center justify-center p-6 bg-card border-dashed h-full">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Waiting for player...</p>
                </Card>
              )}
            </div>

            {isCreator && (
              <div className="flex flex-col items-center space-y-4 p-6 bg-secondary rounded-lg">
                <Label htmlFor="rounds" className="text-lg font-semibold">Number of Rounds</Label>
                <Select 
                  value={String(match.numberOfRounds)} 
                  onValueChange={handleRoundsChange}
                  disabled={!isCreator || !!player2} // Disable if not creator or if player 2 has joined
                >
                  <SelectTrigger className="w-[180px]" id="rounds">
                    <SelectValue placeholder="Select rounds" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                      <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                 {!!player2 && <p className="text-xs text-muted-foreground">Rounds cannot be changed after a player has joined.</p>}
              </div>
            )}
            
            <div className="flex justify-center">
              {isCreator ? (
                <Button size="lg" onClick={handleStartMatch} disabled={!canStart}>
                  {canStart ? 'Start Match' : 'Waiting for Player...'}
                </Button>
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
