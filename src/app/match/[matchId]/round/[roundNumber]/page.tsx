"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Header from '@/components/header';
import { cn } from '@/lib/utils';
import type { Question } from '@/lib/types';
import { generateQuestions } from '@/ai/flows/question-flow';
import { Skeleton } from '@/components/ui/skeleton';

const TIMER_DURATION = 15;

export default function QuizRound() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { matchId, roundNumber } = params;
  const category = searchParams.get('category') || 'General Knowledge';

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoading(true);
        const response = await generateQuestions({ category, count: 3 });
        if (response && response.questions) {
          setQuestions(response.questions);
        }
      } catch (error) {
        console.error("Failed to generate questions:", error);
        // Fallback to mock questions if AI fails
        // setQuestions(mockQuestions);
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, [category]);

  useEffect(() => {
    if (loading || isAnswered) return;

    if (timeLeft === 0) {
      handleNext();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isAnswered, loading]);

  const handleNext = () => {
    setIsAnswered(false);
    setSelectedAnswer(null);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeLeft(TIMER_DURATION);
    } else {
      router.push(`/match/${matchId}/round/${roundNumber}/results`);
    }
  };

  const handleAnswerSelect = (option: string) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedAnswer(option);
    
    // In a real app, you would record the answer and timing.

    setTimeout(handleNext, 2000); // Wait 2 seconds before moving to the next question
  };

  if (loading || questions.length === 0) {
    return (
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
            <CardContent className="space-y-6">
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
          <CardContent className="space-y-6">
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
