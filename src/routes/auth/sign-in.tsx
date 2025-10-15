import { revalidateLogic, useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { GemIcon } from "lucide-react";
import { toast } from "sonner";
import z from "zod";
import jewelLogin from "@/assets/images/jewel-login.jpg";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/auth/sign-in")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate({
		from: "/auth/sign-in",
	});
	const { mutate, isPending } = useMutation({
		mutationKey: ["login"],
		mutationFn: async (values: { email: string; password: string }) => {
			const { data, error } = await authClient.signIn.email({
				email: values.email,
				password: values.password,
			});
			console.log({ data, error });

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
				email: z.email("Email is requird"),
				password: z
					.string("Password is required")
					.min(8, "Minimum at least 8 charectors required."),
			}),
		},
		validationLogic: revalidateLogic({
			mode: "change",
			modeAfterSubmission: "submit",
		}),
		onSubmit: ({ value }) => {
			mutate(value);
		},
	});
	return (
		<div className="flex h-screen items-center justify-center">
			<div className="grid h-full w-full p-4 lg:grid-cols-2">
				<div className="m-auto flex w-full max-w-xs flex-col items-center">
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
							{(field) => {
								return (
									<Field>
										<FieldLabel htmlFor="email">Email</FieldLabel>
										<Input
											id="email"
											type="email"
											placeholder="m@example.com"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
											autoComplete="off"
										/>

										{field.state.meta.isTouched && !field.state.meta.isValid ? (
											<FieldError errors={field.state.meta.errors} />
										) : null}
									</Field>
								);
							}}
						</AppField>
						<AppField name="password">
							{(field) => {
								return (
									<Field>
										<div className="flex items-center">
											<FieldLabel htmlFor="password">Password</FieldLabel>
											<a
												href="#"
												className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
											>
												Forgot your password?
											</a>
										</div>
										<Input
											id="password"
											type="password"
											placeholder="********"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
											autoComplete="off"
										/>

										{field.state.meta.isTouched && !field.state.meta.isValid ? (
											<FieldError errors={field.state.meta.errors} />
										) : null}
									</Field>
								);
							}}
						</AppField>
						<Field>
							<Button
								type="submit"
								disabled={isPending}
								className="flex items-center justify-center"
							>
								{isPending && <Spinner />}
								Login
							</Button>
							<Button variant="outline" type="button">
								Login with Google
							</Button>
							<FieldDescription className="text-center">
								Don&apos;t have an account? <a href="#">Sign up</a>
							</FieldDescription>
						</Field>
					</form>
				</div>
				<div className="hidden overflow-hidden rounded-lg border bg-muted p-2 lg:block">
					<img
						src={jewelLogin}
						alt="Jewelry showcase"
						className="h-full w-full rounded-lg object-cover"
					/>
				</div>
			</div>
		</div>
	);
}
