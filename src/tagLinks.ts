/**
 * Utilidades para enlazar, dentro del cuerpo de un poema, las palabras que
 * coinciden con los hashtags del propio poema.
 *
 * El matcheo es insensible a acentos y mayúsculas: el tag `rio` debe
 * reconocer `río`/`Río`, y `durruti` debe reconocer `Durruti`. También
 * admite tags de varias palabras (`buenaventura durruti`, `via negationis`).
 */

const COMBINING_MARKS = /[̀-ͯ]/g;

/** Quita acentos/diacríticos y pasa a minúsculas. */
export function normalize(text: string): string {
  return text.normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase();
}

/**
 * Normaliza el texto conservando un mapeo de índices hacia el texto
 * original. `map[i]` es el índice, en `text`, del i-ésimo carácter de `norm`.
 *
 * Al normalizar carácter por carácter, cada carácter original produce cero o
 * más caracteres normalizados (las marcas combinantes se eliminan, con lo que
 * un carácter acentuado suele quedar en uno solo). Guardando el índice de
 * origen de cada carácter normalizado podemos traducir cualquier match hecho
 * sobre `norm` de vuelta a las posiciones reales en `text`.
 */
export function normalizeWithMap(text: string): { norm: string; map: number[] } {
  let norm = '';
  const map: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const normalized = normalize(text[i]);
    for (let j = 0; j < normalized.length; j++) {
      norm += normalized[j];
      map.push(i);
    }
  }
  return { norm, map };
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export interface TagMatcher {
  /**
   * Expresión regular global que corre SOBRE la versión normalizada del
   * texto. Cada match corresponde a la aparición de un término.
   */
  regex: RegExp;
  /** Término normalizado → valor real del tag (para navegar/filtrar). */
  lookup: Map<string, string>;
}

/**
 * Construye un matcher a partir de los tags de un poema. Devuelve `null` si no
 * hay tags utilizables.
 */
export function buildTagMatcher(tags: string[]): TagMatcher | null {
  if (!tags || tags.length === 0) return null;

  const lookup = new Map<string, string>();
  for (const tag of tags) {
    const key = normalize(tag).trim();
    if (!key) continue;
    // Ante colisiones (dos tags que normalizan igual) gana el primero.
    if (!lookup.has(key)) lookup.set(key, tag);
  }
  if (lookup.size === 0) return null;

  // Términos más largos primero para que las coincidencias multi-palabra
  // ganen sobre sus componentes (p. ej. `buenaventura durruti` vs `durruti`).
  const terms = [...lookup.keys()].sort((a, b) => b.length - a.length);
  const alternation = terms.map(escapeRegExp).join('|');

  // Bordes de palabra ASCII: el texto normalizado solo tiene [a-z0-9] como
  // caracteres "de palabra" relevantes, así evitamos enlazar subcadenas
  // (p. ej. `sol` dentro de `solamente`).
  const regex = new RegExp(`(?<![a-z0-9])(?:${alternation})(?![a-z0-9])`, 'g');

  return { regex, lookup };
}
