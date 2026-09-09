import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { dashboard } from '@/routes';
import { Head, Link, router, usePoll } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    Flag,
    Laptop,
    Leaf,
    MoreHorizontal,
    Newspaper,
    Smartphone,
    Sparkles,
    Tablet,
} from 'lucide-react';
import { useEffect, useState } from 'react';

type PageViewStats = {
    total: number;
    today: number;
    last_viewed_at: string | null;
};

type Visit = {
    click_id: string;
    key: string;
    ip_address: string | null;
    country: string | null;
    referer: string | null;
    browser: string;
    device: string;
    created_at: string;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedVisits = {
    data: Visit[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    per_page: number;
};

type VisitFilters = {
    visit_page: string;
    device: string;
    search: string | null;
    from: string | null;
    to: string | null;
    per_page: number;
};

type DashboardProps = {
    pageViews: {
        articles: PageViewStats;
        'articles-canada': PageViewStats;
        'prime-zone': PageViewStats;
        'prime-zone-canada': PageViewStats;
    };
    recentVisits: PaginatedVisits;
    filters: VisitFilters;
};

const pageLabels: Record<string, string> = {
    articles: 'Articles',
    'prime-zone': 'Prime Zone',
};

const deviceIcons: Record<string, typeof Laptop> = {
    Desktop: Laptop,
    Mobile: Smartphone,
    Tablet: Tablet,
};

function CountryStat({
    label,
    href,
    icon: Icon,
    stats,
}: {
    label: string;
    href: string;
    icon: typeof Leaf;
    stats: PageViewStats;
}) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="border-sidebar-border/70 dark:border-sidebar-border hover:bg-accent/50 flex flex-col gap-1 rounded-lg border p-3 transition-colors"
        >
            <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                <Icon className="size-3.5" />
                {label}
            </span>
            <span className="text-2xl font-semibold">
                {stats.total.toLocaleString()}
            </span>
            <span className="text-muted-foreground text-xs">
                {stats.today.toLocaleString()} click
                {stats.today === 1 ? '' : 's'} today
            </span>
            <span className="text-muted-foreground text-[11px]">
                Last:{' '}
                {stats.last_viewed_at
                    ? new Date(stats.last_viewed_at).toLocaleString()
                    : '—'}
            </span>
        </a>
    );
}

function FunnelCard({
    title,
    icon: Icon,
    uk,
    canada,
}: {
    title: string;
    icon: typeof Newspaper;
    uk: { href: string; stats: PageViewStats };
    canada: { href: string; stats: PageViewStats };
}) {
    return (
        <Card className="border-sidebar-border/70 dark:border-sidebar-border">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <Icon className="text-muted-foreground size-4" />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
                <CountryStat
                    label="United Kingdom"
                    href={uk.href}
                    icon={Flag}
                    stats={uk.stats}
                />
                <CountryStat
                    label="Canada"
                    href={canada.href}
                    icon={Leaf}
                    stats={canada.stats}
                />
            </CardContent>
        </Card>
    );
}

export default function Dashboard({
    pageViews,
    recentVisits,
    filters,
}: DashboardProps) {
    usePoll(10000, { only: ['pageViews', 'recentVisits'] });

    const [searchInput, setSearchInput] = useState(filters.search ?? '');

    function updateFilters(partial: Partial<VisitFilters>) {
        const next = { ...filters, ...partial };

        router.get(
            dashboard().url,
            {
                visit_page: next.visit_page === 'all' ? undefined : next.visit_page,
                device: next.device === 'all' ? undefined : next.device,
                search: next.search || undefined,
                from: next.from || undefined,
                to: next.to || undefined,
                per_page: next.per_page,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    // Debounce the free-text search filter so we're not firing a request
    // on every keystroke.
    useEffect(() => {
        if (searchInput === (filters.search ?? '')) {
            return;
        }

        const timeout = setTimeout(() => {
            updateFilters({ search: searchInput || null });
        }, 400);

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchInput]);

    const numberLinks = recentVisits.links.slice(1, -1);

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-2">
                    <FunnelCard
                        title="Articles"
                        icon={Newspaper}
                        uk={{ href: '/articles', stats: pageViews.articles }}
                        canada={{
                            href: '/articles?debug_country=CA',
                            stats: pageViews['articles-canada'],
                        }}
                    />
                    <FunnelCard
                        title="Prime Zone"
                        icon={Sparkles}
                        uk={{
                            href: '/prime-zone',
                            stats: pageViews['prime-zone'],
                        }}
                        canada={{
                            href: '/prime-zone?debug_country=CA',
                            stats: pageViews['prime-zone-canada'],
                        }}
                    />
                </div>

                <Card className="border-sidebar-border/70 dark:border-sidebar-border gap-4">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">
                            Recent Visits
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {/* Filter bar */}
                        <div className="flex flex-wrap items-end gap-4">
                            <div className="grid gap-1.5">
                                <Label className="text-muted-foreground text-xs font-normal">
                                    Search
                                </Label>
                                <Input
                                    placeholder="Country or click ID"
                                    value={searchInput}
                                    onChange={(e) =>
                                        setSearchInput(e.target.value)
                                    }
                                    className="h-8 w-56"
                                />
                            </div>

                            <div className="grid gap-1.5">
                                <Label className="text-muted-foreground text-xs font-normal">
                                    Page
                                </Label>
                                <Select
                                    value={filters.visit_page}
                                    onValueChange={(value) =>
                                        updateFilters({ visit_page: value })
                                    }
                                >
                                    <SelectTrigger size="sm" className="w-44">
                                        <SelectValue placeholder="All pages" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All pages
                                        </SelectItem>
                                        <SelectItem value="articles">
                                            Articles (UK)
                                        </SelectItem>
                                        <SelectItem value="articles-canada">
                                            Articles (Canada)
                                        </SelectItem>
                                        <SelectItem value="prime-zone">
                                            Prime Zone (UK)
                                        </SelectItem>
                                        <SelectItem value="prime-zone-canada">
                                            Prime Zone (Canada)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-1.5">
                                <Label className="text-muted-foreground text-xs font-normal">
                                    Device
                                </Label>
                                <Select
                                    value={filters.device}
                                    onValueChange={(value) =>
                                        updateFilters({ device: value })
                                    }
                                >
                                    <SelectTrigger size="sm" className="w-40">
                                        <SelectValue placeholder="All devices" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All devices
                                        </SelectItem>
                                        <SelectItem value="Desktop">
                                            Desktop
                                        </SelectItem>
                                        <SelectItem value="Mobile">
                                            Mobile
                                        </SelectItem>
                                        <SelectItem value="Tablet">
                                            Tablet
                                        </SelectItem>
                                        <SelectItem value="Unknown">
                                            Unknown
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-1.5">
                                <Label className="text-muted-foreground text-xs font-normal">
                                    From
                                </Label>
                                <Input
                                    type="date"
                                    value={filters.from ?? ''}
                                    onChange={(e) =>
                                        updateFilters({ from: e.target.value })
                                    }
                                    className="h-8 w-40"
                                />
                            </div>

                            <div className="grid gap-1.5">
                                <Label className="text-muted-foreground text-xs font-normal">
                                    To
                                </Label>
                                <Input
                                    type="date"
                                    value={filters.to ?? ''}
                                    onChange={(e) =>
                                        updateFilters({ to: e.target.value })
                                    }
                                    className="h-8 w-40"
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="border-sidebar-border/70 dark:border-sidebar-border overflow-x-auto rounded-xl border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-sidebar-border/70 dark:border-sidebar-border border-b text-left">
                                        <th className="px-4 py-2 font-medium">
                                            Click ID
                                        </th>
                                        <th className="px-4 py-2 font-medium">
                                            IP Address
                                        </th>
                                        <th className="px-4 py-2 font-medium">
                                            Country
                                        </th>
                                        <th className="px-4 py-2 font-medium">
                                            Page
                                        </th>
                                        <th className="px-4 py-2 font-medium">
                                            Browser
                                        </th>
                                        <th className="px-4 py-2 font-medium">
                                            Device
                                        </th>
                                        <th className="px-4 py-2 font-medium">
                                            Visited
                                        </th>
                                        <th className="px-4 py-2 font-medium">
                                            <span className="sr-only">
                                                Actions
                                            </span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentVisits.data.map((visit, index) => {
                                        const DeviceIcon =
                                            deviceIcons[visit.device];

                                        return (
                                            <tr
                                                key={`${visit.key}-${visit.created_at}-${index}`}
                                                className="border-sidebar-border/70 dark:border-sidebar-border border-b last:border-0"
                                            >
                                                <td className="px-4 py-2 font-mono text-xs font-medium">
                                                    {visit.click_id}
                                                </td>
                                                <td className="px-4 py-2 font-medium">
                                                    {visit.ip_address ?? '—'}
                                                </td>
                                                <td className="text-muted-foreground px-4 py-2">
                                                    {visit.country ?? '—'}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {pageLabels[visit.key] ??
                                                        visit.key}
                                                </td>
                                                <td className="text-muted-foreground px-4 py-2">
                                                    {visit.browser}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <Badge
                                                        variant="outline"
                                                        className="gap-1.5 font-normal"
                                                    >
                                                        {DeviceIcon && (
                                                            <DeviceIcon className="size-3" />
                                                        )}
                                                        {visit.device}
                                                    </Badge>
                                                </td>
                                                <td className="text-muted-foreground px-4 py-2">
                                                    {new Date(
                                                        visit.created_at,
                                                    ).toLocaleString()}
                                                </td>
                                                <td className="px-4 py-2 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                aria-label="Row actions"
                                                            >
                                                                <MoreHorizontal className="size-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onSelect={() =>
                                                                    navigator.clipboard?.writeText(
                                                                        visit.click_id,
                                                                    )
                                                                }
                                                            >
                                                                Copy click ID
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onSelect={() =>
                                                                    navigator.clipboard?.writeText(
                                                                        visit.ip_address ??
                                                                            '',
                                                                    )
                                                                }
                                                            >
                                                                Copy IP address
                                                            </DropdownMenuItem>
                                                            {visit.referer && (
                                                                <DropdownMenuItem
                                                                    asChild
                                                                >
                                                                    <a
                                                                        href={
                                                                            visit.referer
                                                                        }
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                    >
                                                                        Open
                                                                        referrer
                                                                    </a>
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {recentVisits.data.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={8}
                                                className="text-muted-foreground px-4 py-6 text-center"
                                            >
                                                No visits yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer: rows per page + showing count + pagination */}
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <Label className="text-muted-foreground text-xs font-normal">
                                        Rows per page
                                    </Label>
                                    <Select
                                        value={String(filters.per_page)}
                                        onValueChange={(value) =>
                                            updateFilters({
                                                per_page: Number(value),
                                            })
                                        }
                                    >
                                        <SelectTrigger
                                            size="sm"
                                            className="w-18"
                                        >
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="10">
                                                10
                                            </SelectItem>
                                            <SelectItem value="25">
                                                25
                                            </SelectItem>
                                            <SelectItem value="50">
                                                50
                                            </SelectItem>
                                            <SelectItem value="100">
                                                100
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <span className="text-muted-foreground text-sm">
                                    Showing{' '}
                                    {recentVisits.total === 0
                                        ? 0
                                        : recentVisits.from}
                                    -{recentVisits.to ?? 0} of{' '}
                                    {recentVisits.total}
                                </span>
                            </div>

                            {recentVisits.last_page > 1 && (
                                <div className="flex flex-wrap items-center gap-1">
                                    <Button
                                        asChild={
                                            recentVisits.links[0].url !== null
                                        }
                                        disabled={
                                            recentVisits.links[0].url === null
                                        }
                                        variant="outline"
                                        size="sm"
                                    >
                                        {recentVisits.links[0].url !== null ? (
                                            <Link
                                                href={
                                                    recentVisits.links[0].url
                                                }
                                                preserveScroll
                                                preserveState
                                            >
                                                <ChevronLeft />
                                                Previous
                                            </Link>
                                        ) : (
                                            <>
                                                <ChevronLeft />
                                                Previous
                                            </>
                                        )}
                                    </Button>

                                    {numberLinks.map((link, i) => (
                                        <Button
                                            key={i}
                                            asChild={link.url !== null}
                                            disabled={link.url === null}
                                            variant={
                                                link.active
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            size="sm"
                                            className="min-w-8"
                                        >
                                            {link.url !== null ? (
                                                <Link
                                                    href={link.url}
                                                    preserveScroll
                                                    preserveState
                                                    dangerouslySetInnerHTML={{
                                                        __html: link.label,
                                                    }}
                                                />
                                            ) : (
                                                <span
                                                    dangerouslySetInnerHTML={{
                                                        __html: link.label,
                                                    }}
                                                />
                                            )}
                                        </Button>
                                    ))}

                                    <Button
                                        asChild={
                                            recentVisits.links[
                                                recentVisits.links.length - 1
                                            ].url !== null
                                        }
                                        disabled={
                                            recentVisits.links[
                                                recentVisits.links.length - 1
                                            ].url === null
                                        }
                                        variant="outline"
                                        size="sm"
                                    >
                                        {recentVisits.links[
                                            recentVisits.links.length - 1
                                        ].url !== null ? (
                                            <Link
                                                href={
                                                    recentVisits.links[
                                                        recentVisits.links
                                                            .length - 1
                                                    ].url as string
                                                }
                                                preserveScroll
                                                preserveState
                                            >
                                                Next
                                                <ChevronRight />
                                            </Link>
                                        ) : (
                                            <>
                                                Next
                                                <ChevronRight />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
