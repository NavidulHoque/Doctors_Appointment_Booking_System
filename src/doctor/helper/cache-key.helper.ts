import { Request } from 'express';

export class CacheKeyHelper {
  static generateDoctorsKey(req: Request) {

    const query = req.query;

    if ('search' in query && query.search) return undefined;
    
    const sortedQuery = Object.keys(query)
      .sort()
      .reduce((acc, key) => {
        acc[key] = query[key];
        return acc;
      }, {});

    return `cache:GET:/doctors:queries:${JSON.stringify(sortedQuery)}`
  }
}
