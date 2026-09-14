import Link from "next/link";

type RadarSection = "training" | "gigs";

const sections: Array<{ key: RadarSection; href: string; label: string; description: string }> = [
  { key: "training", href: "/", label: "Training Radar", description: "Training & recovery" },
  { key: "gigs", href: "/gigs", label: "Gig Radar", description: "Sydney & NSW shows" },
];

export function RadarNav({ active }: { active: RadarSection }) {
  return (
    <nav className="radar-switcher" aria-label="TomOS radars">
      {sections.map((section) => {
        const content = (
          <>
            <span>{section.label}</span>
            <small>{section.description}</small>
          </>
        );

        return section.key === active ? (
          <span className="radar-switcher__item is-active" aria-current="page" key={section.key}>
            {content}
          </span>
        ) : (
          <Link className="radar-switcher__item" href={section.href} key={section.key}>
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
