import { useTheme as useNextTheme } from "next-themes";
import { useEffect, useState } from "react";

export function useTheme() {
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return {
    theme: mounted ? theme : "light",
    resolvedTheme: mounted ? resolvedTheme : "light",
    setTheme,
    isDark: mounted ? resolvedTheme === "dark" : false,
    mounted,
  };
}
