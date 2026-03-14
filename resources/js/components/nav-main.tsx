import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types/navigation';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { auth } = usePage().props;
    const roles = auth?.roles ?? [];
    const { isCurrentUrl } = useCurrentUrl();

    const visibleItems = items.filter((item) =>
        item.roles && item.roles.length > 0 ? item.roles.some((role) => roles.includes(role)) : true,
    );

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {visibleItems.map((item) => {
                    const hasSubItems = item.items && item.items.length > 0;

                    // Calculate if any sub-item is active
                    const isSubItemActive = item.items?.some(subItem => isCurrentUrl(subItem.href)) ?? false;
                    const isActive = isCurrentUrl(item.href || '') || isSubItemActive;

                    if (hasSubItems) {
                        // Filter sub items by role
                        const visibleSubItems = item.items!.filter((subItem) =>
                            subItem.roles && subItem.roles.length > 0 ? subItem.roles.some((role) => roles.includes(role)) : true,
                        );

                        if (visibleSubItems.length === 0) return null;

                        return (
                            <Collapsible
                                key={item.title}
                                asChild
                                defaultOpen={isActive}
                                className="group/collapsible"
                            >
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton
                                            tooltip={item.title}
                                            isActive={isActive}
                                        >
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {visibleSubItems.map((subItem) => (
                                                <SidebarMenuSubItem key={subItem.title}>
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={isCurrentUrl(subItem.href)}
                                                    >
                                                        <Link href={subItem.href} prefetch>
                                                            <span>{subItem.title}</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        );
                    }

                    if (!item.href) return null;

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={isActive}
                                tooltip={{ children: item.title }}
                            >
                                <Link href={item.href} prefetch>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
