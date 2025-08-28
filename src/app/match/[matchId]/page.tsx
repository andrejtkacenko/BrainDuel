"use client";

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMatch } from '@/hooks/use-match';
import { Loader2 } from 'lucide-react';

// This is a redirector page. It checks the match status and redirects to the correct page.
export default function MatchPage() {
  const router = useRouter();
  const params = useParams();
  const { matchId } = params;
  const { match, loading } = useMatch(matchId as string);

  useEffect(() => {
    if (loading) return;
    if (!match) {
      // If no match found, redirect to home
      router.push('/');
      return;
    }

    switch (match.status) {
      case 'lobby':
        router.push(`/match/${matchId}/lobby`);
        break;
      case 'category-select':
        router.push(`/match/${matchId}/category-select`);
        break;
      case 'in-progress':
        router.push(`/match/${matchId}/round/${match.currentRound}`);
        break;
       case 'round-results':
        router.push(`/match/${matchId}/round/${match.currentRound}/results`);
        break;
      case 'complete':
        router.push(`/match/${matchId}/results`);
        break;
      default:
        router.push('/');
    }
  }, [match, loading, router, matchId]);

  return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
