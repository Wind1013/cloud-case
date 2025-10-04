import {
  parseAsString,
  parseAsInteger,
  createSearchParamsCache,
} from "nuqs/server";

export const documentsSearchParams = {
  query: parseAsString.withDefault("").withOptions({ shallow: false }),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
};

export const searchParamsCache = createSearchParamsCache(documentsSearchParams);
