import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTheme, applyThemeToDocument } from "@/lib/theme";

/**
 * Hook that loads the saved theme and applies it to the document.
 * Call this once at app root level.
 */
export function useApplyTheme() {
  const { data: theme } = useQuery({
    queryKey: ["theme-settings"],
    queryFn: fetchTheme,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  useEffect(() => {
    if (theme) {
      applyThemeToDocument(theme);
    }
  }, [theme]);
}
