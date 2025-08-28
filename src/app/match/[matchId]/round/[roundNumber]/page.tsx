"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Header from '@/components/header';
import { cn } from '@/lib/utils';
import type { Question as QuestionType, Match } from '@/lib/types';
import { generateQuestions } from '@/ai/flows/question-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { useMatch } from '@/hooks/use-match';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const TIMER_DURATION = 15;

const LoadingScreen = () => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-1 container mx-auto p-4 md:p-8 flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    </main>
  </div>
);

export default function QuizRound() {
  const router = useRouter();
  const params = useParams();
  const { matchId, roundNumber: roundNumberStr } = params;
  const roundNumber = parseInt(roundNumberStr as string, 10);

  const { user } = useAuth();
  const { match, loading: matchLoading } = useMatch(matchId as string);

  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  const currentRound = match?.rounds.find(r => r.number === roundNumber);

  useEffect(() => {
    if (!match || !user) return;
    
    // Redirect if round is already completed by this user
    const myPlayerKey = match.player1Id === user.uid ? 'player1Answers' : 'player2Answers';
    if(currentRound && currentRound[myPlayerKey] && currentRound[myPlayerKey].length >= currentRound.questions.length) {
      router.push(`/match/${matchId}/round/${roundNumber}/results`);
      return;
    }
    
    // Creator generates questions
    if (match.creatorId === user.uid && currentRound && currentRound.questions.length === 0) {
      const fetchQuestions = async () => {
        try {
          const response = await generateQuestions({ category: currentRound.category, count: 3 });
          if (response && response.questions) {
            setQuestions(response.questions);
            setLoadingQuestions(false);
            const matchRef = doc(db, 'matches', matchId as string);
            const roundIndex = match.rounds.findIndex(r => r.number === roundNumber);
            const updatedRounds = [...match.rounds];
            updatedRounds[roundIndex].questions = response.questions;
            await updateDoc(matchRef, { rounds: updatedRounds });
          }
        } catch (error) {
          console.error("Failed to generate questions:", error);
        }
      };
      fetchQuestions();
    } else if (currentRound && currentRound.questions.length > 0) {
      setQuestions(currentRound.questions);
      setLoadingQuestions(false);
    }
  }, [match, user, roundNumber, matchId, router, currentRound]);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setIsAnswered(false);
      setSelectedAnswer(null);
      setTimeLeft(TIMER_DURATION);
    } else {
      router.push(`/match/${matchId}/round/${roundNumber}/results`);
    }
  };

  const handleAnswerSelect = async (answer: string) => {
    if (isAnswered || !match || !user) return;

    setIsAnswered(true);
    setSelectedAnswer(answer);

    const matchRef = doc(db, 'matches', matchId as string);
    const roundIndex = match.rounds.findIndex(r => r.number === roundNumber);
    const answerField = match.player1Id === user.uid ? `rounds.${roundIndex}.player1Answers` : `rounds.${roundIndex}.player2Answers`;
    
    await updateDoc(matchRef, {
      [answerField]: arrayUnion({ questionId: questions[currentQuestionIndex].id, answer })
    });
    
    setTimeout(handleNextQuestion, 2000);
  };

  useEffect(() => {
    if (loadingQuestions || isAnswered || matchLoading) return;
    
    if (timeLeft === 0) {
      handleAnswerSelect("No Answer");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(t => Math.max(0, t - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isAnswered, loadingQuestions, matchLoading]);


  if (matchLoading || loadingQuestions || questions.length === 0 || !match) {
    return <LoadingScreen />;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = (timeLeft / TIMER_DURATION) * 100;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8 flex items-center justify-center">
        <Card className="w-full max-w-2xl animate-in fade-in duration-500">
          <CardHeader>
            <div className="flex justify-between items-center mb-2">
              <CardTitle className="text-2xl font-headline">Round {roundNumber}</CardTitle>
              <p className="text-muted-foreground font-medium">Question {currentQuestionIndex + 1} / {questions.length}</p>
            </div>
            <Progress value={progress} />
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <p className="text-xl md:text-2xl text-center font-medium min-h-[8rem] flex items-center justify-center p-4 bg-secondary rounded-lg">{currentQuestion.text}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options.map(option => {
                const isCorrect = option === currentQuestion.correctAnswer;
                const isSelected = option === selectedAnswer;

                return (
                  <Button
                    key={option}
                    variant="outline"
                    className={cn(
                      "h-auto py-4 text-base justify-start transition-all duration-300",
                      isAnswered && isCorrect && "bg-green-100 border-green-500 text-green-800 hover:bg-green-200 shadow-lg scale-105",
                      isAnswered && isSelected && !isCorrect && "bg-red-100 border-red-500 text-red-800 hover:bg-red-200",
                      !isAnswered && "hover:bg-accent hover:text-accent-foreground hover:scale-105"
                    )}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={isAnswered}
                  >
                    {option}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
