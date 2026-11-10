import { useEffect } from "react";
import { toast as show } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { toasts } from "@/lib/toast";

/** The toaster itself, with the toast library: fetched by Toasts.tsx when a toast is first wanted. */
export default function ToastsToaster() {
  useEffect(() => {
    // The toaster below started listening in its own effect, which ran before this one.
    toasts.ready((kind, message, options) =>
      (kind === "plain" ? show : show[kind])(message, options),
    );
  }, []);
  return <Toaster />;
}
