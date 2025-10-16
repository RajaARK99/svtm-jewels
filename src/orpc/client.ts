import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import { createRouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { createIsomorphicFn } from "@tanstack/react-start";

import router from "@/orpc/router";
import { createContext } from "./context";

const getORPCClient = createIsomorphicFn()
	.server(() =>
		createRouterClient(router, {
			context: async ({ req }) => {
				return createContext({ req });
			},
		}),
	)
	.client((): RouterClient<typeof router> => {
		const link = new RPCLink({
			url: `${window.location.origin}/api/rpc`,
			fetch(url, options) {
				return fetch(url, {
					...options,
					credentials: "include",
				});
			},
		});

		return createORPCClient(link);
	});

export const client: RouterClient<typeof router> = getORPCClient();

export const orpc = createTanstackQueryUtils(client);
