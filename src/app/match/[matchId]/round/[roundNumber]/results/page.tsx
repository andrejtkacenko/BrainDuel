"use client";

import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from '@/components/header';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, MinusCircle } from 'lucide-react';

const mockRoundResults = {
  roundNumber: 1,
  player1Score: 2,
  player2Score: 1,
  questions: [
    { text: 'What is the capital of France?', player1Answer: 'Paris', player2Answer: 'Paris', correctAnswer: 'Paris' },
    { text: 'Which planet is known as the Red Planet?', player1Answer: 'Mars', player2Answer: 'Jupiter', correctAnswer: 'Mars' },
    { text: 'Who wrote "To Kill a Mockingbird"?', player1Answer: null, player2Answer: 'Harper Lee', correctAnswer: 'Harper Lee' },
  ],
  isFinalRound: false,
};

export default function RoundResults() {
  const router = useRouter();
  const params = useParams();
  const { matchId, roundNumber } = params;

  const handleNext = () => {
    if (mockRoundResults.isFinalRound) {
      router.push(`/match/${matchId}/results`);
    } else {
      router.push(`/match/${matchId}/category-select`);
    }
  };

  const getAnswerIcon = (answer: string | null, correctAnswer: string) => {
    if (answer === null) return <MinusCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />;
    if (answer === correctAnswer) return <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />;
    return <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <Card className="max-w-3xl mx-auto animate-in fade-in duration-500">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline">Round {mockRoundResults.roundNumber} Results</CardTitle>
            <CardDescription className="text-lg">
              You scored {mockRoundResults.player1Score}, opponent scored {mockRoundResults.player2Score}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {mockRoundResults.questions.map((q, index) => (
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
                {index < mockRoundResults.questions.length - 1 && <Separator className="my-4" />}
              </div>
            ))}
          </CardContent>
          <CardFooter className="justify-center">
            <Button size="lg" onClick={handleNext}>
              {mockRoundResults.isFinalRound ? 'View Final Results' : 'Next Round'}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
