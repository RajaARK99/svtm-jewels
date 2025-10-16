import { createFileRoute } from "@tanstack/react-router";
import { UnderConstruction } from "@/components/under-construction";

export const Route = createFileRoute("/_privateLayout/attendance")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<UnderConstruction
			title="Attendance System"
			description="We're building a comprehensive attendance tracking system. This feature will be available soon with real-time monitoring and reporting capabilities."
		/>
	);
}
