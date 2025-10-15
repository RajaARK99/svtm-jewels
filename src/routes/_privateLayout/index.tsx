import { createFileRoute, redirect } from "@tanstack/react-router";
import { getUserID } from "@/lib/auth-server-func";

export const Route = createFileRoute("/_privateLayout/")({
	component: App,
	beforeLoad: async () => {
		const userID = await getUserID();
		return {
			userID,
		};
	},
	loader: async ({ context }) => {
		if (!context.userID) {
			throw redirect({ to: "/auth/sign-in" });
		}
		return {
			userID: context.userID,
		};
	},
});

function App() {
	const { userID } = Route.useLoaderData();
	return (
		<div className="grid h-full w-full place-content-center">
			Hello World {userID ?? "-- --"}
		</div>
	);
}
