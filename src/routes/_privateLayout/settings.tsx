import { createFileRoute } from "@tanstack/react-router";
import { UnderConstruction } from "@/components/under-construction";

export const Route = createFileRoute("/_privateLayout/settings")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<UnderConstruction
			title="System Settings"
			description="We're creating a comprehensive settings panel. This will include system configuration, user preferences, security settings, and application customization options."
		/>
	);
}
