import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { orpc } from "@/orpc/client";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const { data } = useSuspenseQuery(orpc.listTodos.queryOptions());

  const queryClient = useQueryClient();

  const { mutate } = useMutation(
    orpc.addTodo.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(orpc.listTodos.queryOptions());
      },
    }),
  );
  const [name, setName] = useState("");
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 grid place-content-center text-white">
      Hello World
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button
        type="button"
        onClick={() => {
          mutate({ name });
        }}
      >
        Add
      </button>
      {data?.map((todo) => (
        <div key={todo.id}>{todo.name}</div>
      ))}
    </div>
  );
}
