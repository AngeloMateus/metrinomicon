interface TBaseQuery {
  options?: TQueryOptions;
}

interface GetSearchSuggestionsParams extends TBaseQuery {
  keyword: string;
}

interface GetSearchParams extends TBaseQuery {
  keyword: string;
  pagination: LogsPaginationRequest;
  method: TRequestMethodQuery;
}

interface GetSLIs extends TBaseQuery {
  from: string;
}
