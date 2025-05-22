import { useState } from 'react';

/**
 * Custom hook to manage edit mode state for different sections
 * 
 * @param sections Array of section names to track edit mode for
 * @returns Object with edit mode state and functions to manage it
 */
export function useEditMode(sections: string[]) {
  // Create initial state with all sections set to false (not editing)
  const initialState = sections.reduce((acc, section) => {
    acc[section] = false;
    return acc;
  }, {} as Record<string, boolean>);

  const [editMode, setEditMode] = useState<Record<string, boolean>>(initialState);
  const [isSaving, setIsSaving] = useState(false);

  // Enable edit mode for a specific section
  const enableEditMode = (section: string) => {
    setEditMode(prev => ({ ...prev, [section]: true }));
  };

  // Disable edit mode for a specific section
  const disableEditMode = (section: string) => {
    setEditMode(prev => ({ ...prev, [section]: false }));
  };

  // Check if any section is in edit mode
  const isAnyEditing = () => {
    return Object.values(editMode).some(value => value);
  };

  return {
    editMode,
    isSaving,
    setIsSaving,
    enableEditMode,
    disableEditMode,
    isAnyEditing
  };
}
