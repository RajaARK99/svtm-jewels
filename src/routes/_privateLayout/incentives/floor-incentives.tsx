import { createFileRoute } from "@tanstack/react-router";
import { UnderConstruction } from "@/components/under-construction";

export const Route = createFileRoute(
	"/_privateLayout/incentives/floor-incentives",
)({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<UnderConstruction
			title="Floor Incentives"
			description="We're creating a comprehensive floor incentive management system. This will include floor performance tracking, team incentives, and productivity-based rewards."
		/>
	);
}
