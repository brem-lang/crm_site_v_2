import { dashboard } from "@/routes";
import { Head, Link, usePage } from "@inertiajs/react";
import { Atom, BarChart3, Lock, Monitor, TrendingUp, Zap } from "lucide-react";
import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import {
    getTranslation,
    LANGUAGE_OPTIONS,
    type LanguageCode,
    type Translation,
} from "./welcome-translations";

const COUNTRIES: { name: string; code: string; dial: string }[] = [
    { name: "Afghanistan", code: "AF", dial: "+93" },
    { name: "Albania", code: "AL", dial: "+355" },
    { name: "Algeria", code: "DZ", dial: "+213" },
    { name: "Andorra", code: "AD", dial: "+376" },
    { name: "Angola", code: "AO", dial: "+244" },
    { name: "Argentina", code: "AR", dial: "+54" },
    { name: "Armenia", code: "AM", dial: "+374" },
    { name: "Australia", code: "AU", dial: "+61" },
    { name: "Austria", code: "AT", dial: "+43" },
    { name: "Azerbaijan", code: "AZ", dial: "+994" },
    { name: "Bahamas", code: "BS", dial: "+1" },
    { name: "Bahrain", code: "BH", dial: "+973" },
    { name: "Bangladesh", code: "BD", dial: "+880" },
    { name: "Barbados", code: "BB", dial: "+1" },
    { name: "Belarus", code: "BY", dial: "+375" },
    { name: "Belgium", code: "BE", dial: "+32" },
    { name: "Belize", code: "BZ", dial: "+501" },
    { name: "Benin", code: "BJ", dial: "+229" },
    { name: "Bhutan", code: "BT", dial: "+975" },
    { name: "Bolivia", code: "BO", dial: "+591" },
    { name: "Bosnia and Herzegovina", code: "BA", dial: "+387" },
    { name: "Botswana", code: "BW", dial: "+267" },
    { name: "Brazil", code: "BR", dial: "+55" },
    { name: "Brunei", code: "BN", dial: "+673" },
    { name: "Bulgaria", code: "BG", dial: "+359" },
    { name: "Burkina Faso", code: "BF", dial: "+226" },
    { name: "Burundi", code: "BI", dial: "+257" },
    { name: "Cambodia", code: "KH", dial: "+855" },
    { name: "Cameroon", code: "CM", dial: "+237" },
    { name: "Canada", code: "CA", dial: "+1" },
    { name: "Cape Verde", code: "CV", dial: "+238" },
    { name: "Central African Republic", code: "CF", dial: "+236" },
    { name: "Chad", code: "TD", dial: "+235" },
    { name: "Chile", code: "CL", dial: "+56" },
    { name: "China", code: "CN", dial: "+86" },
    { name: "Colombia", code: "CO", dial: "+57" },
    { name: "Comoros", code: "KM", dial: "+269" },
    { name: "Congo (DRC)", code: "CD", dial: "+243" },
    { name: "Congo (Republic)", code: "CG", dial: "+242" },
    { name: "Costa Rica", code: "CR", dial: "+506" },
    { name: "Côte d'Ivoire", code: "CI", dial: "+225" },
    { name: "Croatia", code: "HR", dial: "+385" },
    { name: "Cuba", code: "CU", dial: "+53" },
    { name: "Cyprus", code: "CY", dial: "+357" },
    { name: "Czech Republic", code: "CZ", dial: "+420" },
    { name: "Denmark", code: "DK", dial: "+45" },
    { name: "Djibouti", code: "DJ", dial: "+253" },
    { name: "Dominica", code: "DM", dial: "+1" },
    { name: "Dominican Republic", code: "DO", dial: "+1" },
    { name: "Ecuador", code: "EC", dial: "+593" },
    { name: "Egypt", code: "EG", dial: "+20" },
    { name: "El Salvador", code: "SV", dial: "+503" },
    { name: "Equatorial Guinea", code: "GQ", dial: "+240" },
    { name: "Eritrea", code: "ER", dial: "+291" },
    { name: "Estonia", code: "EE", dial: "+372" },
    { name: "Eswatini", code: "SZ", dial: "+268" },
    { name: "Ethiopia", code: "ET", dial: "+251" },
    { name: "Fiji", code: "FJ", dial: "+679" },
    { name: "Finland", code: "FI", dial: "+358" },
    { name: "France", code: "FR", dial: "+33" },
    { name: "Gabon", code: "GA", dial: "+241" },
    { name: "Gambia", code: "GM", dial: "+220" },
    { name: "Georgia", code: "GE", dial: "+995" },
    { name: "Germany", code: "DE", dial: "+49" },
    { name: "Ghana", code: "GH", dial: "+233" },
    { name: "Greece", code: "GR", dial: "+30" },
    { name: "Grenada", code: "GD", dial: "+1" },
    { name: "Guatemala", code: "GT", dial: "+502" },
    { name: "Guinea", code: "GN", dial: "+224" },
    { name: "Guinea-Bissau", code: "GW", dial: "+245" },
    { name: "Guyana", code: "GY", dial: "+592" },
    { name: "Haiti", code: "HT", dial: "+509" },
    { name: "Honduras", code: "HN", dial: "+504" },
    { name: "Hong Kong", code: "HK", dial: "+852" },
    { name: "Hungary", code: "HU", dial: "+36" },
    { name: "Iceland", code: "IS", dial: "+354" },
    { name: "India", code: "IN", dial: "+91" },
    { name: "Indonesia", code: "ID", dial: "+62" },
    { name: "Iran", code: "IR", dial: "+98" },
    { name: "Iraq", code: "IQ", dial: "+964" },
    { name: "Ireland", code: "IE", dial: "+353" },
    { name: "Israel", code: "IL", dial: "+972" },
    { name: "Italy", code: "IT", dial: "+39" },
    { name: "Jamaica", code: "JM", dial: "+1" },
    { name: "Japan", code: "JP", dial: "+81" },
    { name: "Jordan", code: "JO", dial: "+962" },
    { name: "Kazakhstan", code: "KZ", dial: "+7" },
    { name: "Kenya", code: "KE", dial: "+254" },
    { name: "Kiribati", code: "KI", dial: "+686" },
    { name: "Kuwait", code: "KW", dial: "+965" },
    { name: "Kyrgyzstan", code: "KG", dial: "+996" },
    { name: "Laos", code: "LA", dial: "+856" },
    { name: "Latvia", code: "LV", dial: "+371" },
    { name: "Lebanon", code: "LB", dial: "+961" },
    { name: "Lesotho", code: "LS", dial: "+266" },
    { name: "Liberia", code: "LR", dial: "+231" },
    { name: "Libya", code: "LY", dial: "+218" },
    { name: "Liechtenstein", code: "LI", dial: "+423" },
    { name: "Lithuania", code: "LT", dial: "+370" },
    { name: "Luxembourg", code: "LU", dial: "+352" },
    { name: "Macau", code: "MO", dial: "+853" },
    { name: "Madagascar", code: "MG", dial: "+261" },
    { name: "Malawi", code: "MW", dial: "+265" },
    { name: "Malaysia", code: "MY", dial: "+60" },
    { name: "Maldives", code: "MV", dial: "+960" },
    { name: "Mali", code: "ML", dial: "+223" },
    { name: "Malta", code: "MT", dial: "+356" },
    { name: "Marshall Islands", code: "MH", dial: "+692" },
    { name: "Mauritania", code: "MR", dial: "+222" },
    { name: "Mauritius", code: "MU", dial: "+230" },
    { name: "Mexico", code: "MX", dial: "+52" },
    { name: "Micronesia", code: "FM", dial: "+691" },
    { name: "Moldova", code: "MD", dial: "+373" },
    { name: "Monaco", code: "MC", dial: "+377" },
    { name: "Mongolia", code: "MN", dial: "+976" },
    { name: "Montenegro", code: "ME", dial: "+382" },
    { name: "Morocco", code: "MA", dial: "+212" },
    { name: "Mozambique", code: "MZ", dial: "+258" },
    { name: "Myanmar", code: "MM", dial: "+95" },
    { name: "Namibia", code: "NA", dial: "+264" },
    { name: "Nauru", code: "NR", dial: "+674" },
    { name: "Nepal", code: "NP", dial: "+977" },
    { name: "Netherlands", code: "NL", dial: "+31" },
    { name: "New Zealand", code: "NZ", dial: "+64" },
    { name: "Nicaragua", code: "NI", dial: "+505" },
    { name: "Niger", code: "NE", dial: "+227" },
    { name: "Nigeria", code: "NG", dial: "+234" },
    { name: "North Korea", code: "KP", dial: "+850" },
    { name: "North Macedonia", code: "MK", dial: "+389" },
    { name: "Norway", code: "NO", dial: "+47" },
    { name: "Oman", code: "OM", dial: "+968" },
    { name: "Pakistan", code: "PK", dial: "+92" },
    { name: "Palau", code: "PW", dial: "+680" },
    { name: "Palestine", code: "PS", dial: "+970" },
    { name: "Panama", code: "PA", dial: "+507" },
    { name: "Papua New Guinea", code: "PG", dial: "+675" },
    { name: "Paraguay", code: "PY", dial: "+595" },
    { name: "Peru", code: "PE", dial: "+51" },
    { name: "Philippines", code: "PH", dial: "+63" },
    { name: "Poland", code: "PL", dial: "+48" },
    { name: "Portugal", code: "PT", dial: "+351" },
    { name: "Qatar", code: "QA", dial: "+974" },
    { name: "Romania", code: "RO", dial: "+40" },
    { name: "Russia", code: "RU", dial: "+7" },
    { name: "Rwanda", code: "RW", dial: "+250" },
    { name: "Saint Kitts and Nevis", code: "KN", dial: "+1" },
    { name: "Saint Lucia", code: "LC", dial: "+1" },
    { name: "Saint Vincent and the Grenadines", code: "VC", dial: "+1" },
    { name: "Samoa", code: "WS", dial: "+685" },
    { name: "San Marino", code: "SM", dial: "+378" },
    { name: "Sao Tome and Principe", code: "ST", dial: "+239" },
    { name: "Saudi Arabia", code: "SA", dial: "+966" },
    { name: "Senegal", code: "SN", dial: "+221" },
    { name: "Serbia", code: "RS", dial: "+381" },
    { name: "Seychelles", code: "SC", dial: "+248" },
    { name: "Sierra Leone", code: "SL", dial: "+232" },
    { name: "Singapore", code: "SG", dial: "+65" },
    { name: "Slovakia", code: "SK", dial: "+421" },
    { name: "Slovenia", code: "SI", dial: "+386" },
    { name: "Solomon Islands", code: "SB", dial: "+677" },
    { name: "Somalia", code: "SO", dial: "+252" },
    { name: "South Africa", code: "ZA", dial: "+27" },
    { name: "South Korea", code: "KR", dial: "+82" },
    { name: "South Sudan", code: "SS", dial: "+211" },
    { name: "Spain", code: "ES", dial: "+34" },
    { name: "Sri Lanka", code: "LK", dial: "+94" },
    { name: "Sudan", code: "SD", dial: "+249" },
    { name: "Suriname", code: "SR", dial: "+597" },
    { name: "Sweden", code: "SE", dial: "+46" },
    { name: "Switzerland", code: "CH", dial: "+41" },
    { name: "Syria", code: "SY", dial: "+963" },
    { name: "Taiwan", code: "TW", dial: "+886" },
    { name: "Tajikistan", code: "TJ", dial: "+992" },
    { name: "Tanzania", code: "TZ", dial: "+255" },
    { name: "Thailand", code: "TH", dial: "+66" },
    { name: "Timor-Leste", code: "TL", dial: "+670" },
    { name: "Togo", code: "TG", dial: "+228" },
    { name: "Tonga", code: "TO", dial: "+676" },
    { name: "Trinidad and Tobago", code: "TT", dial: "+1" },
    { name: "Tunisia", code: "TN", dial: "+216" },
    { name: "Turkey", code: "TR", dial: "+90" },
    { name: "Turkmenistan", code: "TM", dial: "+993" },
    { name: "Tuvalu", code: "TV", dial: "+688" },
    { name: "Uganda", code: "UG", dial: "+256" },
    { name: "Ukraine", code: "UA", dial: "+380" },
    { name: "United Arab Emirates", code: "AE", dial: "+971" },
    { name: "United Kingdom", code: "GB", dial: "+44" },
    { name: "United States", code: "US", dial: "+1" },
    { name: "Uruguay", code: "UY", dial: "+598" },
    { name: "Uzbekistan", code: "UZ", dial: "+998" },
    { name: "Vanuatu", code: "VU", dial: "+678" },
    { name: "Vatican City", code: "VA", dial: "+379" },
    { name: "Venezuela", code: "VE", dial: "+58" },
    { name: "Vietnam", code: "VN", dial: "+84" },
    { name: "Yemen", code: "YE", dial: "+967" },
    { name: "Zambia", code: "ZM", dial: "+260" },
    { name: "Zimbabwe", code: "ZW", dial: "+263" },
];

/**
 * Expected national-number digit length [min, max] (i.e. excluding the
 * country dial code) for the countries people are most likely to sign up
 * from. Anything not listed falls back to the ITU-recommended general
 * range of 7–12 digits — this isn't a full per-country numbering-plan
 * database, just enough to catch obviously wrong phone numbers.
 */
const PHONE_LENGTH_BY_COUNTRY: Record<string, [number, number]> = {
    PH: [10, 10],
    US: [10, 10],
    CA: [10, 10],
    GB: [10, 10],
    AU: [9, 9],
    SG: [8, 8],
    IN: [10, 10],
    DE: [10, 11],
    FR: [9, 9],
    JP: [10, 10],
    CN: [11, 11],
    BR: [10, 11],
    MX: [10, 10],
    ID: [9, 12],
    VN: [9, 10],
    TH: [9, 9],
    MY: [9, 10],
    NZ: [8, 10],
    ZA: [9, 9],
    AE: [9, 9],
    SA: [9, 9],
    KR: [9, 10],
    IT: [9, 10],
    ES: [9, 9],
    NL: [9, 9],
    HK: [8, 8],
};

const DEFAULT_PHONE_LENGTH: [number, number] = [7, 12];

/** Example national-number formatting per country, shown as the phone
 * input's placeholder so it updates to match whichever country is selected. */
const PHONE_PLACEHOLDER_BY_COUNTRY: Record<string, string> = {
    PH: "905 123 4567",
    US: "(415) 555 2671",
    CA: "(416) 555 0199",
    GB: "7911 123456",
    AU: "412 345 678",
    SG: "8123 4567",
    IN: "98765 43210",
    DE: "1512 3456789",
    FR: "6 12 34 56 78",
    JP: "90 1234 5678",
    CN: "138 0013 8000",
    BR: "11 96123 4567",
    MX: "55 1234 5678",
    ID: "812 3456 789",
    VN: "91 234 56 78",
    TH: "81 234 5678",
    MY: "12 345 6789",
    NZ: "21 123 4567",
    ZA: "71 123 4567",
    AE: "50 123 4567",
    SA: "50 123 4567",
    KR: "10 1234 5678",
    IT: "312 345 6789",
    ES: "612 34 56 78",
    NL: "6 12345678",
    HK: "5123 4567",
};

const DEFAULT_PHONE_PLACEHOLDER = "123 456 7890";

function validatePhoneNumber(
    rawValue: string,
    countryCode: string,
    errors: Translation["signup"]["errors"],
) {
    const digits = rawValue.replace(/\D/g, "");

    if (!digits) {
        return errors.required;
    }
    if (!/^\d+$/.test(digits)) {
        return errors.digitsOnly;
    }

    const [min, max] =
        PHONE_LENGTH_BY_COUNTRY[countryCode] ?? DEFAULT_PHONE_LENGTH;

    if (digits.length < min || digits.length > max) {
        return min === max
            ? errors.invalidExact.replace("{n}", String(min))
            : errors.invalidRange
                  .replace("{min}", String(min))
                  .replace("{max}", String(max));
    }

    return null;
}

const LanguageContext = createContext<{
    code: LanguageCode;
    setCode: (code: LanguageCode) => void;
    t: Translation;
}>({
    code: "en",
    setCode: () => {},
    t: getTranslation("en"),
});

function useTranslation() {
    return useContext(LanguageContext);
}

const NAV_HREFS = ["#platform", "#how", "#results", "#faq", "#legal"] as const;

const STAT_VALUES = ["140,000", "52ms", "24/7"] as const;

const PLATFORM_FEATURE_ICONS = [Atom, TrendingUp, BarChart3, Zap, Monitor, Lock];

const TESTIMONIAL_PEOPLE = [
    { name: "Renata M.", initials: "RM" },
    { name: "Diego S.", initials: "DS" },
    { name: "Amara K.", initials: "AK" },
    { name: "Jonah P.", initials: "JP" },
] as const;

/**
 * Fades/slides its children in when they scroll into view, and back out
 * again when they scroll out — either direction (down or back up).
 */
function Reveal({
    children,
    className = "",
    delay = 0,
}: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => setVisible(entry.isIntersecting),
            { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={`nullypto-reveal ${visible ? "nullypto-reveal-visible" : ""} ${className}`}
            style={delay ? { transitionDelay: `${delay}ms` } : undefined}
        >
            {children}
        </div>
    );
}

function RiskWarningBar({ onDismiss }: { onDismiss: () => void }) {
    const { t } = useTranslation();

    return (
        <div className="nullypto-risk-bar">
            <span>
                <b>{t.riskBar.label}</b> {t.riskBar.text}
            </span>
            <button
                type="button"
                onClick={onDismiss}
                aria-label={t.ui.dismissRiskAria}
            >
                ✕
            </button>
        </div>
    );
}

/** Compact searchable language picker, replacing a native <select>. */
function LanguageSelect({
    value,
    onChange,
}: {
    value: LanguageCode;
    onChange: (code: LanguageCode) => void;
}) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    const selected =
        LANGUAGE_OPTIONS.find((option) => option.code === value) ??
        LANGUAGE_OPTIONS[0];

    const filtered = query.trim()
        ? LANGUAGE_OPTIONS.filter((option) =>
              option.label.toLowerCase().includes(query.trim().toLowerCase()),
          )
        : LANGUAGE_OPTIONS;

    useEffect(() => {
        if (!open) return;

        function handlePointerDown(event: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") setOpen(false);
        }

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);
        searchRef.current?.focus();

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open]);

    return (
        <div className="nullypto-lang" ref={containerRef}>
            <button
                type="button"
                className="nullypto-lang-trigger"
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => {
                    setOpen((isOpen) => !isOpen);
                    setQuery("");
                }}
            >
                <span>{selected.label}</span>
                <span className="nullypto-phone-code-caret">▾</span>
            </button>
            {open && (
                <div className="nullypto-phone-code-panel nullypto-lang-panel" role="listbox">
                    <input
                        ref={searchRef}
                        type="text"
                        className="nullypto-phone-code-search"
                        placeholder={t.ui.searchLanguage}
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                    />
                    <div className="nullypto-phone-code-list">
                        {filtered.length === 0 && (
                            <div className="nullypto-phone-code-empty">
                                {t.ui.noLanguagesFound}
                            </div>
                        )}
                        {filtered.map((option) => (
                            <button
                                type="button"
                                key={option.code}
                                role="option"
                                aria-selected={option.code === value}
                                className={`nullypto-phone-code-option ${
                                    option.code === value ? "nullypto-active" : ""
                                }`}
                                onClick={() => {
                                    onChange(option.code);
                                    setOpen(false);
                                }}
                            >
                                <span className="nullypto-phone-code-option-name">
                                    {option.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function HexLogo() {
    return (
        <svg
            className="nullypto-brand-icon"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <path
                d="M12 2 3 7v10l9 5 9-5V7l-9-5Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="3" fill="currentColor" />
        </svg>
    );
}

function SiteHeader({ showDashboardLink }: { showDashboardLink: boolean }) {
    const { t, code, setCode } = useTranslation();
    const navLabels = [
        t.nav.platform,
        t.nav.how,
        t.nav.results,
        t.nav.faq,
        t.nav.legal,
    ];

    return (
        <header>
            <nav className="nullypto-topnav nullypto-wrap">
                <a className="nullypto-brand nullypto-brand-logo" href="#top">
                    <HexLogo />
                    Nullypto
                </a>
                <div className="nullypto-navlinks">
                    {NAV_HREFS.map((href, index) => (
                        <a key={href} href={href}>
                            {navLabels[index]}
                        </a>
                    ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    {showDashboardLink && (
                        <Link
                            href={dashboard()}
                            className="nullypto-dashboard-link"
                        >
                            {t.nav.dashboard}
                        </Link>
                    )}
                    <LanguageSelect value={code} onChange={setCode} />
                </div>
            </nav>
        </header>
    );
}

function OrbitDecoration() {
    return (
        <svg
            className="nullypto-hero-orbit"
            viewBox="0 0 600 600"
            aria-hidden="true"
        >
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

/** Compact flag + dial-code trigger that opens a searchable country list. */
function PhoneCountryCodeSelect({
    value,
    onChange,
}: {
    value: string;
    onChange: (code: string) => void;
}) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    const selected =
        COUNTRIES.find((country) => country.code === value) ?? COUNTRIES[0];

    const filtered = query.trim()
        ? COUNTRIES.filter((country) => {
              const q = query.trim().toLowerCase();
              return (
                  country.name.toLowerCase().includes(q) ||
                  country.dial.includes(q)
              );
          })
        : COUNTRIES;

    useEffect(() => {
        if (!open) return;

        function handlePointerDown(event: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") setOpen(false);
        }

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);
        searchRef.current?.focus();

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open]);

    return (
        <div className="nullypto-phone-code" ref={containerRef}>
            <button
                type="button"
                className="nullypto-phone-code-trigger"
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => {
                    setOpen((isOpen) => !isOpen);
                    setQuery("");
                }}
            >
                <span
                    className={`fi fi-${selected.code.toLowerCase()}`}
                    aria-hidden="true"
                />
                <span>{selected.dial}</span>
                <span className="nullypto-phone-code-caret">▾</span>
            </button>
            {open && (
                <div className="nullypto-phone-code-panel" role="listbox">
                    <input
                        ref={searchRef}
                        type="text"
                        className="nullypto-phone-code-search"
                        placeholder={t.ui.searchCountry}
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                    />
                    <div className="nullypto-phone-code-list">
                        {filtered.length === 0 && (
                            <div className="nullypto-phone-code-empty">
                                {t.ui.noCountriesFound}
                            </div>
                        )}
                        {filtered.map((country) => (
                            <button
                                type="button"
                                key={country.code}
                                role="option"
                                aria-selected={country.code === value}
                                className={`nullypto-phone-code-option ${
                                    country.code === value
                                        ? "nullypto-active"
                                        : ""
                                }`}
                                onClick={() => {
                                    onChange(country.code);
                                    setOpen(false);
                                }}
                            >
                                <span
                                    className={`fi fi-${country.code.toLowerCase()}`}
                                    aria-hidden="true"
                                />
                                <span className="nullypto-phone-code-option-name">
                                    {country.name}
                                </span>
                                <span className="nullypto-phone-code-option-dial">
                                    {country.dial}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/** Simple centered dialog with a backdrop, used for the Terms & Conditions. */
function Modal({
    title,
    onClose,
    children,
}: {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}) {
    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') onClose();
        }
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div
            className="nullypto-modal-backdrop"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div className="nullypto-modal" role="dialog" aria-modal="true" aria-label={title}>
                <div className="nullypto-modal-header">
                    <h3>{title}</h3>
                    <button
                        type="button"
                        className="nullypto-modal-close"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>
                <div className="nullypto-modal-body">{children}</div>
            </div>
        </div>
    );
}

function TermsModal({ onClose }: { onClose: () => void }) {
    const { t } = useTranslation();
    return (
        <Modal title={t.modals.terms.title} onClose={onClose}>
            {t.modals.terms.sections.map((section) => (
                <div key={section.heading}>
                    <h4>{section.heading}</h4>
                    <p>{section.body}</p>
                </div>
            ))}
        </Modal>
    );
}

function PrivacyModal({ onClose }: { onClose: () => void }) {
    const { t } = useTranslation();
    return (
        <Modal title={t.modals.privacy.title} onClose={onClose}>
            {t.modals.privacy.sections.map((section) => (
                <div key={section.heading}>
                    <h4>{section.heading}</h4>
                    <p>{section.body}</p>
                </div>
            ))}
        </Modal>
    );
}

function SignupForm() {
    const { t } = useTranslation();
    const [countryCode, setCountryCode] = useState("PH");
    const [phoneValue, setPhoneValue] = useState("");
    const [phoneError, setPhoneError] = useState<string | null>(null);
    const [termsOpen, setTermsOpen] = useState(false);
    const [privacyOpen, setPrivacyOpen] = useState(false);

    const phonePlaceholder =
        PHONE_PLACEHOLDER_BY_COUNTRY[countryCode] ?? DEFAULT_PHONE_PLACEHOLDER;

    return (
        <form
            className="nullypto-signup-card"
            onSubmit={(event) => {
                event.preventDefault();

                const error = validatePhoneNumber(
                    phoneValue,
                    countryCode,
                    t.signup.errors,
                );
                setPhoneError(error);
                if (error) return;

                alert(t.signup.demoAlert);
            }}
        >
            <h2>{t.signup.title}</h2>
            <p>{t.signup.subtitle}</p>
            <div className="nullypto-field">
                <label>{t.signup.firstNameLabel}</label>
                <input
                    type="text"
                    placeholder={t.signup.firstNamePlaceholder}
                    required
                />
            </div>
            <div className="nullypto-field">
                <label>{t.signup.lastNameLabel}</label>
                <input
                    type="text"
                    placeholder={t.signup.lastNamePlaceholder}
                    required
                />
            </div>
            <div className="nullypto-field">
                <label>{t.signup.emailLabel}</label>
                <input
                    type="email"
                    placeholder={t.signup.emailPlaceholder}
                    required
                />
            </div>
            <div className="nullypto-field">
                <label>{t.signup.phoneLabel}</label>
                <div className="nullypto-phone-row">
                    <PhoneCountryCodeSelect
                        value={countryCode}
                        onChange={(nextCode) => {
                            setCountryCode(nextCode);
                            if (phoneError) {
                                setPhoneError(
                                    validatePhoneNumber(
                                        phoneValue,
                                        nextCode,
                                        t.signup.errors,
                                    ),
                                );
                            }
                        }}
                    />
                    <input
                        type="tel"
                        placeholder={phonePlaceholder}
                        required
                        aria-invalid={phoneError ? true : undefined}
                        style={{ flex: 1 }}
                        value={phoneValue}
                        onChange={(event) => {
                            setPhoneValue(event.target.value);
                            if (phoneError) {
                                setPhoneError(
                                    validatePhoneNumber(
                                        event.target.value,
                                        countryCode,
                                        t.signup.errors,
                                    ),
                                );
                            }
                        }}
                        onBlur={(event) =>
                            setPhoneError(
                                validatePhoneNumber(
                                    event.target.value,
                                    countryCode,
                                    t.signup.errors,
                                ),
                            )
                        }
                    />
                </div>
                {phoneError && (
                    <p className="nullypto-field-error">{phoneError}</p>
                )}
            </div>
            <label className="nullypto-terms-row">
                <input type="checkbox" required style={{ marginTop: 2 }} />
                <span>
                    {t.signup.agreePrefix}{" "}
                    <button
                        type="button"
                        className="nullypto-link-btn"
                        onClick={() => setTermsOpen(true)}
                    >
                        {t.signup.termsLink}
                    </button>{" "}
                    {t.signup.andWord}{" "}
                    <button
                        type="button"
                        className="nullypto-link-btn"
                        onClick={() => setPrivacyOpen(true)}
                    >
                        {t.signup.privacyLink}
                    </button>
                </span>
            </label>
            {termsOpen && <TermsModal onClose={() => setTermsOpen(false)} />}
            {privacyOpen && (
                <PrivacyModal onClose={() => setPrivacyOpen(false)} />
            )}
            <button className="nullypto-submit-btn" type="submit">
                {t.signup.submit}
            </button>
            <div className="nullypto-signup-footnote">
                <span>✓ {t.signup.footnotes[0]}</span>
                <span>✓ {t.signup.footnotes[1]}</span>
                <span>✓ {t.signup.footnotes[2]}</span>
            </div>
        </form>
    );
}

function Hero() {
    const { t } = useTranslation();

    return (
        <section className="nullypto-hero" id="top">
            <div className="nullypto-wrap nullypto-hero-grid">
                <div>
                    <span className="nullypto-badge">{t.hero.badge}</span>
                    <h1>
                        {t.hero.headline}{" "}
                        <span className="nullypto-accent">
                            {t.hero.headlineAccent}
                        </span>
                    </h1>
                    <p className="nullypto-lead">{t.hero.lead}</p>
                    <div className="nullypto-btn-row">
                        <button className="nullypto-btn nullypto-btn-primary">
                            {t.hero.ctaPrimary}
                        </button>
                        <a
                            href="#how"
                            className="nullypto-btn nullypto-btn-outline"
                        >
                            {t.hero.ctaOutline}
                        </a>
                    </div>
                    <div className="nullypto-stat-row">
                        {STAT_VALUES.map((value, index) => (
                            <div className="nullypto-stat" key={value}>
                                <h3>{value}</h3>
                                <span>{t.hero.stats[index]}</span>
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
    const { t } = useTranslation();

    return (
        <section className="nullypto-platform" id="platform">
            <div className="nullypto-wrap">
                <Reveal className="nullypto-section-head">
                    <span className="nullypto-badge">{t.platform.badge}</span>
                    <h2>{t.platform.heading}</h2>
                    <p>{t.platform.sub}</p>
                </Reveal>
                <div className="nullypto-card-grid">
                    {t.platform.features.map((feature, index) => {
                        const Icon = PLATFORM_FEATURE_ICONS[index];
                        return (
                            <Reveal
                                className="nullypto-p-card"
                                delay={index * 80}
                                key={feature.title}
                            >
                                <div className="nullypto-icon-box">
                                    <Icon size={20} strokeWidth={1.75} />
                                </div>
                                <h3>{feature.title}</h3>
                                <p>{feature.body}</p>
                            </Reveal>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

function ProcessSection() {
    const { t } = useTranslation();

    return (
        <section className="nullypto-process" id="how">
            <div className="nullypto-wrap">
                <Reveal className="nullypto-section-head">
                    <span className="nullypto-badge nullypto-badge-dark">
                        {t.process.badge}
                    </span>
                    <h2>{t.process.heading}</h2>
                </Reveal>
                <div className="nullypto-step-grid">
                    {t.process.steps.map((step, index) => (
                        <Reveal
                            className="nullypto-step-card"
                            delay={index * 80}
                            key={step.title}
                        >
                            <div className="nullypto-step-num">{index + 1}</div>
                            <h3>{step.title}</h3>
                            <p>{step.body}</p>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}

function ResultsSection() {
    const { t } = useTranslation();
    const [index, setIndex] = useState(0);
    const testimonial = t.results.testimonials[index];
    const person = TESTIMONIAL_PEOPLE[index];

    return (
        <section className="nullypto-results" id="results">
            <div className="nullypto-wrap">
                <Reveal className="nullypto-section-head">
                    <span className="nullypto-badge">{t.results.badge}</span>
                    <h2>{t.results.heading}</h2>
                </Reveal>
                <Reveal>
                    <div className="nullypto-testi">
                        <p>&ldquo;{testimonial.quote}&rdquo;</p>
                        <div className="nullypto-avatar-row">
                            <div className="nullypto-avatar">
                                {person.initials}
                            </div>
                            <div className="nullypto-who">
                                <b>{person.name}</b>
                                <span>{testimonial.role}</span>
                            </div>
                        </div>
                    </div>
                    <div className="nullypto-dots">
                        {TESTIMONIAL_PEOPLE.map((item, i) => (
                            <button
                                key={item.name}
                                type="button"
                                aria-label={`Show testimonial from ${item.name}`}
                                className={
                                    i === index ? "nullypto-active" : undefined
                                }
                                onClick={() => setIndex(i)}
                            />
                        ))}
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

function FaqSection() {
    const { t } = useTranslation();
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section className="nullypto-faq" id="faq">
            <div className="nullypto-wrap">
                <Reveal className="nullypto-section-head">
                    <span className="nullypto-badge">{t.faq.badge}</span>
                    <h2>{t.faq.heading}</h2>
                </Reveal>
                <div>
                    {t.faq.items.map((item, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <div
                                key={item.q}
                                className={`nullypto-faq-item ${isOpen ? "nullypto-open" : ""}`}
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
    const { t } = useTranslation();

    return (
        <section className="nullypto-legal" id="legal">
            <div className="nullypto-wrap">
                <Reveal className="nullypto-section-head">
                    <span className="nullypto-badge nullypto-badge-dark">
                        {t.legal.badge}
                    </span>
                    <h2>{t.legal.heading}</h2>
                </Reveal>
                <div className="nullypto-legal-grid">
                    {t.legal.cards.map((card, index) => (
                        <Reveal
                            className="nullypto-legal-card"
                            delay={index * 80}
                            key={card.title}
                        >
                            <h3>{card.title}</h3>
                            <p>{card.body}</p>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}

function SiteFooter() {
    const { t } = useTranslation();

    return (
        <footer>
            <div className="nullypto-wrap">
                <div className="nullypto-foot-grid">
                    <div className="nullypto-foot-brand">
                        <a className="nullypto-brand" href="#top">
                            Nullypto
                        </a>
                        <p>{t.footer.tagline}</p>
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
                        <h4>{t.footer.platformColHeader}</h4>
                        <a href="#platform">{t.footer.platformLinks[0]}</a>
                        <a href="#how">{t.footer.platformLinks[1]}</a>
                        <a href="#results">{t.footer.platformLinks[2]}</a>
                        <a href="#">{t.footer.platformLinks[3]}</a>
                    </div>
                    <div className="nullypto-foot-col">
                        <h4>{t.footer.companyColHeader}</h4>
                        <a href="#faq">{t.footer.companyLinks[0]}</a>
                        <a href="#legal">{t.footer.companyLinks[1]}</a>
                        <a href="#legal">{t.footer.companyLinks[2]}</a>
                        <a href="#legal">{t.footer.companyLinks[3]}</a>
                    </div>
                    <div className="nullypto-foot-col">
                        <h4>{t.footer.contactColHeader}</h4>
                        <a href="mailto:support@nullyptoai.com">
                            support@nullyptoai.com
                        </a>
                        <span
                            style={{
                                display: "block",
                                color: "#78877f",
                                fontSize: "14.5px",
                            }}
                        >
                            {t.footer.supportLine}
                        </span>
                    </div>
                </div>
                <div className="nullypto-foot-bottom">
                    <span>
                        © {new Date().getFullYear()} Nullypto. {t.footer.copyrightLine}
                    </span>
                    <span>{t.footer.disclaimer}</span>
                </div>
            </div>
        </footer>
    );
}

export default function Welcome() {
    const { auth } = usePage().props;
    const [showRiskWarning, setShowRiskWarning] = useState(true);
    const [languageCode, setLanguageCode] = useState<LanguageCode>("en");

    // Smooth-scroll the in-page nav/footer anchor links (#platform, #how, …).
    // Set on <html> only while this page is mounted, and restored on
    // unmount, so it doesn't leak into other pages via Inertia's SPA
    // navigation.
    useEffect(() => {
        const previous = document.documentElement.style.scrollBehavior;
        document.documentElement.style.scrollBehavior = "smooth";
        return () => {
            document.documentElement.style.scrollBehavior = previous;
        };
    }, []);

    return (
        <LanguageContext.Provider
            value={{
                code: languageCode,
                setCode: setLanguageCode,
                t: getTranslation(languageCode),
            }}
        >
            <Head title="Nullypto — Quantum-Accelerated AI Trading" />
            <div className="nullypto-page">
                {showRiskWarning && (
                    <RiskWarningBar
                        onDismiss={() => setShowRiskWarning(false)}
                    />
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
        </LanguageContext.Provider>
    );
}
