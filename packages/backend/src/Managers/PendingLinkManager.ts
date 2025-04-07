import { PendingLink } from "../Processors/LinkProcessor";
import { Response } from "express";

const MAX_PENDING_LINKS = 20;
const MAX_PENDING_TIME = 180000;
const GARBAGE_COLLECTOR_INTERVAL = 10000;

export class PendingLinkManager {
  constructor() {}

  public pendingLinks = new Map<string, PendingLink>();

  addPendingLink(userId: string, pendingLink: PendingLink) {
    this.pendingLinks.forEach((pl, id, map) => {
      if (id != userId) return;
      pl.expire();
      return map.delete(id);
    });

    if (this.pendingLinks.size >= MAX_PENDING_LINKS) {
      const [firstKey] = this.pendingLinks.keys();
      const firstPendingLink = this.pendingLinks.get(firstKey);

      firstPendingLink.expire();
      this.pendingLinks.delete(firstKey);
    }
    this.pendingLinks.set(userId, pendingLink);
    pendingLink.startTimer();
  }

  attachLinkEndpoint(userId: string, res: Response) {
    const pendingLink = this.pendingLinks.get(userId);
    if (!pendingLink)
      return res.status(400).json({ error: "No PendingLink found." });
    pendingLink.attachEndpoint(res);
  }

  garbageCollector() {
    this.pendingLinks.forEach((pendingLink, userId, map) => {
      if (pendingLink.status != "pending") return map.delete(userId);

      if (Date.now() - pendingLink.date > MAX_PENDING_TIME) {
        pendingLink.expire();
        return map.delete(userId);
      }
    });
  }

  deletePendingLink(userId: string) {
    const pendingLink = this.pendingLinks.get(userId);
    if (!pendingLink) return;
    pendingLink.stopTimer();
    this.pendingLinks.delete(userId);
  }

  startGarbageCollector() {
    setInterval(() => this.garbageCollector(), GARBAGE_COLLECTOR_INTERVAL);
  }
}
