"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Match } from "@/lib/types";

export const useMatch = (matchId: string) => {
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!matchId) {
      setLoading(false);
      return;
    }

    const matchRef = doc(db, "matches", matchId);
    
    const unsubscribe = onSnapshot(
      matchRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setMatch({ id: docSnap.id, ...docSnap.data() } as Match);
        } else {
          setError(new Error("Match not found"));
          setMatch(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching match:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [matchId]);

  return { match, loading, error };
};
