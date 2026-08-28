import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ThemeChoice = "light" | "dark" | "system";

const KEY = "hfm-theme";

function applyTheme(choice: ThemeChoice) {
  if (typeof document === "undefined") return;
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = choice === "dark" || (choice === "system" && systemDark);
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.classList.toggle("light", !dark);
}

const ThemeContext = createContext<{
  theme: ThemeChoice;
  setTheme: (t: ThemeChoice) => void;
}>({ theme: "system", setTheme: () => undefined });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeChoice>("system");

  useEffect(() => {
    const stored = (localStorage.getItem(KEY) as ThemeChoice | null) ?? "system";
    setThemeState(stored);
    applyTheme(stored);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const current = (localStorage.getItem(KEY) as ThemeChoice | null) ?? "system";
      if (current === "system") applyTheme("system");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const setTheme = (t: ThemeChoice) => {
    localStorage.setItem(KEY, t);
    setThemeState(t);
    applyTheme(t);
  };

  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
