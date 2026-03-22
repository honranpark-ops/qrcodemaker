export type ProfileRole = "user" | "admin";

export type Profile = {
  id: string;
  email: string | null;
  display_name: string;
  role: ProfileRole;
  created_at: string;
  updated_at: string;
};
