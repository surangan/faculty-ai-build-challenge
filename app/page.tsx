"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type TrackKey = "teaching" | "research" | "productivity" | "student";
type StrengthKey = "story" | "systems" | "insight";
type DemoStatus = "idle" | "loading" | "ready";

type SprintIdea = {
  name: string;
  promise: string;
  user: string;
  demo: string;
  deliverables: string[];
};

const trackOptions: Array<{ key: TrackKey; label: string; note: string }> = [
  { key: "teaching", label: "Teaching", note: "Make learning clearer" },
  { key: "research", label: "Research", note: "Accelerate discovery" },
  { key: "productivity", label: "Faculty work", note: "Remove busywork" },
  { key: "student", label: "Student life", note: "Improve the journey" },
];

const strengthOptions: Array<{ key: StrengthKey; label: string; note: string }> = [
  { key: "story", label: "Storytellers", note: "Strong pitch and polish" },
  { key: "systems", label: "System builders", note: "Strong workflows" },
  { key: "insight", label: "Domain experts", note: "Strong problem insight" },
];

const ideas: Record<TrackKey, SprintIdea[]> = {
  teaching: [
    {
      name: "Concept Compass",
      promise: "Turn a confusing computing concept into a guided, visual learning path.",
      user: "Students who understand the formula but not the intuition",
      demo: "Choose a concept, reveal a step-by-step explanation, then answer one confidence check.",
      deliverables: ["Concept selector", "Three-step explainer", "Confidence check with feedback"],
    },
    {
      name: "Rubric Ready",
      promise: "Convert a learning objective into a usable assessment rubric in seconds.",
      user: "Faculty creating consistent assessment criteria",
      demo: "Enter one objective and generate a four-level rubric with editable descriptors.",
      deliverables: ["Objective input", "Generated rubric table", "Copy-ready output"],
    },
    {
      name: "Office Hours Zero",
      promise: "Route recurring course questions to the right answer and next action.",
      user: "Students blocked outside scheduled office hours",
      demo: "Ask one course question and receive an answer, source cue, and suggested next step.",
      deliverables: ["Question composer", "Structured response", "Escalation state"],
    },
  ],
  research: [
    {
      name: "LabLens",
      promise: "Turn a paper abstract into a testable experiment outline.",
      user: "Research teams scoping follow-up studies",
      demo: "Paste an abstract and reveal hypotheses, variables, risks, and a first-week plan.",
      deliverables: ["Abstract input", "Experiment canvas", "Risk and assumption callouts"],
    },
    {
      name: "GrantGuard",
      promise: "Stress-test a proposal before it reaches a reviewer.",
      user: "Faculty preparing time-sensitive grant submissions",
      demo: "Paste one project summary and receive three evidence-linked reviewer concerns.",
      deliverables: ["Proposal summary input", "Reviewer scorecard", "Revision checklist"],
    },
    {
      name: "Collab Signal",
      promise: "Reveal complementary research strengths across faculty profiles.",
      user: "Researchers looking for an unexpected collaborator",
      demo: "Select two interests and surface three plausible collaboration themes.",
      deliverables: ["Interest picker", "Match cards", "Collaboration starter brief"],
    },
  ],
  productivity: [
    {
      name: "MinuteMate",
      promise: "Turn messy meeting notes into decisions, owners, and deadlines.",
      user: "Faculty teams leaving meetings without a shared next step",
      demo: "Paste rough notes and generate an editable action board plus follow-up message.",
      deliverables: ["Notes input", "Action board", "Follow-up message"],
    },
    {
      name: "Decision One",
      promise: "Make committee trade-offs visible on a single page.",
      user: "Committees comparing options with competing priorities",
      demo: "Score three options and reveal the recommendation with dissenting signals.",
      deliverables: ["Criteria weights", "Option comparison", "Decision summary"],
    },
    {
      name: "Inbox Triage Lab",
      promise: "Sort an academic inbox by urgency, effort, and impact.",
      user: "Faculty protecting focus time during high-volume weeks",
      demo: "Review a sample inbox and clear the three messages that need attention now.",
      deliverables: ["Demo inbox", "Priority rationale", "Batch action feedback"],
    },
  ],
  student: [
    {
      name: "ModuleMap",
      promise: "Turn interests and goals into an explainable module pathway.",
      user: "Students navigating too many plausible module choices",
      demo: "Choose a goal and constraints, then compare a recommended three-module path.",
      deliverables: ["Goal picker", "Pathway comparison", "Why-this-path explanation"],
    },
    {
      name: "TeamFit",
      promise: "Match project teammates by complementary skills and working style.",
      user: "Students forming teams beyond their immediate friend group",
      demo: "Create a short profile and reveal a balanced demo team with match reasons.",
      deliverables: ["Profile builder", "Team match", "Compatibility cues"],
    },
    {
      name: "First Week",
      promise: "Give every new student a calm, personalised first-week plan.",
      user: "New students overwhelmed by unfamiliar campus routines",
      demo: "Pick three priorities and generate a realistic first-week route and checklist.",
      deliverables: ["Priority picker", "Day-by-day plan", "Progress checklist"],
    },
  ],
};

const strengthOffsets: Record<StrengthKey, number> = { story: 0, systems: 1, insight: 2 };

const showcase = [
  { title: "ModuleMap", team: "Team 04", tag: "Student life", color: "violet", description: "An explainable module pathway planner that balances interests, prerequisites, and workload." },
  { title: "LabLens", team: "Team 11", tag: "Research", color: "cyan", description: "A paper-to-experiment canvas that exposes assumptions before a study begins." },
  { title: "MinuteMate", team: "Team 07", tag: "Faculty work", color: "lime", description: "Meeting notes become decisions, owners, deadlines, and a ready-to-send follow-up." },
  { title: "Concept Compass", team: "Team 02", tag: "Teaching", color: "orange", description: "An interactive explainer for the computing concepts students most often get stuck on." },
  { title: "GrantGuard", team: "Team 15", tag: "Research", color: "pink", description: "A structured pre-review that flags weak evidence, unclear novelty, and hidden feasibility risks." },
  { title: "TeamFit", team: "Team 09", tag: "Student life", color: "blue", description: "A transparent matcher for complementary project skills and compatible working styles." },
];

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function Home() {
  const [track, setTrack] = useState<TrackKey>("teaching");
  const [strength, setStrength] = useState<StrengthKey>("story");
  const [status, setStatus] = useState<DemoStatus>("idle");
  const [variation, setVariation] = useState(0);
  const [copied, setCopied] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(70 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const selectedIdea = useMemo(() => {
    const options = ideas[track];
    return options[(strengthOffsets[strength] + variation) % options.length];
  }, [strength, track, variation]);

  useEffect(() => {
    if (!timerRunning) return;
    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setTimerRunning(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [timerRunning]);

  function generateBrief() {
    setStatus("loading");
    setCopied(false);
    setTimerRunning(false);
    setRemainingSeconds(70 * 60);
    window.setTimeout(() => {
      setStatus("ready");
      window.setTimeout(() => resultRef.current?.focus(), 50);
    }, 650);
  }

  function tryAnother() {
    setVariation((current) => current + 1);
    setStatus("loading");
    setCopied(false);
    setTimerRunning(false);
    setRemainingSeconds(70 * 60);
    window.setTimeout(() => setStatus("ready"), 450);
  }

  function copyBrief() {
    const text = [
      selectedIdea.name,
      selectedIdea.promise,
      `For: ${selectedIdea.user}`,
      `Core demo: ${selectedIdea.demo}`,
      `Ship: ${selectedIdea.deliverables.join("; ")}`,
    ].join("\n");

    const fallbackCopy = () => {
      const field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.left = "-9999px";
      document.body.appendChild(field);
      field.select();
      document.execCommand("copy");
      field.remove();
    };

    try {
      if (navigator.clipboard?.writeText) {
        void navigator.clipboard.writeText(text).catch(fallbackCopy);
      } else {
        fallbackCopy();
      }
    } catch {
      fallbackCopy();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 3500);
  }

  function startSprint() {
    if (remainingSeconds === 0) setRemainingSeconds(70 * 60);
    setTimerRunning(true);
  }

  return (
    <main id="top">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="SprintDeck home">
          <span className="brand-mark" aria-hidden="true">S<span>D</span></span>
          <span className="brand-name">SprintDeck</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#problem">Why</a>
          <a href="#launchpad">Launchpad</a>
          <a href="#impact">Impact</a>
          <a href="#showcase">Showcase</a>
        </nav>
        <a className="button button-small" href="#launchpad">Build my sprint <span aria-hidden="true">↘</span></a>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <div className="eyebrow"><span className="live-dot" aria-hidden="true" /> NUS Computing · Faculty AI Build Challenge</div>
          <h1 id="hero-title">From “what should we build?” to <em>demo-ready</em> in 70 minutes.</h1>
          <p>SprintDeck turns a room full of faculty ideas into focused build briefs, visible momentum, and working prototypes—before the clock runs out.</p>
          <div className="hero-actions">
            <a className="button" href="#launchpad">Create a sprint brief <span aria-hidden="true">→</span></a>
            <a className="text-link" href="#how-it-works">See how it works <span aria-hidden="true">↓</span></a>
          </div>
          <div className="hero-proof" aria-label="Event summary">
            <div><strong>100+</strong><span>faculty builders</span></div>
            <div><strong>70 min</strong><span>focused build time</span></div>
            <div><strong>1 link</strong><span>to demo at the finish</span></div>
          </div>
        </div>

        <div className="hero-console" aria-label="Example sprint status">
          <div className="console-topline">
            <span><i aria-hidden="true" /> Sprint room · Live</span>
            <span>Team 04</span>
          </div>
          <div className="console-time">70:00</div>
          <p>One useful journey. One published link.</p>
          <div className="mission-card">
            <span>Today’s mission</span>
            <strong>Help a student choose a module path they can explain.</strong>
          </div>
          <ol className="console-steps">
            <li className="done"><span>01</span><div><strong>Problem locked</strong><small>3 minutes</small></div><b aria-hidden="true">✓</b></li>
            <li className="active"><span>02</span><div><strong>Core flow</strong><small>Build the happy path</small></div><b aria-hidden="true">↗</b></li>
            <li><span>03</span><div><strong>Demo polish</strong><small>Make the value obvious</small></div><b aria-hidden="true">·</b></li>
          </ol>
        </div>
      </section>

      <section id="problem" className="problem-section section-shell">
        <div className="section-label">The challenge</div>
        <div className="problem-grid">
          <article className="statement statement-dark">
            <span>Without a shared sprint</span>
            <h2>Good ideas lose their first 20 minutes to coordination.</h2>
            <p>Teams debate scope, split attention across too many features, and reach the demo with a promising concept that is hard to show.</p>
          </article>
          <article className="statement statement-light">
            <span>With SprintDeck</span>
            <h2>One sharp promise becomes one working journey.</h2>
            <p>A guided brief aligns the user, problem, interaction, and definition of done—then the sprint clock protects the build.</p>
            <div className="audience-list" aria-label="Target users">
              <span>Faculty builders</span><span>Event facilitators</span><span>Interdisciplinary teams</span>
            </div>
          </article>
        </div>
      </section>

      <section id="launchpad" className="launchpad section-shell" aria-labelledby="launchpad-title">
        <div className="launchpad-heading">
          <div>
            <div className="section-label section-label-accent">Interactive demo</div>
            <h2 id="launchpad-title">Build your sprint brief.</h2>
          </div>
          <p>Pick a problem space and your team’s natural strength. SprintDeck will narrow the scope to something you can actually demonstrate.</p>
        </div>

        <div className="builder-shell">
          <div className="builder-inputs">
            <fieldset>
              <legend><span>01</span> Where should the idea create value?</legend>
              <div className="option-grid">
                {trackOptions.map((option) => (
                  <button
                    type="button"
                    key={option.key}
                    className={`choice-card ${track === option.key ? "selected" : ""}`}
                    onClick={() => { setTrack(option.key); setStatus("idle"); }}
                    aria-pressed={track === option.key}
                  >
                    <strong>{option.label}</strong>
                    <small>{option.note}</small>
                    <b aria-hidden="true">{track === option.key ? "✓" : "→"}</b>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend><span>02</span> What is your team best at?</legend>
              <div className="strength-row">
                {strengthOptions.map((option) => (
                  <button
                    type="button"
                    key={option.key}
                    className={`strength-chip ${strength === option.key ? "selected" : ""}`}
                    onClick={() => { setStrength(option.key); setStatus("idle"); }}
                    aria-pressed={strength === option.key}
                    title={option.note}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <button type="button" className="button generate-button" onClick={generateBrief} disabled={status === "loading"}>
              {status === "loading" ? "Shaping the sprint…" : "Generate focused brief"}
              <span aria-hidden="true">{status === "loading" ? "···" : "↗"}</span>
            </button>
            <p className="form-helper">No account, external API, or project data required.</p>
          </div>

          <div className={`result-panel ${status}`} aria-live="polite" aria-busy={status === "loading"}>
            {status === "idle" && (
              <div className="empty-state">
                <span className="empty-orbit" aria-hidden="true"><i /><i /><b>+</b></span>
                <strong>Your buildable idea will appear here.</strong>
                <p>Two choices in. One focused sprint out.</p>
              </div>
            )}
            {status === "loading" && (
              <div className="loading-state">
                <span className="loading-mark" aria-hidden="true" />
                <strong>Removing everything your demo does not need…</strong>
                <div className="loading-lines" aria-hidden="true"><i /><i /><i /></div>
              </div>
            )}
            {status === "ready" && (
              <div className="brief" ref={resultRef} tabIndex={-1}>
                <div className="brief-topline"><span>Ready to build</span><span>70-minute scope</span></div>
                <h3>{selectedIdea.name}</h3>
                <p className="brief-promise">{selectedIdea.promise}</p>
                <dl>
                  <div><dt>For</dt><dd>{selectedIdea.user}</dd></div>
                  <div><dt>Core demo</dt><dd>{selectedIdea.demo}</dd></div>
                </dl>
                <div className="ship-list">
                  <span>Ship only these</span>
                  {selectedIdea.deliverables.map((item, index) => <p key={item}><b>{index + 1}</b>{item}</p>)}
                </div>
                <div className="brief-actions">
                  <button type="button" className="button" onClick={startSprint}>{timerRunning ? "Sprint running" : "Start 70:00 sprint"}</button>
                  <button type="button" className="button button-quiet" onClick={copyBrief}>{copied ? "Copied ✓" : "Copy brief"}</button>
                  <button type="button" className="inline-button" onClick={tryAnother}>Try another</button>
                </div>
                {(timerRunning || remainingSeconds < 70 * 60) && (
                  <div className="active-timer">
                    <div><span>Build clock</span><strong>{formatTime(remainingSeconds)}</strong></div>
                    <button type="button" onClick={() => setTimerRunning((value) => !value)}>{timerRunning ? "Pause" : remainingSeconds === 0 ? "Finished" : "Resume"}</button>
                    <button type="button" onClick={() => { setTimerRunning(false); setRemainingSeconds(70 * 60); }}>Reset</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="impact" className="impact section-shell" aria-labelledby="impact-title">
        <div className="impact-intro">
          <div className="section-label">Why it matters</div>
          <h2 id="impact-title">Protect the scarce part: shared attention.</h2>
          <p>SprintDeck gives every team the same lightweight operating system, so facilitators can support the room without becoming the room’s bottleneck.</p>
        </div>
        <div className="impact-cards">
          <article><strong>1</strong><span>shared definition of done</span><small>Alignment</small></article>
          <article><strong>70</strong><span>minutes aimed at the core flow</span><small>Focus</small></article>
          <article><strong>2:00</strong><span>maximum end-to-end demo</span><small>Clarity</small></article>
        </div>
      </section>

      <section id="how-it-works" className="how-section section-shell" aria-labelledby="how-title">
        <div className="section-label">How it works</div>
        <h2 id="how-title">A simple path from room energy to a live link.</h2>
        <div className="how-grid">
          <article><span>01</span><div className="step-visual scope" aria-hidden="true"><i /><i /><b>+</b></div><h3>Focus the promise</h3><p>Choose one audience, one real pain point, and the one interaction worth demonstrating.</p></article>
          <article><span>02</span><div className="step-visual build" aria-hidden="true"><i /><i /><i /></div><h3>Build the happy path</h3><p>Use realistic sample data and complete the visible journey before adding anything else.</p></article>
          <article><span>03</span><div className="step-visual ship" aria-hidden="true"><i>↗</i></div><h3>Publish and pitch</h3><p>Share one working link, then show the problem, action, and result in under two minutes.</p></article>
        </div>
      </section>

      <section id="showcase" className="showcase section-shell" aria-labelledby="showcase-title">
        <div className="showcase-heading">
          <div><div className="section-label section-label-accent">Demonstration data</div><h2 id="showcase-title">What teams could ship.</h2></div>
          <p>Illustrative project cards show how a finished gallery can make the room’s work visible without relying on live submissions.</p>
        </div>
        <div className="showcase-grid">
          {showcase.map((project, index) => (
            <article className="project-card" key={project.title}>
              <div className={`project-visual ${project.color}`} aria-hidden="true">
                <span>{String(index + 1).padStart(2, "0")}</span><i /><i /><i /><b>{project.title.slice(0, 2).toUpperCase()}</b>
              </div>
              <div className="project-body">
                <div><span>{project.team}</span><span>{project.tag}</span></div>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="final-cta section-shell">
        <div>
          <span className="eyebrow">Your best idea is small enough to finish.</span>
          <h2>Make the first 70 minutes count.</h2>
        </div>
        <a className="button button-inverse" href="#launchpad">Create your sprint brief <span aria-hidden="true">↑</span></a>
      </section>

      <footer>
        <a className="brand footer-brand" href="#top"><span className="brand-mark" aria-hidden="true">S<span>D</span></span><span className="brand-name">SprintDeck</span></a>
        <p>Built for the NUS Computing Faculty AI Build Challenge.</p>
        <a href="#top">Back to top ↑</a>
      </footer>
    </main>
  );
}
