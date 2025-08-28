export type User = {
  id: string;
  name: string;
  avatarUrl: string;
  wins: number;
  losses: number;
};

export type Question = {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
};

export type Round = {
  number: number;
  category: string;
  questions: Question[];
  player1Answers: (string | null)[];
  player2Answers: (string | null)[];
};

export type Match = {
  id: string;
  player1: User;
  player2: User | null;
  status: 'pending' | 'lobby' | 'category-select' | 'in-progress' | 'round-results' | 'complete';
  numberOfRounds: number;
  rounds: Round[];
  currentRound: number;
  turn: 'player1' | 'player2';
  winner: 'player1' | 'player2' | null;
};
