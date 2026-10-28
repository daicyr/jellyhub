import { queryOptions } from "@tanstack/react-query";
import { getJellyData } from "@/functions/server.functions";

export const jellyDataQueryOptions = queryOptions({
  queryKey: ["jellydata"],
  queryFn: () => getJellyData({ data: { updateStatus: false } }),
  staleTime: 5 * 60 * 1000,
});

export const jellyDataUpdatedQueryOptions = queryOptions({
  queryKey: ["jellydata", "updated"],
  queryFn: () => getJellyData({ data: { updateStatus: true } }),
  staleTime: 5 * 60 * 1000,
});
