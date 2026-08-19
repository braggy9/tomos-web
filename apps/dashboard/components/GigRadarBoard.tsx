import Link from "next/link";
import type { GigRadar } from "../lib/gigRadar";
import type { GigEvent } from "../lib/gigRadarLogic";

function localDate(value: string): string {
  return new Date(value).toLocaleDateString("en-AU", { timeZone: "Australia/Sydney", weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function localTime(value: string): string {
  return new Date(value).toLocaleString("en-AU", { timeZone: "Australia/Sydney", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

function EventCard({ event, urgent = false }: { event: GigEvent; urgent?: boolean }) {
  const nextSale = [event.publicSaleAt, ...event.presales.map((item) => item.start)].filter((value): value is string => Boolean(value)).sort()[0];
  return (
    <article className={`gig-card${urgent ? " gig-card--urgent" : ""}`}>
      <div className="gig-card__date"><strong>{new Date(event.date).toLocaleDateString("en-AU", { timeZone: "Australia/Sydney", day: "2-digit" })}</strong><span>{new Date(event.date).toLocaleDateString("en-AU", { timeZone: "Australia/Sydney", month: "short" })}</span></div>
      <div className="gig-card__body">
        <p>{event.artistName}</p>
        <h3>{event.name}</h3>
        <span>{event.venue} · {event.city}{event.country ? `, ${event.country}` : ""}</span>
        {nextSale && <small>{urgent ? "Sale opens" : "On sale"} {localTime(nextSale)}</small>}
      </div>
      <a href={event.ticketUrl} target="_blank" rel="noreferrer" aria-label={`View tickets for ${event.name}`}>Tickets ↗</a>
    </article>
  );
}

export function GigRadarBoard({ data }: { data: GigRadar }) {
  const sourceProblems = Object.entries(data.sourceHealth).filter(([, source]) => source.status !== "healthy");
  return (
    <main className="gig-shell">
      <nav className="gig-nav" aria-label="Radar sections"><Link href="/">Training</Link><strong>Gigs</strong></nav>
      <header className="gig-hero">
        <div><p>TomOS / Sydney &amp; NSW live music</p><h1>Gig Radar</h1></div>
        <aside><strong>{data.events.length}</strong><span>upcoming shows</span></aside>
      </header>

      {sourceProblems.length > 0 && (
        <section className="gig-notice" aria-labelledby="gig-setup-title">
          <div><p>Source attention</p><h2 id="gig-setup-title">Some discovery sources need attention.</h2></div>
          <ul>{sourceProblems.map(([name, source]) => <li key={name}><strong>{name}</strong><span>{source.detail}</span></li>)}</ul>
        </section>
      )}

      <section className="gig-stats" aria-label="Gig Radar status">
        <div><span>Artists watched</span><strong>{data.artists.length}</strong></div>
        <div><span>Sales this week</span><strong>{data.saleAlerts.length}</strong></div>
        <div><span>Sources available</span><strong>{Object.values(data.sourceHealth).filter((source) => source.status !== "unavailable").length}/2</strong></div>
        <div><span>Last scan</span><strong>{new Date(data.generatedAt).toLocaleTimeString("en-AU", { timeZone: "Australia/Sydney", hour: "numeric", minute: "2-digit" })}</strong></div>
      </section>

      {data.saleAlerts.length > 0 && <section className="gig-section"><div className="gig-section__heading"><div><p>Act now</p><h2>On sale soon</h2></div><span>Next 7 days</span></div><div className="gig-list">{data.saleAlerts.map((event) => <EventCard event={event} urgent key={event.id} />)}</div></section>}
      <section className="gig-section">
        <div className="gig-section__heading"><div><p>Diary</p><h2>Upcoming shows</h2></div><span>{data.events.length ? `${localDate(data.events[0].date)} onwards` : "Waiting for discoveries"}</span></div>
        {data.events.length ? <div className="gig-list">{data.events.map((event) => <EventCard event={event} key={event.id} />)}</div> : <div className="gig-empty"><span>♪</span><h3>No shows on the radar yet.</h3><p>Once Spotify and Ticketmaster are configured, followed artists and their Sydney and NSW shows will appear here.</p></div>}
      </section>
      <footer className="gig-footer">Updated {localTime(data.generatedAt)} · Australia/Sydney</footer>
    </main>
  );
}
