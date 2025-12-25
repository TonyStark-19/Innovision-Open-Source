"use client";

import { createContext, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

const xpContext = createContext();

export const XpProvider = ({ children }) => {
  const { data: session } = useSession();
  const [xp, setXp] = useState(0);
  const [show, setShow] = useState(false);
  const [changed, setChanged] = useState(0);

  // async function change() {
  //   setShow(true);
  //   setTimeout(() => {
  //     setShow(false);
  //     setChanged(0);
  //   }, 800);
  // }

  const getXp = useCallback(async () => {
    if (!session?.user?.email) return;

    try {
      const res = await fetch(`/api/gamification/stats?userId=${session.user.email}`);
      const data = await res.json();

      if (data && typeof data.xp === "number") {
        const xpDiff = data.xp - xp;
        if (xpDiff > 0 && xp > 0) {
          // Only show animation if xp was already set
          setChanged(xpDiff);
          change();
        }
        console.log("XP Context - Setting XP to:", data.xp);
        setXp(data.xp);
      }
    } catch (error) {
      console.error("Error fetching XP:", error);
    }
  }, []);

  const awardXP = useCallback(async (action, value = null) => {
    if (!session?.user?.email) return;

    try {
      const res = await fetch("/api/gamification/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.email,
          action,
          value,
        }),
      });

      const result = await res.json();

      if (result.success) {
        // Refresh XP to show the update
        await getXp();
        return result;
      }
    } catch (error) {
      console.error("Error awarding XP:", error);
    }
  }, []);

  // useEffect(() => {
  //   if (session?.user?.email) {
  //     getXp();

  //     // Poll for XP updates every 5 seconds for real-time feel
  //     const interval = setInterval(getXp, 5000);
  //     return () => clearInterval(interval);
  //   }
  // }, [session, getXp]);

  return <xpContext.Provider value={{ getXp, awardXP, xp, show, changed }}>{children}</xpContext.Provider>;
};

export default xpContext;
