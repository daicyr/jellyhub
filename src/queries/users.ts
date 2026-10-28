import { queryOptions } from "@tanstack/react-query";
import { adminUsersList } from "@/functions/auth.functions";

export const usersListQueryOptions = queryOptions({
  queryFn: adminUsersList,
  queryKey: ["usersList"],
  staleTime: 5 * 60 * 1000,
});
