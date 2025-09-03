import { RequestWithUser } from "../../common/types";

export class CacheKeyHelper {
  static generateMessagesPairedKey(req: RequestWithUser) {
    const sid = String(req.user?.id);
    const rid = String(req.query.receiverId || req.body.receiverId);
    const [a, b] = [sid, rid].sort();
    return `cache:GET:/messages:pair:${a}:${b}`;
  }
}
