interface Request {
  date: string;
  method: string;
  req_headers: string;
  res_headers: string;
  endpoint: string;
  params: string;
  status: number;
  req_body: string;
  res_body: string;
  res_time: number;
}

interface LogsPagination {
  itemsPerPage: number;
  currentItem: number;
  totalItems: number;
}

interface LogsPaginationRequest {
  itemsPerPage: number;
  currentItem: number;
  method: TRequestMethodQuery;
}

interface RequestsParams extends LogsPaginationRequest, RequestsFilters {
  to: string;
  from: string;
}

interface RequestsFilters {
  search?: string;
  status?: string;
  resTimeLT?: string;
  resTimeGT?: string;
}

interface RequestsResponse {
  requests: Request[];
  totalItems: number;
}

interface RequestsByStatus {
  request_count: number;
  status: string;
  endpoint: string;
}
