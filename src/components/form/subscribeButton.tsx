import type { FormState } from "@tanstack/react-form";
import { Button } from "../ui/button";
import { useFormContext } from "./hooks";

export function SubscribeButton({
  children,
  disabled,
}: {
  children: (
    state: FormState<
      Record<string, never>,
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any
    >,
  ) => React.ReactNode;
  disabled?: boolean;
}) {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(state) => state}>
      {(state) => (
        <Button type="submit" disabled={state.isSubmitting || disabled}>
          {children(state)}
        </Button>
      )}
    </form.Subscribe>
  );
}
