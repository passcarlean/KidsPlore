import { createContext, useContext, useRef, ReactNode } from "react";
import { Confetti, ConfettiRef } from "./confetti";

const ConfettiContext = createContext<{ burst: (x?: number, y?: number) => void }>({
  burst: () => {},
});

export function ConfettiProvider({ children }: { children: ReactNode }) {
  const confettiRef = useRef<ConfettiRef | null>(null);

  function burst(x?: number, y?: number) {
    confettiRef.current?.burst(x, y);
  }

  return (
    <ConfettiContext.Provider value={{ burst }}>
      <Confetti onRef={r => { confettiRef.current = r; }} />
      {children}
    </ConfettiContext.Provider>
  );
}

export function useConfetti() {
  return useContext(ConfettiContext);
}
