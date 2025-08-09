"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React from "react";

export function ReactQueryProvider({ children }: React.PropsWithChildren) {
  const [client] = React.useState(
    new QueryClient({
      // queryCache: new QueryCache({
      //   onError: (error, query) => {
      //     const errorTitle = query?.meta?.errorTitle as string || 'Error';
      //     const errorMessage =
      //       error instanceof Error ? error.message : 'Unknown error';
      //     toast({
      //       title: errorTitle,
      //       description: `An error occurred while fetching: ${errorMessage}`,
      //       variant: 'destructive',
      //       duration: 3000,
      //     });
      //   },
      // }),
    }),
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <>
          <ReactQueryDevtools initialIsOpen={false} />
        </>
      )}
    </QueryClientProvider>
  );
}
