import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_privateLayout/")({
	component: App,
});

function App() {
	return <div className="grid h-full w-full place-content-center">Hello</div>;
}
