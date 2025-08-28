"use client";

import { useRouter, useParams, useSearchParams, Suspense } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from '@/components/header';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type RoundResultsData = {
  roundNumber: number;
  player1Score: number;
  player2Score: number;
  questions: {
    text: string;
    player1Answer: string | null;
    player2Answer: string | null;
    correctAnswer: string;
  }[];
  isFinalRound: boolean;
};

const getAnswerIcon = (answer: string | null, correctAnswer: string) => {
    if (answer === null || answer === 'No Answer') return <MinusCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />;
    if (answer === correctAnswer) return <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />;
    return <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />;
};

function RoundResultsContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { matchId, roundNumber } = params;
  
  const resultsString = searchParams.get('results');
  const roundResults: RoundResultsData | null = resultsString ? JSON.parse(decodeURIComponent(resultsString)) : null;

  if (!roundResults) {
    return (
       <Card className="max-w-3xl mx-auto">
        <CardHeader className="text-center">
          <Skeleton className="h-9 w-64 mx-auto" />
          <Skeleton className="h-6 w-80 mx-auto mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
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

  const handleNext = () => {
    if (roundResults.isFinalRound) {
      router.push(`/match/${matchId}/results`);
    } else {
       const nextRound = Number(roundNumber) + 1;
      router.push(`/match/${matchId}/category-select?round=${nextRound}`);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto animate-in fade-in duration-500">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-headline">Round {roundResults.roundNumber} Results</CardTitle>
        <CardDescription className="text-lg">
          You scored {roundResults.player1Score}, opponent scored {roundResults.player2Score}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {roundResults.questions.map((q, index) => (
          <div key={index}>
            <p className="font-semibold">{index + 1}. {q.text}</p>
            <div className="mt-2 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                {getAnswerIcon(q.player1Answer, q.correctAnswer)}
                <p>Your answer: <span className="font-medium">{q.player1Answer || 'No Answer'}</span></p>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                {getAnswerIcon(q.player2Answer, q.correctAnswer)}
                <p>Opponent's answer: <span className="font-medium text-foreground">{q.player2Answer || 'No Answer'}</span></p>
              </div>
               <p className="text-green-600 font-medium pl-6">Correct answer: {q.correctAnswer}</p>
            </div>
            {index < roundResults.questions.length - 1 && <Separator className="my-4" />}
          </div>
        ))}
      </CardContent>
      <CardFooter className="justify-center">
        <Button size="lg" onClick={handleNext}>
          {roundResults.isFinalRound ? 'View Final Results' : 'Next Round'}
        </Button>
      </CardFooter>
    </Card>
  );
}


export default function RoundResultsPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 container mx-auto p-4 md:p-8">
              <Suspense fallback={<div>Loading...</div>}>
                <RoundResultsContent />
              </Suspense>
            </main>
        </div>
    )
}
