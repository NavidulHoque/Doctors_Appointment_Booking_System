import { RequestWithUser } from "../types";

export class CacheKeyHelper {
  static messagesPair(req: RequestWithUser): string[] {
    const sid = String(req.user?.id ?? '');
    const rid = String((req.query as any).receiverId ?? '');
    if (!sid || !rid) return ['cache:GET:/messages:*'];
    const [a, b] = [sid, rid].sort();
    return [`cache:GET:/messages:pair:${a}:${b}`];
  }
}
