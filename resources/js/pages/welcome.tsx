import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { dashboard } from '@/routes';

const NAV_LINKS = [
    { href: '#platform', label: 'Platform' },
    { href: '#how', label: 'How it works' },
    { href: '#results', label: 'Results' },
    { href: '#faq', label: 'FAQ' },
    { href: '#legal', label: 'Legal' },
];

const STATS = [
    { value: '140,000', label: 'Active accounts' },
    { value: '52ms', label: 'Median signal latency' },
    { value: '24/7', label: 'Market monitoring' },
];

const PLATFORM_FEATURES = [
    {
        icon: '⚙️',
        title: 'Quantum-inspired optimization',
        body: 'Portfolio and entry/exit decisions are computed across thousands of simulated states in parallel, narrowing to the paths with the strongest risk-adjusted edge.',
    },
    {
        icon: '📈',
        title: 'Adaptive signal models',
        body: 'Models retrain on rolling windows of price action, order flow, and volatility regimes, so strategies shift as market conditions actually shift.',
    },
    {
        icon: '📊',
        title: 'Layered risk containment',
        body: "Position sizing, drawdown limits, and correlation checks run before every trade — not as an afterthought, but as a hard gate the engine can't bypass.",
    },
    {
        icon: '⚡',
        title: 'Low-latency execution',
        body: 'Orders route to liquidity venues in milliseconds, so the strategy you approved is the strategy that actually gets filled.',
    },
    {
        icon: '🖥️',
        title: 'Real-time dashboard',
        body: "Every position, signal, and risk check is visible as it happens — nothing about the engine's reasoning is hidden from you.",
    },
    {
        icon: '🔒',
        title: 'Segregated custody',
        body: 'Funds are held with regulated custodians, separate from operating accounts, with full audit trails on every movement.',
    },
];

const PROCESS_STEPS = [
    {
        title: 'Verify your account',
        body: 'Create your profile and confirm your identity. Standard KYC checks keep the platform compliant and your funds protected.',
    },
    {
        title: 'Set your boundaries',
        body: 'Choose your markets, define exposure limits, and pick a volatility tolerance. These become hard constraints for the engine.',
    },
    {
        title: 'Fund your account',
        body: 'Deposit via bank transfer or supported digital assets. Funds are held in segregated accounts with regulated custodians.',
    },
    {
        title: 'Let the engine work',
        body: 'The model begins scanning, sizing, and executing within your rules. Track every decision from your dashboard in real time.',
    },
];

const TESTIMONIALS = [
    {
        quote: "The risk containment layer is what sold me. I can see exactly why the engine sized a position the way it did, every single time.",
        name: 'Renata M.',
        role: 'Independent trader, 3 years',
        initials: 'RM',
    },
    {
        quote: 'Switching from manual charting to letting the engine handle sizing cut my worst drawdowns in half without me changing my strategy.',
        name: 'Diego S.',
        role: 'Part-time trader, 1 year',
        initials: 'DS',
    },
    {
        quote: 'What I like is the dashboard — every trade shows the reasoning behind it, not just the result.',
        name: 'Amara K.',
        role: 'Active trader, 2 years',
        initials: 'AK',
    },
    {
        quote: 'Setup took minutes and the boundaries I set actually hold. It behaves the way I configured it, every time.',
        name: 'Jonah P.',
        role: 'New trader, 6 months',
        initials: 'JP',
    },
];

const FAQS = [
    {
        q: 'What is the minimum deposit?',
        a: 'Minimum deposits vary by account tier and funding method. Bank transfers and supported digital assets each have their own thresholds, shown before you confirm funding.',
    },
    {
        q: 'Can I withdraw funds at any time?',
        a: 'Yes. Withdrawal requests are processed to your verified account or wallet, subject to standard security checks and any open positions.',
    },
    {
        q: 'Do I need trading experience to start?',
        a: 'No. You set your boundaries — markets, exposure limits, and volatility tolerance — and the engine operates within them. Experienced traders can configure more advanced constraints.',
    },
    {
        q: 'How is my data protected?',
        a: 'Data is encrypted in transit and at rest, access is role-restricted, and information is never sold to third parties.',
    },
    {
        q: 'Is Nullypto available in my country?',
        a: "Availability depends on local regulation. Enter your details during sign-up and we'll confirm eligibility for your region.",
    },
];

function RiskWarningBar({ onDismiss }: { onDismiss: () => void }) {
    return (
        <div className="nullypto-risk-bar">
            <span>
                <b>Risk warning:</b> Trading CFDs and digital assets carries a
                high level of risk and may not be suitable for all investors.
                Past performance is not indicative of future results. You
                could lose more than your initial investment.
            </span>
            <button type="button" onClick={onDismiss} aria-label="Dismiss risk warning">
                ✕
            </button>
        </div>
    );
}

function SiteHeader({ showDashboardLink }: { showDashboardLink: boolean }) {
    return (
        <header>
            <nav className="nullypto-topnav nullypto-wrap">
                <a className="nullypto-brand" href="#top">
                    Nullypto
                </a>
                <div className="nullypto-navlinks">
                    {NAV_LINKS.map((link) => (
                        <a key={link.href} href={link.href}>
                            {link.label}
                        </a>
                    ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {showDashboardLink && (
                        <Link href={dashboard()} className="nullypto-dashboard-link">
                            Dashboard
                        </Link>
                    )}
                    <select className="nullypto-lang" defaultValue="English">
                        <option>English</option>
                        <option>Español</option>
                        <option>Filipino</option>
                    </select>
                </div>
            </nav>
        </header>
    );
}

function OrbitDecoration() {
    return (
        <svg className="nullypto-hero-orbit" viewBox="0 0 600 600" aria-hidden="true">
            <defs>
                <linearGradient
                    id="nullyptoOrbitGrad"
                    x1="0"
                    y1="0"
                    x2="600"
                    y2="600"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0" stopColor="#C4FF48" stopOpacity="0.5" />
                    <stop offset="1" stopColor="#3DE0C9" stopOpacity="0.15" />
                </linearGradient>
            </defs>
            <circle
                cx="300"
                cy="300"
                r="260"
                fill="none"
                stroke="url(#nullyptoOrbitGrad)"
                strokeWidth="1"
                strokeDasharray="2 10"
            />
            <circle
                cx="300"
                cy="300"
                r="190"
                fill="none"
                stroke="url(#nullyptoOrbitGrad)"
                strokeWidth="1"
                strokeDasharray="1 8"
            />
            <circle
                cx="300"
                cy="300"
                r="120"
                fill="none"
                stroke="url(#nullyptoOrbitGrad)"
                strokeWidth="1"
            />
            <g className="nullypto-hero-node">
                <circle cx="300" cy="40" r="6" fill="#C4FF48" />
            </g>
            <g className="nullypto-hero-node nullypto-hero-node-slow">
                <circle cx="300" cy="110" r="4" fill="#3DE0C9" />
            </g>
        </svg>
    );
}

function SignupForm() {
    return (
        <form
            className="nullypto-signup-card"
            onSubmit={(event) => {
                event.preventDefault();
                alert('Demo form — connect this to your signup backend.');
            }}
        >
            <h2>Sign up now</h2>
            <p>Start your AI trading journey in less than 30 seconds</p>
            <div className="nullypto-field">
                <label>First Name</label>
                <input type="text" placeholder="Enter your first name" required />
            </div>
            <div className="nullypto-field">
                <label>Last Name</label>
                <input type="text" placeholder="Enter your last name" required />
            </div>
            <div className="nullypto-field">
                <label>Email Address</label>
                <input type="email" placeholder="your@email.com" required />
            </div>
            <div className="nullypto-field">
                <label>Phone Number</label>
                <div className="nullypto-phone-row">
                    <select>
                        <option>🇵🇭 +63</option>
                        <option>🇺🇸 +1</option>
                        <option>🇸🇬 +65</option>
                        <option>🇬🇧 +44</option>
                    </select>
                    <input
                        type="tel"
                        placeholder="905 123 4567"
                        required
                        style={{ flex: 1 }}
                    />
                </div>
            </div>
            <label className="nullypto-terms-row">
                <input type="checkbox" required style={{ marginTop: 2 }} />
                <span>
                    I agree to the <a href="#legal">Terms &amp; Conditions</a>{' '}
                    and <a href="#legal">Privacy Policy</a>
                </span>
            </label>
            <button className="nullypto-submit-btn" type="submit">
                Start Trading with AI
            </button>
            <div className="nullypto-signup-footnote">
                <span>✓ 109 users joined today</span>
                <span>✓ Withdraw anytime</span>
                <span>✓ Secure &amp; encrypted</span>
            </div>
        </form>
    );
}

function Hero() {
    return (
        <section className="nullypto-hero" id="top">
            <div className="nullypto-wrap nullypto-hero-grid">
                <div>
                    <span className="nullypto-badge">
                        Quantum-inspired market intelligence
                    </span>
                    <h1>
                        Markets move in probabilities.{' '}
                        <span className="nullypto-accent">So does our engine.</span>
                    </h1>
                    <p className="nullypto-lead">
                        Nullypto runs adaptive AI models — built on
                        quantum-inspired optimization — that continuously
                        re-weigh thousands of market scenarios and act on the
                        ones that matter. You set the boundaries. The engine
                        handles the noise.
                    </p>
                    <div className="nullypto-btn-row">
                        <button className="nullypto-btn nullypto-btn-primary">
                            Start free assessment
                        </button>
                        <button className="nullypto-btn nullypto-btn-outline">
                            See how it works
                        </button>
                    </div>
                    <div className="nullypto-stat-row">
                        {STATS.map((stat) => (
                            <div className="nullypto-stat" key={stat.label}>
                                <h3>{stat.value}</h3>
                                <span>{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="nullypto-hero-orbit-wrap">
                    <OrbitDecoration />
                    <SignupForm />
                </div>
            </div>
        </section>
    );
}

function PlatformSection() {
    return (
        <section className="nullypto-platform" id="platform">
            <div className="nullypto-wrap">
                <div className="nullypto-section-head">
                    <span className="nullypto-badge">The platform</span>
                    <h2>
                        Every module built to remove a specific kind of
                        guesswork
                    </h2>
                    <p>
                        Six systems working together, from signal generation
                        to execution to risk containment.
                    </p>
                </div>
                <div className="nullypto-card-grid">
                    {PLATFORM_FEATURES.map((feature) => (
                        <div className="nullypto-p-card" key={feature.title}>
                            <div className="nullypto-icon-box">{feature.icon}</div>
                            <h3>{feature.title}</h3>
                            <p>{feature.body}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function ProcessSection() {
    return (
        <section className="nullypto-process" id="how">
            <div className="nullypto-wrap">
                <div className="nullypto-section-head">
                    <span className="nullypto-badge nullypto-badge-dark">
                        Process
                    </span>
                    <h2>From account to first allocation in four steps</h2>
                </div>
                <div className="nullypto-step-grid">
                    {PROCESS_STEPS.map((step, index) => (
                        <div className="nullypto-step-card" key={step.title}>
                            <div className="nullypto-step-num">{index + 1}</div>
                            <h3>{step.title}</h3>
                            <p>{step.body}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function ResultsSection() {
    const [index, setIndex] = useState(0);
    const testimonial = TESTIMONIALS[index];

    return (
        <section className="nullypto-results" id="results">
            <div className="nullypto-wrap">
                <div className="nullypto-section-head">
                    <span className="nullypto-badge">Trader results</span>
                    <h2>What people building with Nullypto are saying</h2>
                </div>
                <div>
                    <div className="nullypto-testi">
                        <p>&ldquo;{testimonial.quote}&rdquo;</p>
                        <div className="nullypto-avatar-row">
                            <div className="nullypto-avatar">
                                {testimonial.initials}
                            </div>
                            <div className="nullypto-who">
                                <b>{testimonial.name}</b>
                                <span>{testimonial.role}</span>
                            </div>
                        </div>
                    </div>
                    <div className="nullypto-dots">
                        {TESTIMONIALS.map((item, i) => (
                            <button
                                key={item.name}
                                type="button"
                                aria-label={`Show testimonial from ${item.name}`}
                                className={i === index ? 'nullypto-active' : undefined}
                                onClick={() => setIndex(i)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function FaqSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section className="nullypto-faq" id="faq">
            <div className="nullypto-wrap">
                <div className="nullypto-section-head">
                    <span className="nullypto-badge">Questions</span>
                    <h2>Frequently asked questions</h2>
                </div>
                <div>
                    {FAQS.map((item, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <div
                                key={item.q}
                                className={`nullypto-faq-item ${isOpen ? 'nullypto-open' : ''}`}
                            >
                                <button
                                    type="button"
                                    className="nullypto-faq-q"
                                    onClick={() =>
                                        setOpenIndex(isOpen ? null : index)
                                    }
                                >
                                    <span>{item.q}</span>
                                    <span className="nullypto-plus">+</span>
                                </button>
                                <div className="nullypto-faq-a">
                                    <div className="nullypto-faq-a-inner">
                                        <p>{item.a}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

function LegalSection() {
    return (
        <section className="nullypto-legal" id="legal">
            <div className="nullypto-wrap">
                <div className="nullypto-section-head">
                    <span className="nullypto-badge nullypto-badge-dark">
                        Legal
                    </span>
                    <h2>Risk disclosure, terms &amp; privacy</h2>
                </div>
                <div className="nullypto-legal-grid">
                    <div className="nullypto-legal-card">
                        <h3>Risk disclosure</h3>
                        <p>
                            Trading digital assets, CFDs, and other leveraged
                            instruments carries a high degree of risk and is
                            not appropriate for all investors. Prices can move
                            rapidly against your position, and automated
                            strategies can amplify both gains and losses.
                            Nullypto does not guarantee returns of any kind,
                            and no communication from us should be interpreted
                            as investment advice. Only trade with capital you
                            can afford to lose, and consider seeking
                            independent financial advice before opening an
                            account.
                        </p>
                    </div>
                    <div className="nullypto-legal-card">
                        <h3>Terms of service</h3>
                        <p>
                            By creating a Nullypto account you agree to use
                            the platform in accordance with applicable law and
                            our published account rules, including limits on
                            strategy configuration, withdrawal timelines, and
                            acceptable use of the API and dashboard. Full
                            terms, including account eligibility, fee
                            schedules, and dispute resolution procedures, are
                            provided during onboarding and are binding once
                            your account is activated.
                        </p>
                    </div>
                    <div className="nullypto-legal-card">
                        <h3>Privacy policy</h3>
                        <p>
                            We collect only the information required to
                            verify your identity, operate your account, and
                            meet regulatory obligations. Data is encrypted in
                            transit and at rest, and is never sold to third
                            parties. You can request a copy of your data or
                            ask us to delete it, subject to the retention
                            periods required by financial regulation.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

function SiteFooter() {
    return (
        <footer>
            <div className="nullypto-wrap">
                <div className="nullypto-foot-grid">
                    <div className="nullypto-foot-brand">
                        <a className="nullypto-brand" href="#top">
                            Nullypto
                        </a>
                        <p>
                            Quantum-inspired AI trading infrastructure for
                            people who want to see the reasoning, not just the
                            result.
                        </p>
                        <div className="nullypto-social">
                            <a href="#" aria-label="X">
                                𝕏
                            </a>
                            <a href="#" aria-label="LinkedIn">
                                in
                            </a>
                            <a href="#" aria-label="Telegram">
                                ✈
                            </a>
                        </div>
                    </div>
                    <div className="nullypto-foot-col">
                        <h4>PLATFORM</h4>
                        <a href="#platform">Features</a>
                        <a href="#how">How it works</a>
                        <a href="#results">Results</a>
                        <a href="#">Open account</a>
                    </div>
                    <div className="nullypto-foot-col">
                        <h4>COMPANY</h4>
                        <a href="#faq">FAQ</a>
                        <a href="#legal">Risk disclosure</a>
                        <a href="#legal">Terms of service</a>
                        <a href="#legal">Privacy policy</a>
                    </div>
                    <div className="nullypto-foot-col">
                        <h4>CONTACT</h4>
                        <a href="mailto:support@nullyptoai.com">
                            support@nullyptoai.com
                        </a>
                        <span
                            style={{
                                display: 'block',
                                color: '#78877f',
                                fontSize: '14.5px',
                            }}
                        >
                            Support available 24/5
                        </span>
                    </div>
                </div>
                <div className="nullypto-foot-bottom">
                    <span>
                        © {new Date().getFullYear()} Nullypto. All rights
                        reserved.
                    </span>
                    <span>
                        Nullypto does not provide investment advice. Trading
                        involves risk of loss.
                    </span>
                </div>
            </div>
        </footer>
    );
}

export default function Welcome() {
    const { auth } = usePage().props;
    const [showRiskWarning, setShowRiskWarning] = useState(true);

    return (
        <>
            <Head title="Nullypto — Quantum-Accelerated AI Trading" />
            <div className="nullypto-page">
                {showRiskWarning && (
                    <RiskWarningBar onDismiss={() => setShowRiskWarning(false)} />
                )}
                <SiteHeader showDashboardLink={!!auth.user} />
                <Hero />
                <PlatformSection />
                <ProcessSection />
                <ResultsSection />
                <FaqSection />
                <LegalSection />
                <SiteFooter />
            </div>
        </>
    );
}
