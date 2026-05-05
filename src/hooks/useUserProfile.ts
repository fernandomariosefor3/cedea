import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface UserProfile {
  name: string;
  avatarColor: string;
  joinedAt: string;
}

export const AVATAR_COLORS = [
  { label: "Indigo",  value: "#6366f1" },
  { label: "Emerald", value: "#10b981" },
  { label: "Rose",    value: "#f43f5e" },
  { label: "Amber",   value: "#f59e0b" },
  { label: "Teal",    value: "#14b8a6" },
  { label: "Coral",   value: "#ef4444" },
];

const DEFAULT_PROFILE: UserProfile = {
  name: "Usuário",
  avatarColor: "#6366f1",
  joinedAt: new Date().toISOString().slice(0, 7),
};

export function useUserProfile(userId: string | null) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (data) {
      setProfile({ name: data.name, avatarColor: data.avatar_color, joinedAt: data.joined_at });
    } else {
      const initial = { ...DEFAULT_PROFILE, joinedAt: new Date().toISOString().slice(0, 7) };
      await supabase.from("user_profiles").insert({
        user_id: userId,
        name: initial.name,
        avatar_color: initial.avatarColor,
        joined_at: initial.joinedAt,
      });
      setProfile(initial);
    }
  }, [userId]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!userId) return;
    const next = { ...profile, ...updates };
    setProfile(next);
    await supabase.from("user_profiles").upsert({
      user_id: userId,
      name: next.name,
      avatar_color: next.avatarColor,
      joined_at: next.joinedAt,
      updated_at: new Date().toISOString(),
    });
  };

  const initials =
    profile.name.trim().split(/\s+/).filter(Boolean).slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "").join("") || "U";

  return { profile, updateProfile, initials };
}
