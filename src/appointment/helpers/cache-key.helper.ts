import { Request } from 'express';

export class CacheKeyHelper {
  static generateAppointmentsKey(req: Request) {

    const query = req.query;

    if ('search' in query && query.search) return undefined;
    
    const sortedQuery = Object.keys(query)
      .sort()
      .reduce((acc, key) => {
        acc[key] = query[key];
        return acc;
      }, {});

    return `cache:GET:/appointments:queries:${JSON.stringify(sortedQuery)}`
  }
}
