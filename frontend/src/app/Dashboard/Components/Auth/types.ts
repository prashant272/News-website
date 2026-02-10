export type Mode = "signin" | "signup" | "forgot";

export interface AuthChildProps {
  setMode: (mode: Mode) => void;
}
