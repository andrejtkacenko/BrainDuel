"use client";

import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from '@/components/header';
import { BookOpen, Film, FlaskConical, Landmark, Music, Globe } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useMatch } from '@/hooks/use-match';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

const categories = [
  { name: 'History', icon: Landmark },
  { name: 'Science', icon: FlaskConical },
  { name: 'Movies', icon: Film },
  { name: 'Music', icon: Music },
  { name: 'Geography', icon: Globe },
  { name: 'General Knowledge', icon: BookOpen },
];

const CategoryCard = ({ name, icon: Icon, onSelect, disabled }: { name: string, icon: LucideIcon, onSelect: (category: string) => void, disabled: boolean }) => (
  <Card 
    className={`text-center transition-all group ${disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:shadow-xl hover:border-primary'}`}
    onClick={() => !disabled && onSelect(name)}
    role="button"
    tabIndex={disabled ? -1 : 0}
  >
    <CardContent className="p-6 flex flex-col items-center justify-center gap-4">
      <Icon className="h-12 w-12 text-primary transition-transform group-hover:scale-110" />
      <p className="text-lg font-semibold font-headline">{name}</p>
    </CardContent>
  </Card>
);

export default function CategorySelect() {
  const router = useRouter();
  const params = useParams();
  const { matchId } = params;
  const { user } = useAuth();
  const { match, loading } = useMatch(matchId as string);

  const myTurn = user && match && match.turn === user.uid;

  const handleSelectCategory = async (category: string) => {
    if (!myTurn || !match) return;

    const currentRoundIndex = match.rounds.findIndex(r => r.number === match.currentRound);
    
    const updatedRounds = [...match.rounds];
    if (currentRoundIndex !== -1) {
      updatedRounds[currentRoundIndex].category = category;
    } else {
      // This case should ideally not happen if lobby setup is correct
      updatedRounds.push({
        number: match.currentRound,
        category: category,
        questions: [],
        player1Answers: [],
        player2Answers: [],
      });
    }

    const matchRef = doc(db, 'matches', matchId as string);
    await updateDoc(matchRef, {
      status: 'in-progress',
      rounds: updatedRounds
    });
    
    router.push(`/match/${matchId}/round/${match.currentRound}`);
  };

  if (loading || !match) {
     return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto p-4 md:p-8 flex items-center justify-center">
          <Card className="w-full max-w-3xl shadow-lg">
            <CardHeader className="text-center">
              <Skeleton className="h-8 w-64 mx-auto" />
              <Skeleton className="h-6 w-72 mx-auto mt-2" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6 flex flex-col items-center justify-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <Skeleton className="h-6 w-32" />
                    </CardContent>
                  </Card>
                ))}
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
      <main className="flex-1 container mx-auto p-4 md:p-8 flex items-center justify-center">
        <Card className="w-full max-w-3xl shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline">Round {match.currentRound}: Category Selection</CardTitle>
            <CardDescription className="text-lg">
              {myTurn ? "It's your turn to pick a category!" : `Waiting for ${match.players[match.turn]?.name || 'opponent'} to pick...`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`grid grid-cols-2 md:grid-cols-3 gap-4`}>
              {categories.map(cat => (
                <CategoryCard key={cat.name} name={cat.name} icon={cat.icon} onSelect={handleSelectCategory} disabled={!myTurn} />
              ))}
            </div>
            {!myTurn && (
              <div className="text-center mt-8 text-muted-foreground animate-pulse">
                Your opponent is choosing...
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
