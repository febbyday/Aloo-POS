import { z } from "zod";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CreateSettingsStoreProps<T> {
  schema: z.ZodSchema<T>;
  defaultValues: T;
  storageKey: string;
}

export function createSettingsStore<T extends Record<string, any>>({
  schema,
  defaultValues,
  storageKey,
}: CreateSettingsStoreProps<T>) {
  return create(
    persist<{
      settings: T;
      updateSettings: (newSettings: Partial<T>) => void;
      resetSettings: () => void;
    }>(
      (set) => ({
        settings: defaultValues,
        updateSettings: (newSettings) =>
          set((state) => {
            const updated = { ...state.settings, ...newSettings };
            return { settings: schema.parse(updated) };
          }),
        resetSettings: () => set({ settings: defaultValues }),
      }),
      {
        name: storageKey,
      }
    )
  );
}