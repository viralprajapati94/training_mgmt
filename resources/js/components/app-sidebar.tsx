import { Link, usePage } from '@inertiajs/react';
import { BookOpen, FolderGit2, LayoutGrid, MapPin, Map, Server, Database } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types/navigation';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

const trainingPartnerNavItems: NavItem[] = [
    {
        title: 'Training Partners',
        icon: MapPin,
        roles: ['admin'],
        items: [
            { title: 'List', href: '/admin/training-partners', roles: ['admin'] },
            { title: 'Add Training Partner', href: '/admin/training-partners/create', roles: ['admin'] },
        ],
    },
];

const trainingCenterNavItems: NavItem[] = [
    {
        title: 'Training Centers',
        icon: MapPin,
        roles: ['training_partner'],
        items: [
            { title: 'List', href: '/tp/training-centers', roles: ['training_partner'] },
            { title: 'Add Training Center', href: '/tp/training-centers/create', roles: ['training_partner'] },
        ],
    },
    {
        title: 'Target Allocation',
        icon: BookOpen,
        roles: ['training_partner'],
        items: [
            { title: 'List', href: '/tp/target-allocations', roles: ['training_partner'] },
            { title: 'New Allocation', href: '/tp/target-allocations/create', roles: ['training_partner'] },
        ],
    },
];

const masterNavItems: NavItem[] = [
    {
        title: 'Master Data',
        icon: Database,
        roles: ['admin', 'training_partner'],
        items: [
            { title: 'States', href: '/admin/states', roles: ['admin'] },
            { title: 'Districts', href: '/admin/districts', roles: ['admin'] },
            { title: 'Talukas', href: '/admin/talukas', roles: ['admin'] },
            { title: 'Cities', href: '/admin/cities', roles: ['admin'] },
            { title: 'Schemes', href: '/admin/schemes', roles: ['admin'] },
            { title: 'Sectors', href: '/admin/sectors', roles: ['admin'] },
            { title: 'Job Roles', href: '/admin/job-roles', roles: ['admin'] },
        ],
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { auth } = usePage().props;
    const roles = auth?.roles ?? [];

    const items: NavItem[] = [
        ...mainNavItems,
        ...(roles.includes('admin') ? trainingPartnerNavItems : []),
        ...(roles.includes('training_partner') ? trainingCenterNavItems : []),
        ...(roles.includes('admin') || roles.includes('training_partner') ? masterNavItems : [])
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={items} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
