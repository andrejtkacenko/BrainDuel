"use client";

import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from '@/components/header';
import { BookOpen, Film, FlaskConical, Landmark, Music, Globe } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const categories = [
  { name: 'History', icon: Landmark },
  { name: 'Science', icon: FlaskConical },
  { name: 'Movies', icon: Film },
  { name: 'Music', icon: Music },
  { name: 'Geography', icon: Globe },
  { name: 'General Knowledge', icon: BookOpen },
];

const CategoryCard = ({ name, icon: Icon, onSelect }: { name: string, icon: LucideIcon, onSelect: (category: string) => void }) => (
  <Card 
    className="text-center hover:shadow-xl hover:border-primary transition-all cursor-pointer group"
    onClick={() => onSelect(name)}
    role="button"
    tabIndex={0}
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

  // Assume it's player 1's turn
  const myTurn = true; 
  const currentRound = 1;

  const handleSelectCategory = (category: string) => {
    if (!myTurn) return;
    router.push(`/match/${matchId}/round/${currentRound}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8 flex items-center justify-center">
        <Card className="w-full max-w-3xl shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline">Round {currentRound}: Category Selection</CardTitle>
            <CardDescription className="text-lg">
              {myTurn ? "It's your turn to pick a category!" : "Waiting for opponent to pick a category..."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 ${!myTurn ? 'opacity-50 pointer-events-none' : ''}`}>
              {categories.map(cat => (
                <CategoryCard key={cat.name} name={cat.name} icon={cat.icon} onSelect={handleSelectCategory} />
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
