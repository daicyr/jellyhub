import { queryOptions } from "@tanstack/react-query";
import { ssoProvidersList } from "@/functions/sso.functions";

export const ssoProvidersQueryOptions = queryOptions({
  queryFn: ssoProvidersList,
  queryKey: ["ssoProviders"],
  staleTime: 5 * 60 * 1000,
});
