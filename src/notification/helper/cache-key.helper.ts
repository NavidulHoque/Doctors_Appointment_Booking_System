import { RequestWithUser } from "src/common/types";

export class CacheKeyHelper {
  static generateNotificationsKey(req: RequestWithUser) {
    const userId = req.user!.id
    return `cache:GET:/notifications:user:${userId}`;
  }
}
