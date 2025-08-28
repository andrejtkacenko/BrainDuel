export type User = {
  uid: string;
  name: string;
  avatarUrl: string;
  wins: number;
  losses: number;
  online: boolean;
};

export type Question = {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
};

type PlayerAnswer = {
  questionId: string;
  answer: string;
};

export type Round = {
  number: number;
  category: string;
  questions: Question[];
  player1Answers: PlayerAnswer[];
  player2Answers: PlayerAnswer[];
  player1Score?: number;
  player2Score?: number;
  scoresCalculated?: boolean;
};

export type Match = {
  id: string;
  creatorId: string;
  player1Id: string;
  player2Id: string | null;
  players: {
    [key: string]: User;
  };
  status: 'lobby' | 'category-select' | 'in-progress' | 'round-results' | 'complete';
  numberOfRounds: number;
  rounds: Round[];
  currentRound: number;
  turn: string; // user uid
  winnerId: string | null;
  player1FinalScore?: number;
  player2FinalScore?: number;
};
