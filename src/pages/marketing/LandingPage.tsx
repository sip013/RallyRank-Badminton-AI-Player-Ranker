import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import BrandMark from '@/components/BrandMark';

const BRAND = 'RallyRank';

/** Single-layer amber sweep across glyphs (R → K). No stacked overlays. */
const BrandFlash: React.FC<{ className?: string }> = ({ className }) => (
  <p className={`brand-shimmer ${className ?? ''}`}>{BRAND}</p>
);

const ProductPreview: React.FC = () => (
  <div className="landing-preview relative mx-auto w-full max-w-xl md:max-w-none" aria-hidden>
    <div className="product-card relative min-h-[22rem] rounded-2xl md:min-h-[26rem]">
      <div className="product-card__beam-wrap">
        <div className="product-card__beam" />
      </div>
      <div className="product-card__body flex h-full min-h-[22rem] flex-col md:min-h-[26rem]">
        <div
          className="flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: 'rgba(255,255,255,0.12)' }}
        >
          <span className="text-sm font-semibold tracking-wide text-white/75">
            Saturday Smashers · Tonight
          </span>
          <span
            className="rounded-full px-3 py-1 text-xs font-bold"
            style={{ backgroundColor: '#f5a524', color: '#1a1205' }}
          >
            Session live
          </span>
        </div>

        <div className="grid flex-1 gap-0 sm:grid-cols-2">
          <div
            className="border-b p-5 sm:border-b-0 sm:border-r"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/50">
              Court 1 · Team A
            </p>
            <ul className="space-y-3">
              {['Priya · 1184', 'Omar · 1102'].map((row) => (
                <li
                  key={row}
                  className="flex items-center justify-between rounded-lg px-3.5 py-2.5 text-base text-white"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                >
                  {row.split(' · ')[0]}
                  <span className="font-display text-lg tabular-nums text-white/85">
                    {row.split(' · ')[1]}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-white/55">Win chance 52%</p>
          </div>
          <div className="p-5">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/50">
              Court 1 · Team B
            </p>
            <ul className="space-y-3">
              {['Kenji · 1140', 'Aisha · 1098'].map((row) => (
                <li
                  key={row}
                  className="flex items-center justify-between rounded-lg px-3.5 py-2.5 text-base text-white"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                >
                  {row.split(' · ')[0]}
                  <span className="font-display text-lg tabular-nums text-white/85">
                    {row.split(' · ')[1]}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-white/55">Win chance 48%</p>
          </div>
        </div>

        <div
          className="mt-auto border-t px-5 py-4"
          style={{ borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(0,0,0,0.28)' }}
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/50">
            Club ladder
          </p>
          <ol className="space-y-2">
            {[
              { rank: 1, name: 'Priya', rating: 1184 },
              { rank: 2, name: 'Kenji', rating: 1140 },
              { rank: 3, name: 'Omar', rating: 1102 },
            ].map((p) => (
              <li key={p.rank} className="flex items-center gap-3 text-base text-white">
                <span className="w-5 font-display text-white/45">{p.rank}</span>
                <span className="flex-1 font-medium">{p.name}</span>
                <span className="font-display text-lg tabular-nums">{p.rating}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  </div>
);

const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const primaryTo = user ? '/onboarding' : '/auth?mode=signup';
  const signInTo = user ? '/app' : '/auth';

  return (
    <div className="min-h-screen bg-[#f4f6f3] text-[#142019]">
      <section
        className="relative overflow-hidden"
        style={{
          background:
            'linear-gradient(155deg, #0c241a 0%, #165a3d 48%, #1f6b4a 100%)',
        }}
      >
        <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
          <div className="group flex items-center gap-2.5">
            <BrandMark mood="landing" inverted className="h-8 w-8" />
            <span className="font-display text-lg font-bold text-white">RallyRank</span>
          </div>
          <Link
            to={signInTo}
            className="cta-link text-sm font-semibold text-white/85 hover:text-white"
          >
            {user ? 'Open app' : 'Sign in'}
          </Link>
        </header>

        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-6 pb-14 pt-4 md:grid-cols-2 md:gap-12 md:px-10 md:pb-20 md:pt-8 lg:gap-16">
          <div className="max-w-xl">
            <BrandFlash className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl lg:text-[3.25rem] lg:leading-[1.05]" />
            <h1 className="mt-3 max-w-[20ch] font-display text-xl font-bold leading-snug tracking-tight text-white sm:text-2xl md:mt-4 md:text-[1.75rem] lg:text-[2rem]">
              Run fair badminton nights without the group-chat chaos.
            </h1>
            <p className="mt-3 max-w-[36ch] text-[15px] leading-relaxed text-white/90 sm:mt-4 sm:text-base md:text-lg">
              Pick who’s playing, get balanced teams, log scores, and keep a ranking
              your club actually trusts.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to={primaryTo} className="cta-amber">
                Start free club
              </Link>
              <Link to="/auth" className="cta-outline-light">
                I have an invite
              </Link>
            </div>
          </div>

          <div className="md:justify-self-stretch lg:justify-self-end lg:w-full">
            <ProductPreview />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-24">
        <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          From warm-up to ranked in three steps
        </h2>
        <p className="mt-3 max-w-xl text-lg text-[#3d5246]">
          Built for recreational badminton clubs that play every week.
        </p>

        <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {[
            {
              n: '01',
              title: 'Add your club',
              body: 'Invite coaches, build a roster, and stop tracking names in notes apps.',
            },
            {
              n: '02',
              title: 'Balance the night',
              body: 'Select who’s at the hall. RallyRank splits fair teams by rating so games stay competitive.',
            },
            {
              n: '03',
              title: 'Log and climb',
              body: 'Enter the score once. Rankings update automatically — no spreadsheet math.',
            },
          ].map((step) => (
            <li key={step.n} className="border-t-2 border-[#1f6b4a] pt-5">
              <span className="font-display text-sm font-bold tracking-widest text-[#c47a0a]">
                {step.n}
              </span>
              <h3 className="mt-2 font-display text-xl font-bold">{step.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[#3d5246]">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-[#d5ddd7] bg-[#eef2ee]">
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-24">
          <h2 className="max-w-[20ch] font-display text-3xl font-bold tracking-tight md:text-4xl">
            Spreadsheets forget. WhatsApp threads argue. RallyRank settles it.
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[#3d5246]">
            One shared club space for attendance, fair matchups, match history, and a
            public ladder you can share with members — without asking someone to
            “update the sheet later.”
          </p>
          <Link to={primaryTo} className="cta-court mt-8">
            Create your club
          </Link>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 md:flex-row md:items-center md:justify-between md:px-10">
        <div className="group flex items-center gap-2">
          <BrandMark mood="footer" className="h-6 w-6" />
          <span className="font-display font-bold">RallyRank</span>
          <span className="text-sm text-[#5a6b61]">· Badminton club ladders</span>
        </div>
        <p className="text-sm text-[#5a6b61]">Fair teams. Clear rankings. Every club night.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
