import { useEffect } from "react";
import { toast } from "sonner";
import { BullRun } from "./BullRun";
import { Terminal } from "./Terminal";
import { openTerminal, startBullRun } from "./signals";

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];
let greeted = false;

/**
 * The site's playful layer, mounted once for every public page: the terminal ("/" anywhere), the bull
 * run, the Konami code and a note for whoever opens the browser console.
 */
export function FunLayer() {
  useEffect(() => {
    let step = 0;
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement | null)?.closest?.(
        "input, textarea, select, [contenteditable='true']",
      );
      if (!typing && e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        openTerminal();
        return;
      }
      step =
        e.key === KONAMI[step] || e.key.toLowerCase() === KONAMI[step]
          ? step + 1
          : e.key === KONAMI[0]
            ? 1
            : 0;
      if (step === KONAMI.length) {
        step = 0;
        toast("Cheat code accepted", {
          description: "Unlimited coffee chats unlocked. Here come the bulls.",
        });
        startBullRun();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (greeted) return;
    greeted = true;
    console.log("%cEMFC", "font: 600 32px Georgia, serif; color: #5a67a2; letter-spacing: 0.08em");
    console.log(
      "Reading the source? We like curious people.\nPress / on any page for the EMFC Terminal, and follow EMFC on LinkedIn for the next intake.",
    );
  }, []);

  return (
    <>
      <Terminal />
      <BullRun />
    </>
  );
}
