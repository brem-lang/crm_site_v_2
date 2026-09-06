import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';
import { Head, usePoll } from '@inertiajs/react';
import { Newspaper, Sparkles } from 'lucide-react';

type PageViewStats = {
    total: number;
    today: number;
    last_viewed_at: string | null;
};

type DashboardProps = {
    pageViews: {
        articles: PageViewStats;
        'prime-zone': PageViewStats;
    };
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

export default function Dashboard({ pageViews }: DashboardProps) {
    usePoll(15000, { only: ['pageViews'] });

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
