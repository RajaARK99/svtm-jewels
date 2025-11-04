import { revalidateLogic, useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, GemIcon, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import jewelLogin from "@/assets/images/jewel-login.jpg";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { auth } from "@/lib/auth/auth-client";

const MIN_PASSWORD_LENGTH = 8;

export const Route = createFileRoute("/_public/auth/sign-in")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { mutate, isPending } = useMutation({
    mutationKey: ["login"],
    mutationFn: async (values: { email: string; password: string }) => {
      const { data, error } = await auth.signIn.email({
        email: values.email,
        password: values.password,
      });

      if (error) {
        throw error;
      }

      return data;
    },
    onError: (e) => {
      toast.error(e.message ?? "Something went wrong.");
    },
    onSuccess: () => {
      navigate({
        to: "/",
      });
    },
  });

  const { Field: AppField, handleSubmit } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onDynamic: z.object({
        email: z.email("Email is required"),
        password: z
          .string("Password is required")
          .min(MIN_PASSWORD_LENGTH, "Minimum at least 8 characters required."),
      }),
    },
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    onSubmit: ({ value }) => {
      mutate(value);
    },
  });
  return (
    <div className="relative flex h-screen items-center justify-center">
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255, 80, 120, 0.25), transparent 70%), #000000",
        }}
      />
      <div className="grid h-full w-full p-4 lg:grid-cols-2">
        <div className="static z-10 m-auto flex w-full max-w-xs flex-col items-center">
          <GemIcon className="h-9 w-9" />
          <p className="mt-4 font-semibold text-xl tracking-tight">
            Log in to SVTM Jewels
          </p>

          <form
            className="w-full space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSubmit(e);
            }}
          >
            <AppField name="email">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon align="inline-start">
                      <Mail className="text-muted-foreground" />
                    </InputGroupAddon>
                    <InputGroupInput
                      autoComplete="off"
                      id="email"
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="m@example.com"
                      type="email"
                      value={field.state.value}
                    />
                  </InputGroup>

                  {field.state.meta.isTouched && !field.state.meta.isValid ? (
                    <FieldError errors={field.state.meta.errors} />
                  ) : null}
                </Field>
              )}
            </AppField>
            <AppField name="password">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>

                  <InputGroup>
                    <InputGroupAddon align="inline-start">
                      <Lock className="text-muted-foreground" />
                    </InputGroupAddon>
                    <InputGroupInput
                      autoComplete="off"
                      id="password"
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      value={field.state.value}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        onClick={() => setShowPassword(!showPassword)}
                        size="icon-xs"
                        variant="ghost"
                      >
                        {showPassword ? (
                          <EyeOff className="text-muted-foreground" />
                        ) : (
                          <Eye className="text-muted-foreground" />
                        )}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>

                  {field.state.meta.isTouched && !field.state.meta.isValid ? (
                    <FieldError errors={field.state.meta.errors} />
                  ) : null}
                </Field>
              )}
            </AppField>
            <Field>
              <Button
                className="flex items-center justify-center"
                disabled={isPending}
                type="submit"
              >
                {isPending && <Spinner />}
                Login
              </Button>
            </Field>
          </form>
        </div>
        <div className="static z-10 hidden overflow-hidden rounded-lg border bg-amber-500/10 p-2 lg:block">
          <img
            alt="Jewelry showcase"
            className="h-full w-full rounded-lg object-cover"
            src={jewelLogin}
          />
        </div>
      </div>
    </div>
  );
}
