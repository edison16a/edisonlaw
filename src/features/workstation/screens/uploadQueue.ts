/**
 * Sending a repainted screen canvas to the GPU is the costliest step of a repaint, so every stage
 * on the page shares one upload per animation frame. Changed screens wait their turn, oldest first.
 *
 * Each rendered frame, every screen with a change asks for the slot. A screen yields to an older
 * one only while that one is still asking, so a stage that stops drawing never blocks the rest.
 */

export interface UploadTicket {
  /** Frame this ticket last asked for the slot in. */
  askedIn: number;
}

export function createUploadTicket(): UploadTicket {
  return { askedIn: Number.NEGATIVE_INFINITY };
}

export class UploadQueue {
  /** Waiting tickets in the order their changes came in. A Set keeps first insertion order. */
  private readonly waiting = new Set<UploadTicket>();
  private frame = 0;
  private spentIn = -1;

  /** Starts a new animation frame, which frees the slot. */
  nextFrame() {
    this.frame += 1;
  }

  /** Marks the ticket's screen as changed. A ticket already waiting keeps its place. */
  request(ticket: UploadTicket) {
    this.waiting.add(ticket);
  }

  isWaiting(ticket: UploadTicket) {
    return this.waiting.has(ticket);
  }

  /** True when the ticket gets this frame's upload. Only call it for a waiting ticket. */
  take(ticket: UploadTicket): boolean {
    ticket.askedIn = this.frame;
    if (this.spentIn === this.frame) return false;
    for (const other of this.waiting) {
      if (other === ticket) break;
      // An older change on a stage that drew last frame goes first. It asks later in this frame.
      if (other.askedIn >= this.frame - 1) return false;
    }
    this.spentIn = this.frame;
    this.waiting.delete(ticket);
    return true;
  }

  cancel(ticket: UploadTicket) {
    this.waiting.delete(ticket);
  }
}
