export interface PaginationParams {
  limit?: number | string;
  skip?: number | string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc' | string;
}

export interface SortObject {
  [key: string]: 1 | -1;
}

export const buildSortObject = (
  sortBy: string = 'createdAt',
  sortOrder: string = 'desc'
): SortObject => {
  const sort: SortObject = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
  return sort;
};

export const parsePaginationParams = (params: PaginationParams) => {
  return {
    limit: Number(params.limit) || 50,
    skip: Number(params.skip) || 0,
    sortBy: params.sortBy || 'createdAt',
    sortOrder: params.sortOrder || 'desc',
  };
};

export const buildRangeFilter = (field: string, min?: number | string, max?: number | string): any => {
  const filter: any = {};

  if (min !== undefined) {
    filter.$gte = Number(min);
  }

  if (max !== undefined) {
    filter.$lte = Number(max);
  }

  return Object.keys(filter).length > 0 ? { [field]: filter } : {};
};

export const toArray = <T>(value: T | T[] | undefined): T[] => {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
};

export const parseBoolean = (value: any): boolean => {
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  if (Array.isArray(value)) {
    return value.some((v) => String(v).toLowerCase() === 'true');
  }
  return Boolean(value);
};
