import { RequestWithUser } from "../types";

export class CacheKeyHelper {
  static generateMessagesPairedKey(req: RequestWithUser) {
    const sid = String(req.user?.id ?? '');
    const rid = String(req.query.receiverId ?? '');
    const [a, b] = [sid, rid].sort();
    return `cache:GET:/messages:pair:${a}:${b}`;
  }
}
