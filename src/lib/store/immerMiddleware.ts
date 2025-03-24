/**
 * Custom Immer Middleware for Zustand
 * 
 * This is a custom implementation of the immer middleware for Zustand
 * that directly imports the immer package to avoid resolution issues.
 */

import { StateCreator, StoreMutatorIdentifier } from 'zustand';
import { produce } from 'immer';

// Define the type for the immer middleware
type ImmerStateCreator<T, Mps extends [StoreMutatorIdentifier, unknown][] = [], Mcs extends [StoreMutatorIdentifier, unknown][] = []> = 
  StateCreator<T, [...Mps, ['zustand/immer', never]], Mcs>;

// Create the immer middleware
export const immer = <T, Mps extends [StoreMutatorIdentifier, unknown][] = [], Mcs extends [StoreMutatorIdentifier, unknown][] = []>(
  stateCreator: StateCreator<T, Mps, [['zustand/immer', never], ...Mcs]>
): StateCreator<T, Mps, Mcs> => {
  return (set, get, store) => {
    const immerSet = (updater: T | ((state: T) => void)) => {
      return set(
        typeof updater === 'function'
          ? produce(updater as (state: T) => void)
          : updater
      );
    };

    return stateCreator(immerSet, get, store);
  };
}; 