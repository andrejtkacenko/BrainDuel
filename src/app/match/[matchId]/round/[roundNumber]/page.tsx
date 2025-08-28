"use client";

import { useState, useEffect, useReducer } from 'react';
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

type RoundState = {
  questions: Question[];
  currentQuestionIndex: number;
  selectedAnswer: string | null;
  isAnswered: boolean;
  timeLeft: number;
  loading: boolean;
  userScore: number;
  opponentScore: number;
  userAnswers: (string | null)[];
  opponentAnswers: (string | null)[];
};

type RoundAction =
  | { type: 'SET_QUESTIONS'; payload: Question[] }
  | { type: 'ANSWER_QUESTION'; payload: string }
  | { type: 'NEXT_QUESTION' }
  | { type: 'TICK_TIMER' }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: RoundState = {
  questions: [],
  currentQuestionIndex: 0,
  selectedAnswer: null,
  isAnswered: false,
  timeLeft: TIMER_DURATION,
  loading: true,
  userScore: 0,
  userAnswers: [],
  opponentScore: 0,
  opponentAnswers: [],
};

function roundReducer(state: RoundState, action: RoundAction): RoundState {
  switch (action.type) {
    case 'SET_QUESTIONS':
      return { ...initialState, questions: action.payload, loading: false };
    case 'ANSWER_QUESTION': {
      if (state.isAnswered) return state;
      const currentQuestion = state.questions[state.currentQuestionIndex];
      const userAnswer = action.payload;
      const isCorrect = userAnswer === currentQuestion.correctAnswer;
      
      // Simulate opponent's answer
      const opponentAnswer = currentQuestion.options[Math.floor(Math.random() * currentQuestion.options.length)];
      const isOpponentCorrect = opponentAnswer === currentQuestion.correctAnswer;

      return {
        ...state,
        isAnswered: true,
        selectedAnswer: userAnswer,
        userScore: state.userScore + (isCorrect ? 1 : 0),
        opponentScore: state.opponentScore + (isOpponentCorrect ? 1 : 0),
        userAnswers: [...state.userAnswers, userAnswer],
        opponentAnswers: [...state.opponentAnswers, opponentAnswer],
      };
    }
    case 'NEXT_QUESTION':
      if (state.currentQuestionIndex < state.questions.length - 1) {
        return {
          ...state,
          currentQuestionIndex: state.currentQuestionIndex + 1,
          isAnswered: false,
          selectedAnswer: null,
          timeLeft: TIMER_DURATION,
        };
      }
      return state; // No change if last question
    case 'TICK_TIMER':
      return { ...state, timeLeft: Math.max(0, state.timeLeft - 1) };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

export default function QuizRound() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { matchId, roundNumber } = params;
  const category = searchParams.get('category') || 'General Knowledge';

  const [state, dispatch] = useReducer(roundReducer, initialState);
  const {
    questions,
    currentQuestionIndex,
    selectedAnswer,
    isAnswered,
    timeLeft,
    loading,
    userScore,
    opponentScore,
    userAnswers,
    opponentAnswers,
  } = state;

  useEffect(() => {
    async function fetchQuestions() {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const response = await generateQuestions({ category, count: 3 });
        if (response && response.questions) {
          dispatch({ type: 'SET_QUESTIONS', payload: response.questions });
        }
      } catch (error) {
        console.error("Failed to generate questions:", error);
      }
    }
    fetchQuestions();
  }, [category]);

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      dispatch({ type: 'NEXT_QUESTION' });
    } else {
       // End of round, navigate to results
       const results = {
        roundNumber: Number(roundNumber),
        player1Score: userScore,
        player2Score: opponentScore,
        questions: questions.map((q, i) => ({
          text: q.text,
          player1Answer: userAnswers[i],
          player2Answer: opponentAnswers[i],
          correctAnswer: q.correctAnswer,
        })),
        isFinalRound: Number(roundNumber) === 3, // Assuming 3 rounds for now
      };
      router.push(`/match/${matchId}/round/${roundNumber}/results?results=${encodeURIComponent(JSON.stringify(results))}`);
    }
  };
  
  const handleAnswerSelect = (option: string) => {
    if (isAnswered) return;
    dispatch({ type: 'ANSWER_QUESTION', payload: option });
    setTimeout(handleNext, 2000);
  };

  useEffect(() => {
    if (loading || isAnswered) return;

    if (timeLeft === 0) {
      handleAnswerSelect("No Answer"); // Treat timeout as "No Answer"
      return;
    }

    const timer = setInterval(() => {
      dispatch({ type: 'TICK_TIMER' });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isAnswered, loading]);


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
