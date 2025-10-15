import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
	"/_privateLayout/incentives/floor-incentives",
)({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_privateLayout/incentives/floor-incentives"!</div>;
}
