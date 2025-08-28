"use client";

import { useRouter } from "next/navigation";
import { Swords, Users, Gamepad2, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { collection, query, where, addDoc, serverTimestamp, updateDoc, doc, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import type { User, Match } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";


export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [challenges, setChallenges] = useState<Match[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingChallenges, setLoadingChallenges] = useState(true);

  useEffect(() => {
    if (!user) return;

    setLoadingUsers(true);
    const usersQuery = query(
      collection(db, "users"), 
      where("uid", "!=", user.uid),
      where("online", "==", true)
    );
    const unsubscribeUsers = onSnapshot(usersQuery, (querySnapshot) => {
      const userList: User[] = [];
      querySnapshot.forEach((doc) => {
        userList.push(doc.data() as User);
      });
      setUsers(userList);
      setLoadingUsers(false);
    }, (error) => {
      console.error("Error fetching users:", error);
      toast({ title: "Error", description: "Could not fetch other players.", variant: "destructive" });
      setLoadingUsers(false);
    });

    return () => unsubscribeUsers();
  }, [user, toast]);

  useEffect(() => {
    if (!user) return;

    setLoadingChallenges(true);
    const challengesQuery = query(
      collection(db, "matches"),
      where("status", "==", "lobby"),
      where("player2Id", "==", null),
      where("creatorId", "!=", user.uid)
    );
    const unsubscribeChallenges = onSnapshot(challengesQuery, (querySnapshot) => {
      const challengeList: Match[] = [];
      querySnapshot.forEach((doc) => {
        challengeList.push({ id: doc.id, ...doc.data() } as Match);
      });
      setChallenges(challengeList);
      setLoadingChallenges(false);
    }, (error) => {
      console.error("Error fetching challenges:", error);
      toast({ title: "Error", description: "Could not fetch open games.", variant: "destructive" });
      setLoadingChallenges(false);
    });
    
    return () => unsubscribeChallenges();
  }, [user, toast]);

  const handleChallenge = async () => {
    if (!user) return;

    try {
      const q = query(collection(db, "users"), where("uid", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const myUserDoc = querySnapshot.docs[0];

      if (!myUserDoc) {
        throw new Error("Could not find your user data.");
      }

      const matchRef = await addDoc(collection(db, "matches"), {
        creatorId: user.uid,
        status: "lobby",
        createdAt: serverTimestamp(),
        numberOfRounds: 3,
        currentRound: 1,
        turn: user.uid,
        player1Id: user.uid,
        player2Id: null,
        players: {
          [user.uid]: myUserDoc.data()
        }
      });
      router.push(`/match/${matchRef.id}/lobby`);
    } catch (error) {
      console.error("Error creating match:", error);
      toast({ title: "Error", description: "Could not create a new match.", variant: "destructive" });
    }
  };

  const handleAccept = async (matchId: string) => {
     if (!user) return;
    try {
      const q = query(collection(db, "users"), where("uid", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const myUserDoc = querySnapshot.docs[0];

      if (!myUserDoc) {
        throw new Error("Could not find your user data.");
      }
      
      const matchRef = doc(db, "matches", matchId);
      await updateDoc(matchRef, {
        player2Id: user.uid,
        [`players.${user.uid}`]: myUserDoc.data()
      });
      router.push(`/match/${matchId}/lobby`);
    } catch (error) {
      console.error("Error accepting challenge:", error);
      toast({ title: "Error", description: "Could not join this game.", variant: "destructive" });
    }
  };

  return (
    <main className="flex-1 p-4 md:p-8">
      <div className="container grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle className="font-headline">Online Players</CardTitle>
                </div>
              </div>
              <CardDescription>Start a new duel with an online player.</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingUsers ? (
                 <div className="flex justify-center items-center h-48">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : users.length > 0 ? (
                <ul className="space-y-4">
                  {users.map((u) => (
                    <li key={u.uid} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary transition-colors">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={u.avatarUrl} alt={u.name} data-ai-hint="profile picture" />
                          <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{u.name}</p>
                          <p className="text-sm text-muted-foreground">
                            W: {u.wins || 0} / L: {u.losses || 0}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={handleChallenge}>
                        <Swords className="mr-2 h-4 w-4" />
                        Create Game
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                 <p className="text-sm text-muted-foreground text-center py-8">В данный момент других игроков нет в сети.</p>
              )}
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
             <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5 text-primary" />
                  <CardTitle className="font-headline">Open Games</CardTitle>
                </div>
              </div>
              <CardDescription>Join an open game and start playing.</CardDescription>
            </CardHeader>
            <CardContent>
               {loadingChallenges ? (
                 <div className="flex justify-center items-center h-48">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : challenges.length > 0 ? (
                <ul className="space-y-4">
                  {challenges.map((challenge) => (
                    <li key={challenge.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary transition-colors">
                      <div>
                        <p><span className="font-semibold">{challenge.players[challenge.creatorId].name}</span> is waiting for a challenger!</p>
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
