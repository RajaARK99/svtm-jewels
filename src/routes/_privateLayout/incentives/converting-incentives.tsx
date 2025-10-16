import { createFileRoute } from "@tanstack/react-router";
import { UnderConstruction } from "@/components/under-construction";

export const Route = createFileRoute(
	"/_privateLayout/incentives/converting-incentives",
)({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<UnderConstruction
			title="Converting Incentives"
			description="We're developing a sophisticated converting incentive system. This will include conversion tracking, performance metrics, and automated incentive calculations."
		/>
	);
}
