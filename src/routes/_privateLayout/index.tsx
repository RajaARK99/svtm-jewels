import { createFileRoute } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_privateLayout/")({
	component: App,
});

function App() {
	const { data } = authClient.useSession();
	return (
		<div className="grid h-full w-full place-content-center">
			<div className="text-center">
				<h1 className="font-bold text-4xl text-foreground">
					Hi {data?.user?.name ?? ""} Welcome to SVTM Jewels
				</h1>
				<p className="mt-4 text-lg text-muted-foreground">
					Your jewelry management system dashboard
				</p>
			</div>
		</div>
	);
}
