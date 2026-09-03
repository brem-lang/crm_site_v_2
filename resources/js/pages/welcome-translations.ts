/**
 * i18n content for the Nullypto landing page (`welcome.tsx`).
 *
 * Only `en` and `fr` are authored right now, and `LANGUAGE_OPTIONS` only
 * lists those two — the rest of the originally-requested 18 languages are
 * hidden from the picker until they're actually translated (no point
 * showing a language that silently falls back to English). `LanguageCode`
 * keeps the full union so re-adding a language later is just: add it back
 * to `LANGUAGE_OPTIONS`, then add its content to `TRANSLATIONS` (or alias
 * it to an existing entry, e.g. `"fr-CH": fr`). Any code without an entry
 * in `TRANSLATIONS` falls back to English via `getTranslation()`.
 */

export type LanguageCode =
    | "en"
    | "de"
    | "fr"
    | "nl"
    | "pl"
    | "sv"
    | "cs"
    | "pt"
    | "pt-BR"
    | "hu"
    | "it"
    | "es"
    | "es-MX"
    | "ro"
    | "tr"
    | "sk"
    | "fr-CH"
    | "es-AR";

export const LANGUAGE_OPTIONS: { code: LanguageCode; label: string }[] = [
    { code: "en", label: "English" },
    { code: "fr", label: "Français" },
];

export type Translation = {
    riskBar: { label: string; text: string };
    nav: {
        platform: string;
        how: string;
        results: string;
        faq: string;
        legal: string;
        dashboard: string;
    };
    hero: {
        badge: string;
        headline: string;
        headlineAccent: string;
        lead: string;
        ctaPrimary: string;
        ctaOutline: string;
        stats: [string, string, string];
    };
    signup: {
        title: string;
        subtitle: string;
        firstNameLabel: string;
        firstNamePlaceholder: string;
        lastNameLabel: string;
        lastNamePlaceholder: string;
        emailLabel: string;
        emailPlaceholder: string;
        phoneLabel: string;
        agreePrefix: string;
        termsLink: string;
        andWord: string;
        privacyLink: string;
        submit: string;
        footnotes: [string, string, string];
        demoAlert: string;
        errors: {
            required: string;
            digitsOnly: string;
            /** `{n}` placeholder */
            invalidExact: string;
            /** `{min}` / `{max}` placeholders */
            invalidRange: string;
        };
    };
    platform: {
        badge: string;
        heading: string;
        sub: string;
        features: { title: string; body: string }[];
    };
    process: {
        badge: string;
        heading: string;
        steps: { title: string; body: string }[];
    };
    results: {
        badge: string;
        heading: string;
        testimonials: { role: string; quote: string }[];
    };
    faq: {
        badge: string;
        heading: string;
        items: { q: string; a: string }[];
    };
    legal: {
        badge: string;
        heading: string;
        cards: { title: string; body: string }[];
    };
    footer: {
        tagline: string;
        platformColHeader: string;
        companyColHeader: string;
        contactColHeader: string;
        platformLinks: [string, string, string, string];
        companyLinks: [string, string, string, string];
        supportLine: string;
        copyrightLine: string;
        disclaimer: string;
    };
    modals: {
        terms: {
            title: string;
            sections: { heading: string; body: string }[];
        };
        privacy: {
            title: string;
            sections: { heading: string; body: string }[];
        };
    };
    ui: {
        searchLanguage: string;
        searchCountry: string;
        noLanguagesFound: string;
        noCountriesFound: string;
        dismissRiskAria: string;
        closeModalAria: string;
    };
    exitModal: {
        badge: string;
        /** `{time}` placeholder, e.g. "04:15" */
        heldFor: string;
    };
};

const en: Translation = {
    riskBar: {
        label: "Risk warning:",
        text: "Trading CFDs and digital assets carries a high level of risk and may not be suitable for all investors. Past performance is not indicative of future results. You could lose more than your initial investment.",
    },
    nav: {
        platform: "Platform",
        how: "How it works",
        results: "Results",
        faq: "FAQ",
        legal: "Legal",
        dashboard: "Dashboard",
    },
    hero: {
        badge: "Quantum-inspired market intelligence",
        headline: "Markets move in probabilities.",
        headlineAccent: "So does our engine.",
        lead: "Nullypto runs adaptive AI models — built on quantum-inspired optimization — that continuously re-weigh thousands of market scenarios and act on the ones that matter. You set the boundaries. The engine handles the noise.",
        ctaPrimary: "Start free assessment",
        ctaOutline: "See how it works",
        stats: ["Active accounts", "Median signal latency", "Market monitoring"],
    },
    signup: {
        title: "Sign up now",
        subtitle: "Start your AI trading journey in less than 30 seconds",
        firstNameLabel: "First Name",
        firstNamePlaceholder: "Enter your first name",
        lastNameLabel: "Last Name",
        lastNamePlaceholder: "Enter your last name",
        emailLabel: "Email Address",
        emailPlaceholder: "your@email.com",
        phoneLabel: "Phone Number",
        agreePrefix: "I agree to the",
        termsLink: "Terms & Conditions",
        andWord: "and",
        privacyLink: "Privacy Policy",
        submit: "Start Trading with AI",
        footnotes: [
            "109 users joined today",
            "Withdraw anytime",
            "Secure & encrypted",
        ],
        demoAlert: "Demo form — connect this to your signup backend.",
        errors: {
            required: "Phone number is required.",
            digitsOnly: "Phone number can only contain digits.",
            invalidExact: "Enter a valid {n}-digit phone number for this country.",
            invalidRange:
                "Enter a valid phone number ({min}-{max} digits) for this country.",
        },
    },
    platform: {
        badge: "The platform",
        heading: "Every module built to remove a specific kind of guesswork",
        sub: "Six systems working together, from signal generation to execution to risk containment.",
        features: [
            {
                title: "Quantum-inspired optimization",
                body: "Portfolio and entry/exit decisions are computed across thousands of simulated states in parallel, narrowing to the paths with the strongest risk-adjusted edge.",
            },
            {
                title: "Adaptive signal models",
                body: "Models retrain on rolling windows of price action, order flow, and volatility regimes, so strategies shift as market conditions actually shift.",
            },
            {
                title: "Layered risk containment",
                body: "Position sizing, drawdown limits, and correlation checks run before every trade — not as an afterthought, but as a hard gate the engine can't bypass.",
            },
            {
                title: "Low-latency execution",
                body: "Orders route to liquidity venues in milliseconds, so the strategy you approved is the strategy that actually gets filled.",
            },
            {
                title: "Real-time dashboard",
                body: "Every position, signal, and risk check is visible as it happens — nothing about the engine's reasoning is hidden from you.",
            },
            {
                title: "Segregated custody",
                body: "Funds are held with regulated custodians, separate from operating accounts, with full audit trails on every movement.",
            },
        ],
    },
    process: {
        badge: "Process",
        heading: "From account to first allocation in four steps",
        steps: [
            {
                title: "Verify your account",
                body: "Create your profile and confirm your identity. Standard KYC checks keep the platform compliant and your funds protected.",
            },
            {
                title: "Set your boundaries",
                body: "Choose your markets, define exposure limits, and pick a volatility tolerance. These become hard constraints for the engine.",
            },
            {
                title: "Fund your account",
                body: "Deposit via bank transfer or supported digital assets. Funds are held in segregated accounts with regulated custodians.",
            },
            {
                title: "Let the engine work",
                body: "The model begins scanning, sizing, and executing within your rules. Track every decision from your dashboard in real time.",
            },
        ],
    },
    results: {
        badge: "Trader results",
        heading: "What people building with Nullypto are saying",
        testimonials: [
            {
                role: "Independent trader, 3 years",
                quote: "The risk containment layer is what sold me. I can see exactly why the engine sized a position the way it did, every single time.",
            },
            {
                role: "Part-time trader, 1 year",
                quote: "Switching from manual charting to letting the engine handle sizing cut my worst drawdowns in half without me changing my strategy.",
            },
            {
                role: "Active trader, 2 years",
                quote: "What I like is the dashboard — every trade shows the reasoning behind it, not just the result.",
            },
            {
                role: "New trader, 6 months",
                quote: "Setup took minutes and the boundaries I set actually hold. It behaves the way I configured it, every time.",
            },
        ],
    },
    faq: {
        badge: "Questions",
        heading: "Frequently asked questions",
        items: [
            {
                q: "What is the minimum deposit?",
                a: "Minimum deposits vary by account tier and funding method. Bank transfers and supported digital assets each have their own thresholds, shown before you confirm funding.",
            },
            {
                q: "Can I withdraw funds at any time?",
                a: "Yes. Withdrawal requests are processed to your verified account or wallet, subject to standard security checks and any open positions.",
            },
            {
                q: "Do I need trading experience to start?",
                a: "No. You set your boundaries — markets, exposure limits, and volatility tolerance — and the engine operates within them. Experienced traders can configure more advanced constraints.",
            },
            {
                q: "How is my data protected?",
                a: "Data is encrypted in transit and at rest, access is role-restricted, and information is never sold to third parties.",
            },
            {
                q: "Is Nullypto available in my country?",
                a: "Availability depends on local regulation. Enter your details during sign-up and we'll confirm eligibility for your region.",
            },
        ],
    },
    legal: {
        badge: "Legal",
        heading: "Risk disclosure, terms & privacy",
        cards: [
            {
                title: "Risk disclosure",
                body: "Trading digital assets, CFDs, and other leveraged instruments carries a high degree of risk and is not appropriate for all investors. Prices can move rapidly against your position, and automated strategies can amplify both gains and losses. Nullypto does not guarantee returns of any kind, and no communication from us should be interpreted as investment advice. Only trade with capital you can afford to lose, and consider seeking independent financial advice before opening an account.",
            },
            {
                title: "Terms of service",
                body: "By creating a Nullypto account you agree to use the platform in accordance with applicable law and our published account rules, including limits on strategy configuration, withdrawal timelines, and acceptable use of the API and dashboard. Full terms, including account eligibility, fee schedules, and dispute resolution procedures, are provided during onboarding and are binding once your account is activated.",
            },
            {
                title: "Privacy policy",
                body: "We collect only the information required to verify your identity, operate your account, and meet regulatory obligations. Data is encrypted in transit and at rest, and is never sold to third parties. You can request a copy of your data or ask us to delete it, subject to the retention periods required by financial regulation.",
            },
        ],
    },
    footer: {
        tagline:
            "Quantum-inspired AI trading infrastructure for people who want to see the reasoning, not just the result.",
        platformColHeader: "PLATFORM",
        companyColHeader: "COMPANY",
        contactColHeader: "CONTACT",
        platformLinks: ["Features", "How it works", "Results", "Open account"],
        companyLinks: [
            "FAQ",
            "Risk disclosure",
            "Terms of service",
            "Privacy policy",
        ],
        supportLine: "Support available 24/5",
        copyrightLine: "All rights reserved.",
        disclaimer:
            "Nullypto does not provide investment advice. Trading involves risk of loss.",
    },
    modals: {
        terms: {
            title: "Terms & Conditions",
            sections: [
                {
                    heading: "1. Acceptance",
                    body: "By submitting this form, you confirm you are of legal age and agree to these Terms.",
                },
                {
                    heading: "2. Risk Notice",
                    body: "Trading involves risk. Past performance does not guarantee future results. You may lose capital.",
                },
                {
                    heading: "3. Third Parties",
                    body: "We may share your details with service partners for account setup and support where lawful.",
                },
            ],
        },
        privacy: {
            title: "Privacy Policy",
            sections: [
                {
                    heading: "1. Data We Collect",
                    body: "Name, email, phone, IP, country, and campaign parameters (if provided).",
                },
                {
                    heading: "2. Purpose",
                    body: "To process registration, prevent fraud/abuse, and improve service.",
                },
                {
                    heading: "3. Your Rights",
                    body: "You can request access, correction, or deletion where applicable by law.",
                },
            ],
        },
    },
    ui: {
        searchLanguage: "Search language",
        searchCountry: "Search country or code",
        noLanguagesFound: "No languages found",
        noCountriesFound: "No countries found",
        dismissRiskAria: "Dismiss risk warning",
        closeModalAria: "Close",
    },
    exitModal: {
        badge: "Before you go",
        heldFor: "Your assessment slot is held for {time}",
    },
};

const fr: Translation = {
    riskBar: {
        label: "Avertissement sur les risques :",
        text: "Le trading de CFD et d'actifs numériques comporte un niveau de risque élevé et peut ne pas convenir à tous les investisseurs. Les performances passées ne préjugent pas des résultats futurs. Vous pourriez perdre plus que votre investissement initial.",
    },
    nav: {
        platform: "Plateforme",
        how: "Fonctionnement",
        results: "Résultats",
        faq: "FAQ",
        legal: "Mentions légales",
        dashboard: "Tableau de bord",
    },
    hero: {
        badge: "Intelligence de marché d'inspiration quantique",
        headline: "Les marchés évoluent en probabilités.",
        headlineAccent: "Notre moteur aussi.",
        lead: "Nullypto exécute des modèles d'IA adaptatifs — basés sur une optimisation d'inspiration quantique — qui repondèrent en continu des milliers de scénarios de marché et agissent sur ceux qui comptent. Vous définissez les limites. Le moteur gère le bruit.",
        ctaPrimary: "Démarrer une évaluation gratuite",
        ctaOutline: "Voir comment ça marche",
        stats: ["Comptes actifs", "Latence médiane des signaux", "Surveillance des marchés"],
    },
    signup: {
        title: "Inscrivez-vous maintenant",
        subtitle: "Démarrez votre parcours de trading IA en moins de 30 secondes",
        firstNameLabel: "Prénom",
        firstNamePlaceholder: "Entrez votre prénom",
        lastNameLabel: "Nom",
        lastNamePlaceholder: "Entrez votre nom",
        emailLabel: "Adresse e-mail",
        emailPlaceholder: "votre@email.com",
        phoneLabel: "Numéro de téléphone",
        agreePrefix: "J'accepte les",
        termsLink: "Conditions Générales",
        andWord: "et la",
        privacyLink: "Politique de Confidentialité",
        submit: "Commencer à trader avec l'IA",
        footnotes: [
            "109 utilisateurs inscrits aujourd'hui",
            "Retrait à tout moment",
            "Sécurisé et chiffré",
        ],
        demoAlert:
            "Formulaire de démonstration — connectez-le à votre backend d'inscription.",
        errors: {
            required: "Le numéro de téléphone est requis.",
            digitsOnly: "Le numéro de téléphone ne peut contenir que des chiffres.",
            invalidExact:
                "Saisissez un numéro de téléphone valide à {n} chiffres pour ce pays.",
            invalidRange:
                "Saisissez un numéro de téléphone valide ({min}-{max} chiffres) pour ce pays.",
        },
    },
    platform: {
        badge: "La plateforme",
        heading:
            "Chaque module conçu pour éliminer un type précis d'incertitude",
        sub: "Six systèmes qui fonctionnent ensemble, de la génération de signaux à l'exécution en passant par le contrôle des risques.",
        features: [
            {
                title: "Optimisation d'inspiration quantique",
                body: "Les décisions de portefeuille et d'entrée/sortie sont calculées sur des milliers d'états simulés en parallèle, pour ne retenir que les trajectoires offrant le meilleur profil rendement-risque.",
            },
            {
                title: "Modèles de signaux adaptatifs",
                body: "Les modèles se réentraînent sur des fenêtres glissantes de prix, de flux d'ordres et de régimes de volatilité, afin que les stratégies évoluent avec les conditions réelles du marché.",
            },
            {
                title: "Contrôle des risques en couches",
                body: "Le dimensionnement des positions, les limites de perte et les contrôles de corrélation sont vérifiés avant chaque trade — non comme une réflexion après coup, mais comme un verrou que le moteur ne peut pas contourner.",
            },
            {
                title: "Exécution à faible latence",
                body: "Les ordres sont acheminés vers les plateformes de liquidité en quelques millisecondes, afin que la stratégie approuvée soit bien celle qui est exécutée.",
            },
            {
                title: "Tableau de bord en temps réel",
                body: "Chaque position, chaque signal et chaque contrôle de risque est visible en temps réel — rien du raisonnement du moteur ne vous est caché.",
            },
            {
                title: "Conservation ségréguée",
                body: "Les fonds sont détenus par des dépositaires réglementés, séparés des comptes d'exploitation, avec des pistes d'audit complètes sur chaque mouvement.",
            },
        ],
    },
    process: {
        badge: "Processus",
        heading: "De l'ouverture du compte à la première allocation en quatre étapes",
        steps: [
            {
                title: "Vérifiez votre compte",
                body: "Créez votre profil et confirmez votre identité. Les contrôles KYC standards garantissent la conformité de la plateforme et la protection de vos fonds.",
            },
            {
                title: "Définissez vos limites",
                body: "Choisissez vos marchés, définissez vos limites d'exposition et votre tolérance à la volatilité. Ces paramètres deviennent des contraintes strictes pour le moteur.",
            },
            {
                title: "Approvisionnez votre compte",
                body: "Effectuez un dépôt par virement bancaire ou en actifs numériques pris en charge. Les fonds sont détenus sur des comptes ségrégués auprès de dépositaires réglementés.",
            },
            {
                title: "Laissez le moteur travailler",
                body: "Le modèle commence à analyser, dimensionner et exécuter selon vos règles. Suivez chaque décision depuis votre tableau de bord en temps réel.",
            },
        ],
    },
    results: {
        badge: "Résultats des traders",
        heading: "Ce que disent les utilisateurs de Nullypto",
        testimonials: [
            {
                role: "Trader indépendant, 3 ans",
                quote: "C'est la couche de contrôle des risques qui m'a convaincu. Je vois exactement pourquoi le moteur a dimensionné une position d'une certaine façon, à chaque fois.",
            },
            {
                role: "Trader à temps partiel, 1 an",
                quote: "Passer du graphique manuel à un dimensionnement géré par le moteur a divisé par deux mes pires pertes, sans changer ma stratégie.",
            },
            {
                role: "Trader actif, 2 ans",
                quote: "Ce que j'apprécie, c'est le tableau de bord — chaque trade montre le raisonnement derrière la décision, pas seulement le résultat.",
            },
            {
                role: "Nouveau trader, 6 mois",
                quote: "La mise en place a pris quelques minutes et les limites que j'ai définies sont vraiment respectées. Il se comporte exactement comme je l'ai configuré, à chaque fois.",
            },
        ],
    },
    faq: {
        badge: "Questions",
        heading: "Questions fréquentes",
        items: [
            {
                q: "Quel est le dépôt minimum ?",
                a: "Les dépôts minimums varient selon le niveau de compte et le mode de financement. Les virements bancaires et les actifs numériques pris en charge ont chacun leurs propres seuils, affichés avant la confirmation du financement.",
            },
            {
                q: "Puis-je retirer mes fonds à tout moment ?",
                a: "Oui. Les demandes de retrait sont traitées vers votre compte ou portefeuille vérifié, sous réserve des contrôles de sécurité standards et des positions ouvertes.",
            },
            {
                q: "Ai-je besoin d'expérience en trading pour commencer ?",
                a: "Non. Vous définissez vos limites — marchés, limites d'exposition et tolérance à la volatilité — et le moteur opère dans ce cadre. Les traders expérimentés peuvent configurer des contraintes plus avancées.",
            },
            {
                q: "Comment mes données sont-elles protégées ?",
                a: "Les données sont chiffrées en transit et au repos, l'accès est restreint par rôle, et les informations ne sont jamais vendues à des tiers.",
            },
            {
                q: "Nullypto est-il disponible dans mon pays ?",
                a: "La disponibilité dépend de la réglementation locale. Renseignez vos coordonnées lors de l'inscription et nous confirmerons votre éligibilité pour votre région.",
            },
        ],
    },
    legal: {
        badge: "Mentions légales",
        heading: "Avertissement sur les risques, conditions et confidentialité",
        cards: [
            {
                title: "Avertissement sur les risques",
                body: "Le trading d'actifs numériques, de CFD et d'autres instruments à effet de levier comporte un degré de risque élevé et ne convient pas à tous les investisseurs. Les prix peuvent évoluer rapidement contre votre position, et les stratégies automatisées peuvent amplifier aussi bien les gains que les pertes. Nullypto ne garantit aucun rendement, et aucune communication de notre part ne doit être interprétée comme un conseil en investissement. Ne tradez qu'avec un capital que vous pouvez vous permettre de perdre, et envisagez de consulter un conseiller financier indépendant avant d'ouvrir un compte.",
            },
            {
                title: "Conditions d'utilisation",
                body: "En créant un compte Nullypto, vous acceptez d'utiliser la plateforme conformément à la loi applicable et à nos règles de compte publiées, y compris les limites de configuration de stratégie, les délais de retrait et l'usage acceptable de l'API et du tableau de bord. Les conditions complètes, incluant l'éligibilité du compte, les barèmes de frais et les procédures de résolution des litiges, sont fournies lors de l'intégration et deviennent contraignantes dès l'activation de votre compte.",
            },
            {
                title: "Politique de confidentialité",
                body: "Nous ne collectons que les informations nécessaires pour vérifier votre identité, gérer votre compte et satisfaire aux obligations réglementaires. Les données sont chiffrées en transit et au repos, et ne sont jamais vendues à des tiers. Vous pouvez demander une copie de vos données ou leur suppression, sous réserve des délais de conservation exigés par la réglementation financière.",
            },
        ],
    },
    footer: {
        tagline:
            "Une infrastructure de trading IA d'inspiration quantique pour ceux qui veulent voir le raisonnement, pas seulement le résultat.",
        platformColHeader: "PLATEFORME",
        companyColHeader: "ENTREPRISE",
        contactColHeader: "CONTACT",
        platformLinks: [
            "Fonctionnalités",
            "Fonctionnement",
            "Résultats",
            "Ouvrir un compte",
        ],
        companyLinks: [
            "FAQ",
            "Avertissement sur les risques",
            "Conditions d'utilisation",
            "Politique de confidentialité",
        ],
        supportLine: "Support disponible 24h/24, 5j/7",
        copyrightLine: "Tous droits réservés.",
        disclaimer:
            "Nullypto ne fournit pas de conseil en investissement. Le trading comporte un risque de perte.",
    },
    modals: {
        terms: {
            title: "Conditions Générales",
            sections: [
                {
                    heading: "1. Acceptation",
                    body: "En soumettant ce formulaire, vous confirmez être majeur et accepter les présentes Conditions.",
                },
                {
                    heading: "2. Avertissement sur les risques",
                    body: "Le trading comporte des risques. Les performances passées ne garantissent pas les résultats futurs. Vous pourriez perdre du capital.",
                },
                {
                    heading: "3. Tiers",
                    body: "Nous pouvons partager vos informations avec des partenaires de service pour la création de compte et l'assistance, dans la mesure permise par la loi.",
                },
            ],
        },
        privacy: {
            title: "Politique de Confidentialité",
            sections: [
                {
                    heading: "1. Données collectées",
                    body: "Nom, e-mail, téléphone, adresse IP, pays et paramètres de campagne (le cas échéant).",
                },
                {
                    heading: "2. Finalité",
                    body: "Pour traiter l'inscription, prévenir la fraude/les abus et améliorer le service.",
                },
                {
                    heading: "3. Vos droits",
                    body: "Vous pouvez demander l'accès, la correction ou la suppression de vos données dans la mesure où la loi le permet.",
                },
            ],
        },
    },
    ui: {
        searchLanguage: "Rechercher une langue",
        searchCountry: "Rechercher un pays ou un indicatif",
        noLanguagesFound: "Aucune langue trouvée",
        noCountriesFound: "Aucun pays trouvé",
        dismissRiskAria: "Masquer l'avertissement sur les risques",
        closeModalAria: "Fermer",
    },
    exitModal: {
        badge: "Avant de partir",
        heldFor: "Votre créneau d'évaluation est réservé pendant {time}",
    },
};

export const TRANSLATIONS: Partial<Record<LanguageCode, Translation>> = {
    en,
    fr,
};

/** Returns the translation for `code`, falling back to English for any
 * language not yet authored in `TRANSLATIONS`. */
export function getTranslation(code: LanguageCode): Translation {
    return TRANSLATIONS[code] ?? en;
}
