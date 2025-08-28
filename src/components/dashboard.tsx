"use client";

import { useRouter } from "next/navigation";
import { Swords, Users, Gamepad2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { User } from "@/lib/types";

// Mock Data
const mockUsers: User[] = [
  { id: '2', name: 'Alex', avatarUrl: 'https://picsum.photos/100/100?random=1', wins: 15, losses: 5 },
  { id: '3', name: 'Brenda', avatarUrl: 'https://picsum.photos/100/100?random=2', wins: 22, losses: 10 },
  { id: '4', name: 'Carl', avatarUrl: 'https://picsum.photos/100/100?random=3', wins: 8, losses: 12 },
  { id: '5', name: 'Diana', avatarUrl: 'https://picsum.photos/100/100?random=4', wins: 30, losses: 2 },
];

const mockChallenges = [
  { id: 'game1', challenger: { name: 'Ethan' }, status: 'pending' },
  { id: 'game2', challenger: { name: 'Fiona' }, status: 'pending' },
];

export default function Dashboard() {
  const router = useRouter();

  const handleChallenge = (userId: string) => {
    // In a real app, this would create a match record in the database
    // and navigate to the lobby.
    router.push('/match/new-match/lobby');
  };

  const handleAccept = (gameId: string) => {
    router.push(`/match/${gameId}/lobby`);
  };

  return (
    <main className="flex-1 p-4 md:p-8">
      <div className="container grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle className="font-headline">Challenge a Player</CardTitle>
              </div>
              <CardDescription>Find an opponent and start a new duel.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {mockUsers.map((user) => (
                  <li key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary transition-colors">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="profile picture" />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          W: {user.wins} / L: {user.losses}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleChallenge(user.id)}>
                      <Swords className="mr-2 h-4 w-4" />
                      Challenge
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Gamepad2 className="h-5 w-5 text-primary" />
                <CardTitle className="font-headline">Open Games</CardTitle>
              </div>
              <CardDescription>You have been challenged! Accept to begin.</CardDescription>
            </CardHeader>
            <CardContent>
              {mockChallenges.length > 0 ? (
                <ul className="space-y-4">
                  {mockChallenges.map((challenge) => (
                    <li key={challenge.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary transition-colors">
                      <div>
                        <p><span className="font-semibold">{challenge.challenger.name}</span> wants to duel!</p>
                      </div>
                      <Button size="sm" onClick={() => handleAccept(challenge.id)}>Accept</Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No open challenges right now.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
