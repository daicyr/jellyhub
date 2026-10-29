import { queryOptions } from "@tanstack/react-query";
import type { ItemsOpts } from "@/types";
import { getServersItems } from "@/functions/jellyfin.functions";

export const itemsQueryOptions = (opts: ItemsOpts) =>
  queryOptions({
    queryKey: ["items", opts],
    queryFn: () => getServersItems({ data: { opts } }),
    staleTime: 5 * 60 * 1000,
  });
