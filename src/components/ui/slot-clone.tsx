import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

/**
 * SlotClone component
 * 
 * This component is a wrapper around the Radix UI Slot component that properly
 * forwards refs to the child component. It's used to clone a child element and
 * merge props onto it.
 */
export const SlotClone = React.forwardRef<
  HTMLElement,
  React.PropsWithChildren<{
    asChild?: boolean;
    [key: string]: any;
  }>
>(({ children, asChild = false, ...props }, ref) => {
  // If asChild is true, clone the child element and merge props
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      ref: ref ? mergeRefs([ref, (children as any).ref]) : (children as any).ref,
    });
  }

  // Otherwise, use the Slot component
  return (
    <Slot {...props} ref={ref}>
      {children}
    </Slot>
  );
});

SlotClone.displayName = "SlotClone";

/**
 * Merge multiple refs into one
 */
function mergeRefs(refs: React.Ref<any>[]) {
  return (value: any) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value);
      } else if (ref != null) {
        (ref as React.MutableRefObject<any>).current = value;
      }
    });
  };
}

export default SlotClone;
