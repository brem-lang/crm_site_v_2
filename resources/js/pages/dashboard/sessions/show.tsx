import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { dashboard } from '@/routes';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Bot,
    Globe,
    Laptop,
    Link2,
    MailCheck,
    MousePointerClick,
    Phone,
    Server,
    Smartphone,
    Tablet,
    Type,
    Zap,
} from 'lucide-react';

type SessionSummary = {
    id: number;
    uuid: string;
    visitor: {
        uuid: string | null;
        total_visits: number | null;
        first_seen_at: string | null;
    };

    started_at: string | null;
    last_activity_at: string | null;
    duration_seconds: number | null;
    pages_viewed: number;
    is_first_time_visitor: boolean | null;
    previous_visits_count: number | null;

    ip_address: string | null;
    country: string | null;
    region: string | null;
    city: string | null;
    timezone: string | null;
    isp: string | null;
    asn: string | null;
    is_mobile_carrier: boolean | null;

    device_type: string | null;
    device_brand: string | null;
    device_model: string | null;
    os: string | null;
    os_version: string | null;
    browser: string | null;
    browser_version: string | null;
    screen_resolution: string | null;
    viewport_size: string | null;
    browser_language: string | null;
    site_language: string | null;

    referrer_url: string | null;
    referrer_domain: string | null;
    traffic_source: string | null;
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    utm_content: string | null;
    utm_term: string | null;
    campaign_id: string | null;
    affiliate_id: string | null;
    click_id: string | null;
    landing_url: string | null;

    js_enabled: boolean;
    is_bot: boolean | null;
    is_proxy: boolean | null;
    is_hosting: boolean | null;
    same_ip_recent_visits: number | null;
    risk_score: number | null;
    risk_reasons: string[];
};

type TimelineEntry =
    | {
          type: 'page_view';
          at: string | null;
          data: {
              key: string;
              page_path: string | null;
              sequence_number: number | null;
              is_entry: boolean | null;
              is_exit: boolean | null;
              time_spent_seconds: number | null;
              scroll_depth_max: number | null;
              converted_at: string | null;
          };
      }
    | {
          type: 'event';
          at: string | null;
          data: {
              event_type: string;
              event_data: Record<string, unknown> | null;
          };
      }
    | {
          type: 'lead';
          at: string | null;
          data: {
              status: string;
              email: string;
          };
      };

const riskReasonLabels: Record<string, string> = {
    bot_user_agent: 'Bot-like user agent',
    proxy_or_vpn: 'Proxy/VPN IP',
    hosting_provider: 'Datacenter/hosting IP',
    repeated_ip: 'Many visits from this IP',
    fast_form_submission: 'Form submitted unusually fast',
};

const deviceIcons: Record<string, typeof Laptop> = {
    Desktop: Laptop,
    Mobile: Smartphone,
    Tablet: Tablet,
};

const eventIcons: Record<string, typeof MousePointerClick> = {
    cta_click: MousePointerClick,
    link_click: Link2,
    phone_click: Phone,
    whatsapp_click: Phone,
    telegram_click: Phone,
    form_start: Type,
    form_submit: Type,
    scroll_depth: MousePointerClick,
    page_exit: ArrowLeft,
    tab_hidden: Globe,
    tab_visible: Globe,
};

function formatDuration(seconds: number | null): string {
    if (seconds === null) return '—';
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;
    return `${minutes}m ${rest}s`;
}

function formatEventLabel(eventType: string): string {
    return eventType
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function SummaryField({
    label,
    value,
}: {
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="grid gap-0.5">
            <span className="text-muted-foreground text-xs">{label}</span>
            <span className="text-sm font-medium">{value ?? '—'}</span>
        </div>
    );
}

function TimelineRow({ entry }: { entry: TimelineEntry }) {
    const time = entry.at ? new Date(entry.at).toLocaleTimeString() : '—';

    if (entry.type === 'page_view') {
        const { data } = entry;
        return (
            <div className="flex gap-3">
                <div className="flex flex-col items-center">
                    <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-full">
                        <Globe className="size-4" />
                    </div>
                    <div className="bg-border mt-1 w-px flex-1" />
                </div>
                <div className="flex-1 pb-6">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium">
                            Viewed {data.page_path ?? data.key}
                        </span>
                        {data.is_entry && (
                            <Badge variant="secondary" className="font-normal">
                                Entry
                            </Badge>
                        )}
                        {data.is_exit && (
                            <Badge variant="secondary" className="font-normal">
                                Exit
                            </Badge>
                        )}
                        {data.converted_at && (
                            <Badge className="font-normal">Converted</Badge>
                        )}
                    </div>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                        {time}
                        {data.time_spent_seconds !== null &&
                            ` · ${formatDuration(data.time_spent_seconds)} on page`}
                        {data.scroll_depth_max !== null &&
                            ` · scrolled ${data.scroll_depth_max}%`}
                    </p>
                </div>
            </div>
        );
    }

    if (entry.type === 'lead') {
        const { data } = entry;
        return (
            <div className="flex gap-3">
                <div className="flex flex-col items-center">
                    <div
                        className={`flex size-8 items-center justify-center rounded-full ${
                            data.status === 'success'
                                ? 'bg-primary/10 text-primary'
                                : 'bg-destructive/10 text-destructive'
                        }`}
                    >
                        <MailCheck className="size-4" />
                    </div>
                    <div className="bg-border mt-1 w-px flex-1" />
                </div>
                <div className="flex-1 pb-6">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium">
                            Lead submitted
                        </span>
                        <Badge
                            variant={
                                data.status === 'success'
                                    ? 'default'
                                    : 'destructive'
                            }
                            className="font-normal"
                        >
                            {data.status}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                        {time} · {data.email}
                    </p>
                </div>
            </div>
        );
    }

    const { data } = entry;
    const Icon = eventIcons[data.event_type] ?? MousePointerClick;
    const detail =
        data.event_data &&
        (typeof data.event_data.text === 'string'
            ? data.event_data.text
            : typeof data.event_data.href === 'string'
              ? data.event_data.href
              : typeof data.event_data.depth === 'number'
                ? `${data.event_data.depth}%`
                : null);

    return (
        <div className="flex gap-3">
            <div className="flex flex-col items-center">
                <div className="bg-muted text-muted-foreground flex size-8 items-center justify-center rounded-full">
                    <Icon className="size-4" />
                </div>
                <div className="bg-border mt-1 w-px flex-1" />
            </div>
            <div className="flex-1 pb-6">
                <span className="text-sm font-medium">
                    {formatEventLabel(data.event_type)}
                </span>
                <p className="text-muted-foreground mt-0.5 text-xs">
                    {time}
                    {detail && ` · ${detail}`}
                </p>
            </div>
        </div>
    );
}

export default function SessionJourney({
    session,
    timeline,
}: {
    session: SessionSummary;
    timeline: TimelineEntry[];
}) {
    const DeviceIcon = session.device_type
        ? (deviceIcons[session.device_type] ?? Laptop)
        : Laptop;
    const isSuspicious = (session.risk_score ?? 0) >= 40;

    return (
        <>
            <Head title={`Session ${session.uuid.slice(0, 8)}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Button variant="ghost" size="sm" asChild className="w-fit">
                    <Link href={dashboard().url}>
                        <ArrowLeft className="size-4" />
                        Back to dashboard
                    </Link>
                </Button>

                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                <DeviceIcon className="text-muted-foreground size-4" />
                                Session summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                            <SummaryField
                                label="Started"
                                value={
                                    session.started_at
                                        ? new Date(
                                              session.started_at,
                                          ).toLocaleString()
                                        : null
                                }
                            />
                            <SummaryField
                                label="Duration"
                                value={formatDuration(
                                    session.duration_seconds,
                                )}
                            />
                            <SummaryField
                                label="Pages viewed"
                                value={session.pages_viewed}
                            />
                            <SummaryField
                                label="Visitor"
                                value={
                                    session.is_first_time_visitor
                                        ? 'First-time'
                                        : `Returning (${session.previous_visits_count ?? 0} prior)`
                                }
                            />
                            <SummaryField
                                label="Location"
                                value={[
                                    session.city,
                                    session.region,
                                    session.country,
                                ]
                                    .filter(Boolean)
                                    .join(', ')}
                            />
                            <SummaryField
                                label="IP address"
                                value={session.ip_address}
                            />
                            <SummaryField label="ISP" value={session.isp} />
                            <SummaryField
                                label="Timezone"
                                value={session.timezone}
                            />
                            <SummaryField
                                label="Device"
                                value={[
                                    session.device_type,
                                    session.device_brand,
                                    session.device_model,
                                ]
                                    .filter(Boolean)
                                    .join(' · ')}
                            />
                            <SummaryField
                                label="OS"
                                value={[session.os, session.os_version]
                                    .filter(Boolean)
                                    .join(' ')}
                            />
                            <SummaryField
                                label="Browser"
                                value={[
                                    session.browser,
                                    session.browser_version,
                                ]
                                    .filter(Boolean)
                                    .join(' ')}
                            />
                            <SummaryField
                                label="Screen / viewport"
                                value={
                                    session.screen_resolution &&
                                    session.viewport_size
                                        ? `${session.screen_resolution} / ${session.viewport_size}`
                                        : null
                                }
                            />
                            <SummaryField
                                label="Language"
                                value={[
                                    session.browser_language,
                                    session.site_language,
                                ]
                                    .filter(Boolean)
                                    .join(' · ')}
                            />
                            <SummaryField
                                label="JS confirmed"
                                value={session.js_enabled ? 'Yes' : 'No'}
                            />

                            <div className="col-span-2 sm:col-span-3">
                                <Separator className="my-1" />
                            </div>

                            <SummaryField
                                label="Traffic source"
                                value={session.traffic_source}
                            />
                            <SummaryField
                                label="Referrer"
                                value={session.referrer_domain}
                            />
                            <SummaryField
                                label="Campaign"
                                value={
                                    session.utm_campaign ??
                                    session.campaign_id
                                }
                            />
                            <SummaryField
                                label="UTM source / medium"
                                value={
                                    session.utm_source || session.utm_medium
                                        ? `${session.utm_source ?? '—'} / ${session.utm_medium ?? '—'}`
                                        : null
                                }
                            />
                            <SummaryField
                                label="Affiliate"
                                value={session.affiliate_id}
                            />
                            <SummaryField
                                label="Click ID"
                                value={
                                    session.click_id && (
                                        <span className="font-mono text-xs">
                                            {session.click_id}
                                        </span>
                                    )
                                }
                            />
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                <Zap className="text-muted-foreground size-4" />
                                Traffic quality
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground text-xs">
                                    Risk score
                                </span>
                                <Badge
                                    variant={
                                        isSuspicious
                                            ? 'destructive'
                                            : 'outline'
                                    }
                                    className="font-normal"
                                >
                                    {session.risk_score ?? 0}
                                </Badge>
                            </div>

                            {session.risk_reasons.length > 0 ? (
                                <ul className="space-y-1.5">
                                    {session.risk_reasons.map((reason) => (
                                        <li
                                            key={reason}
                                            className="text-muted-foreground flex items-center gap-2 text-xs"
                                        >
                                            <Bot className="size-3.5" />
                                            {riskReasonLabels[reason] ??
                                                reason}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground text-xs">
                                    No risk signals detected.
                                </p>
                            )}

                            <Separator />

                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground flex items-center gap-1.5">
                                    <Server className="size-3.5" />
                                    Hosting/proxy IP
                                </span>
                                <span>
                                    {session.is_proxy || session.is_hosting
                                        ? 'Yes'
                                        : 'No'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">
                                    Visits from this IP (24h)
                                </span>
                                <span>
                                    {session.same_ip_recent_visits ?? '—'}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">
                            Journey timeline
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {timeline.length === 0 ? (
                            <p className="text-muted-foreground text-sm">
                                No journey events recorded for this session
                                yet.
                            </p>
                        ) : (
                            <div>
                                {timeline.map((entry, index) => (
                                    <TimelineRow
                                        key={`${entry.type}-${index}`}
                                        entry={entry}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

SessionJourney.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Session journey', href: '#' },
    ],
};
