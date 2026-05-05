import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

const FREE_MONTHLY_LIMIT = 15;

export function useProStatus(userId: string | null) {
  const [isPro, setIsPro] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const fetchSettings = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("app_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (data) {
      setIsPro(data.is_pro);
      setOnboardingDone(data.onboarding_done);
    } else {
      await supabase.from("app_settings").insert({
        user_id: userId,
        is_pro: false,
        onboarding_done: false,
      });
    }
    setSettingsLoaded(true);
  }, [userId]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const activatePro = async () => {
    if (!userId) return;
    setIsPro(true);
    await supabase.from("app_settings").upsert({ user_id: userId, is_pro: true, updated_at: new Date().toISOString() });
  };

  const deactivatePro = async () => {
    if (!userId) return;
    setIsPro(false);
    await supabase.from("app_settings").upsert({ user_id: userId, is_pro: false, updated_at: new Date().toISOString() });
  };

  const finishOnboarding = async () => {
    if (!userId) return;
    setOnboardingDone(true);
    await supabase.from("app_settings").upsert({ user_id: userId, onboarding_done: true, updated_at: new Date().toISOString() });
  };

  const checkLimit = (currentMonthCount: number) => isPro || currentMonthCount < FREE_MONTHLY_LIMIT;

  return { isPro, onboardingDone, settingsLoaded, activatePro, deactivatePro, finishOnboarding, checkLimit, FREE_MONTHLY_LIMIT };
}
