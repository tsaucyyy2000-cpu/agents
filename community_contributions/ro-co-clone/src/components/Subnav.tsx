import { useEffect, useState } from "react";
import "./Subnav.css";

export type SubnavItem = { id: string; label: string };

type Props = {
  items: SubnavItem[];
};

/** Sticky on-page nav with IntersectionObserver section highlighting. */
export function Subnav({ items }: Props) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  const itemIds = items.map((item) => item.id).join("|");

  useEffect(() => {
    const ids = itemIds.split("|").filter(Boolean);
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node));
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const first = visible[0];
        if (first?.target.id) setActive(first.target.id);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
    );

    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, [itemIds]);

  if (items.length === 0) return null;

  return (
    <nav className="page-subnav" aria-label="On this page">
      <div className="page-subnav-inner">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={active === item.id ? "is-active" : ""}
            aria-current={active === item.id ? "true" : undefined}
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
