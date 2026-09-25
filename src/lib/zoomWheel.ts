/**
 * True for a wheel turned with ctrl or Cmd held, which browsers keep for
 * zooming the page: ctrl nearly everywhere, and Cmd in Firefox on a Mac. A
 * trackpad pinch arrives as a wheel with ctrl held too. Scroll handlers leave
 * these to the browser.
 */
export function isZoomWheel(event: Pick<MouseEvent, 'ctrlKey' | 'metaKey'>) {
  return event.ctrlKey || event.metaKey;
}
