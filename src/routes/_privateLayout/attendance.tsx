import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_privateLayout/attendance")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_privateLayout/attendance"!</div>;
}
