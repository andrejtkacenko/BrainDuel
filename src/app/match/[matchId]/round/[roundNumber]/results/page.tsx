"use client";

import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from '@/components/header';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, MinusCircle, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { useMatch } from '@/hooks/use-match';
import { db } from '@/lib/firebase';
import { doc, updateDoc, writeBatch } from 'firebase/firestore';
import { useEffect, useMemo } from 'react';

type Answer = { questionId: string; answer: string };

const getAnswerForQuestion = (answers: Answer[], questionId: string): string | null => {
  return answers.find(a => a.questionId === questionId)?.answer || null;
};

const getAnswerIcon = (answer: string | null, correctAnswer: string) => {
    if (answer === null || answer === 'No Answer') return <MinusCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />;
    if (answer === correctAnswer) return <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />;
    return <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />;
};

function RoundResultsContent() {
  const router = useRouter();
  const params = useParams();
  const { matchId, roundNumber: roundNumberStr } = params;
  const roundNumber = parseInt(roundNumberStr as string, 10);
  
  const { user } = useAuth();
  const { match, loading } = useMatch(matchId as string);
  
  const currentRound = match?.rounds.find(r => r.number === roundNumber);
  const player1Id = match?.player1Id;
  const player2Id = match?.player2Id;
  const player1 = match?.players[player1Id!];
  const player2 = match?.players[player2Id!];

  const { p1Answers, p2Answers, p1Score, p2Score, bothAnswered } = useMemo(() => {
    if (!currentRound || !currentRound.questions?.length) {
      return { p1Answers: [], p2Answers: [], p1Score: 0, p2Score: 0, bothAnswered: false };
    }
    const p1Ans = (currentRound.player1Answers || []) as Answer[];
    const p2Ans = (currentRound.player2Answers || []) as Answer[];

    let p1s = 0;
    let p2s = 0;

    currentRound.questions.forEach(q => {
      if (getAnswerForQuestion(p1Ans, q.id) === q.correctAnswer) p1s++;
      if (getAnswerForQuestion(p2Ans, q.id) === q.correctAnswer) p2s++;
    });

    const both = p1Ans.length >= currentRound.questions.length && p2Ans.length >= currentRound.questions.length;

    return { p1Answers: p1Ans, p2Answers: p2Ans, p1Score: p1s, p2Score: p2s, bothAnswered: both };
  }, [currentRound]);
  

  const isFinalRound = match && match.numberOfRounds === roundNumber;

  // Update scores once both players have finished
  useEffect(() => {
    if (bothAnswered && user && match && currentRound && user.uid === match.creatorId) {
      if (currentRound.scoresCalculated) return;

      const runScoreUpdate = async () => {
        const batch = writeBatch(db);
        const matchRef = doc(db, 'matches', matchId as string);

        const roundIndex = match.rounds.findIndex(r => r.number === roundNumber);
        
        const updates: any = {
          [`rounds.${roundIndex}.scoresCalculated`]: true,
        };

        if (isFinalRound) {
          let totalP1Score = p1Score;
          let totalP2Score = p2Score;
          match.rounds.forEach(r => {
            if (r.number !== roundNumber) {
              totalP1Score += r.player1Score || 0;
              totalP2Score += r.player2Score || 0;
            }
          });

          updates.player1FinalScore = totalP1Score;
          updates.player2FinalScore = totalP2Score;
          updates.status = 'complete';
          updates.winnerId = totalP1Score > totalP2Score ? match.player1Id : (totalP2Score > totalP1Score ? match.player2Id : null);
        }
        
        batch.update(matchRef, updates);

        // Also update player wins/losses if final round
        if (isFinalRound && updates.winnerId) {
          const winnerRef = doc(db, 'users', updates.winnerId);
          const loserId = updates.winnerId === match.player1Id ? match.player2Id : match.player1Id;
          const loserRef = doc(db, 'users', loserId!);
          
          const winnerDoc = match.players[updates.winnerId];
          const loserDoc = match.players[loserId!];

          batch.update(winnerRef, { wins: (winnerDoc.wins || 0) + 1 });
          batch.update(loserRef, { losses: (loserDoc.losses || 0) + 1 });
        }


        await batch.commit();
      };

      runScoreUpdate().catch(console.error);
    }
  }, [bothAnswered, user, match, currentRound, isFinalRound, p1Score, p2Score, roundNumber, matchId]);
  
  const handleNext = async () => {
    if (!match || !user) return;
    
    if (isFinalRound) {
      router.push(`/match/${matchId}/results`);
    } else {
      const nextRoundNumber = roundNumber + 1;
      // Only creator updates the match state for next round
      if (user.uid === match.creatorId) {
        const matchRef = doc(db, 'matches', matchId as string);
        await updateDoc(matchRef, {
          status: 'category-select',
          currentRound: nextRoundNumber,
          // Alternate turns
          turn: match.turn === player1Id ? player2Id : player1Id,
        });
      }
      // Both players navigate
      router.push(`/match/${matchId}/category-select`);
    }
  };

  if (loading || !match || !user || !currentRound || !currentRound.questions?.length) {
    return (
       <Card className="max-w-3xl mx-auto">
        <CardHeader className="text-center">
          <Skeleton className="h-9 w-64 mx-auto" />
          <Skeleton className="h-6 w-80 mx-auto mt-2" />
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <Skeleton className="h-6 w-full mb-2" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-5 w-1/3" />
              </div>
              {i < 2 && <Separator className="my-4" />}
            </div>
          ))}
        </CardContent>
        <CardFooter className="justify-center">
          <Skeleton className="h-12 w-48" />
        </CardFooter>
       </Card>
    );
  }

  const amIPlayer1 = user.uid === player1Id;
  const myName = amIPlayer1 ? player1?.name : player2?.name;
  const opponentName = amIPlayer1 ? player2?.name : player1?.name;
  const myAnswers = amIPlayer1 ? p1Answers : p2Answers;
  const opponentAnswers = amIPlayer1 ? p2Answers : p1Answers;
  const myScore = amIPlayer1 ? p1Score : p2Score;
  const opponentScore = amIPlayer1 ? p2Score : p1Score;

  return (
    <Card className="max-w-3xl mx-auto animate-in fade-in duration-500">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-headline">Round {roundNumber} Results</CardTitle>
        <CardDescription className="text-lg">
          You scored {myScore}, {opponentName} scored {opponentScore}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {currentRound.questions.map((q, index) => {
          const myAnswer = getAnswerForQuestion(myAnswers, q.id);
          const opponentAnswer = getAnswerForQuestion(opponentAnswers, q.id);

          return (
            <div key={q.id}>
              <p className="font-semibold">{index + 1}. {q.text}</p>
              <div className="mt-2 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  {getAnswerIcon(myAnswer, q.correctAnswer)}
                  <p>Your answer: <span className="font-medium">{myAnswer || 'No Answer'}</span></p>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                   {opponentAnswer === null ? <Loader2 className="h-4 w-4 animate-spin text-gray-400 flex-shrink-0" /> : getAnswerIcon(opponentAnswer, q.correctAnswer)}
                  <p>{opponentName}'s answer: <span className="font-medium text-foreground">{opponentAnswer || 'Waiting...'}</span></p>
                </div>
                 <p className="text-green-600 font-medium pl-6">Correct answer: {q.correctAnswer}</p>
              </div>
              {index < currentRound.questions.length - 1 && <Separator className="my-4" />}
            </div>
          )
        })}
      </CardContent>
      <CardFooter className="justify-center">
        {bothAnswered ? (
          <Button size="lg" onClick={handleNext}>
            {isFinalRound ? 'View Final Results' : 'Next Round'}
          </Button>
        ) : (
          <p className="text-lg text-muted-foreground animate-pulse">Waiting for opponent to finish...</p>
        )}
      </CardFooter>
    </Card>
  );
}


export default function RoundResultsPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 container mx-auto p-4 md:p-8 flex items-center justify-center">
                <RoundResultsContent />
            </main>
        </div>
    )
}
