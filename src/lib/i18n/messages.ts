import { EN, type MsgKey } from "./en";
import type { LocaleId } from "./locales";
import es from "./packs/es.json";
import fr from "./packs/fr.json";
import de from "./packs/de.json";
import it from "./packs/it.json";
import pt from "./packs/pt.json";
import ro from "./packs/ro.json";
import pl from "./packs/pl.json";
import ru from "./packs/ru.json";
import uk from "./packs/uk.json";
import ar from "./packs/ar.json";
import hi from "./packs/hi.json";
import ko from "./packs/ko.json";
import zh from "./packs/zh.json";
import yue from "./packs/yue.json";
import fil from "./packs/fil.json";
import ht from "./packs/ht.json";
import vi from "./packs/vi.json";

type Pack = Record<MsgKey, string>;

export const MESSAGES: Record<LocaleId, Pack> = { en: EN, es, fr, de, it, pt, ro, pl, ru, uk, ar, hi, ko, zh, yue, fil, ht, vi };

export function interpolate(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? `{${key}}`));
}
