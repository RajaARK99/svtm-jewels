import { createFileRoute } from "@tanstack/react-router";
import { UnderConstruction } from "@/components/under-construction";

export const Route = createFileRoute(
	"/_privateLayout/incentives/chit-incentives",
)({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<UnderConstruction
			title="Chit Incentives"
			description="We're building a comprehensive chit incentive management system. This will include chit tracking, incentive calculations, and automated reward distribution."
		/>
	);
}
