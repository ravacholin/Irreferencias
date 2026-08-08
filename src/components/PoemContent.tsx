import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { buildTagMatcher, normalizeWithMap } from '../tagLinks';

interface PoemContentProps {
  content: string;
  tags: string[];
  onTagClick: (tag: string) => void;
  className?: string;
}

/**
 * Renderiza el HTML de un poema y convierte en enlaces las palabras del texto
 * que coinciden con los hashtags del propio poema. Al hacer click en una de
 * esas palabras se invoca `onTagClick` con el valor real del tag.
 *
 * El contenido es HTML crudo (proveniente de Blogger), así que el enlazado se
 * hace recorriendo los nodos de texto del DOM ya renderizado: así no se rompe
 * el marcado ni se tocan los `<a>` reales que pueda traer el contenido.
 */
export function PoemContent({ content, tags, onTagClick, className }: PoemContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const matcher = useMemo(() => buildTagMatcher(tags), [tags]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !matcher) return;

    // Recolectamos los nodos de texto primero (no se puede mutar el árbol
    // mientras se recorre con el TreeWalker).
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        // No enlazar dentro de <a> reales ni dentro de términos ya enlazados.
        if (parent.closest('a, .poem-tag-link')) return NodeFilter.FILTER_REJECT;
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const textNodes: Text[] = [];
    let current = walker.nextNode();
    while (current) {
      textNodes.push(current as Text);
      current = walker.nextNode();
    }

    for (const textNode of textNodes) {
      const text = textNode.nodeValue ?? '';
      const { norm, map } = normalizeWithMap(text);

      matcher.regex.lastIndex = 0;
      let match: RegExpExecArray | null;
      let lastOrigIndex = 0;
      const fragment = document.createDocumentFragment();
      let matched = false;

      while ((match = matcher.regex.exec(norm)) !== null) {
        const normStart = match.index;
        const normEnd = normStart + match[0].length;
        // El match tiene largo > 0, así que map[normStart]/map[normEnd-1] existen.
        const origStart = map[normStart];
        const origEnd = map[normEnd - 1] + 1;

        const tagValue = matcher.lookup.get(match[0]);
        if (tagValue === undefined) continue;

        matched = true;

        if (origStart > lastOrigIndex) {
          fragment.appendChild(
            document.createTextNode(text.slice(lastOrigIndex, origStart))
          );
        }

        const span = document.createElement('span');
        span.className = 'poem-tag-link';
        span.setAttribute('data-tag', tagValue);
        span.setAttribute('role', 'link');
        span.setAttribute('tabindex', '0');
        span.textContent = text.slice(origStart, origEnd);
        fragment.appendChild(span);

        lastOrigIndex = origEnd;
      }

      if (!matched) continue;

      if (lastOrigIndex < text.length) {
        fragment.appendChild(document.createTextNode(text.slice(lastOrigIndex)));
      }

      textNode.parentNode?.replaceChild(fragment, textNode);
    }
  }, [content, matcher]);

  const handleActivate = useCallback(
    (target: EventTarget | null) => {
      if (!(target instanceof Element)) return false;
      const link = target.closest('.poem-tag-link');
      if (!link) return false;
      const tag = link.getAttribute('data-tag');
      if (tag) {
        onTagClick(tag);
        return true;
      }
      return false;
    },
    [onTagClick]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      handleActivate(e.target);
    },
    [handleActivate]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      if (handleActivate(e.target)) e.preventDefault();
    },
    [handleActivate]
  );

  return (
    <div
      ref={containerRef}
      className={className}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
