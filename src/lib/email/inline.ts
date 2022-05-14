import { parseHTML } from 'linkedom';
import { striptags } from '$lib/striptags/striptags';

export function inline(html: string) {
  const {
    // note, these are *not* globals
    document,
    getComputedStyle
  } = parseHTML(html);

  const els = document.body.getElementsByTagName("*");

  for (let i = 0; i < els.length; i++) {
    const el = els[i];
    const cs = getComputedStyle(el, null);
    for (let i = 0; i < cs.length; i++) {
      const s = cs[i] + "";
      //@ts-ignore
      el.style[s] = cs[s];
    }
  }

  return document.toString();
}
