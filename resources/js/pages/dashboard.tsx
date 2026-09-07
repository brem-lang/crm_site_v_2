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
    Laptop,
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
    country: string | null;
    from: string | null;
    to: string | null;
    per_page: number;
};

type DashboardProps = {
    pageViews: {
        articles: PageViewStats;
        'prime-zone': PageViewStats;
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

function PageViewCard({
    title,
    href,
    icon: Icon,
    stats,
}: {
    title: string;
    href: string;
    icon: typeof Newspaper;
    stats: PageViewStats;
}) {
    return (
        <Card className="border-sidebar-border/70 dark:border-sidebar-border">
            <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2">
                    <Icon className="text-muted-foreground size-4" />
                    <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline"
                    >
                        {title}
                    </a>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
                <div className="text-3xl font-semibold">
                    {stats.total.toLocaleString()}
                </div>
                <p className="text-muted-foreground text-sm">
                    {stats.today.toLocaleString()} click
                    {stats.today === 1 ? '' : 's'} today
                </p>
                <p className="text-muted-foreground text-xs">
                    Last clicked{' '}
                    {stats.last_viewed_at
                        ? new Date(stats.last_viewed_at).toLocaleString()
                        : '—'}
                </p>
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

    const [countryInput, setCountryInput] = useState(filters.country ?? '');

    function updateFilters(partial: Partial<VisitFilters>) {
        const next = { ...filters, ...partial };

        router.get(
            dashboard().url,
            {
                visit_page: next.visit_page === 'all' ? undefined : next.visit_page,
                device: next.device === 'all' ? undefined : next.device,
                country: next.country || undefined,
                from: next.from || undefined,
                to: next.to || undefined,
                per_page: next.per_page,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    // Debounce the free-text country filter so we're not firing a
    // request on every keystroke.
    useEffect(() => {
        if (countryInput === (filters.country ?? '')) {
            return;
        }

        const timeout = setTimeout(() => {
            updateFilters({ country: countryInput || null });
        }, 400);

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [countryInput]);

    const numberLinks = recentVisits.links.slice(1, -1);

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-2">
                    <PageViewCard
                        title="Articles"
                        href="/articles"
                        icon={Newspaper}
                        stats={pageViews.articles}
                    />
                    <PageViewCard
                        title="Prime Zone"
                        href="/prime-zone"
                        icon={Sparkles}
                        stats={pageViews['prime-zone']}
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
                                    Country
                                </Label>
                                <Input
                                    placeholder="e.g. United States"
                                    value={countryInput}
                                    onChange={(e) =>
                                        setCountryInput(e.target.value)
                                    }
                                    className="h-8 w-48"
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
                                            Articles
                                        </SelectItem>
                                        <SelectItem value="prime-zone">
                                            Prime Zone
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
                                                colSpan={7}
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
