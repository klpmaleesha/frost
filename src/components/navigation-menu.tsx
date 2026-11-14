'use client';
import { NavigationMenu as P } from 'radix-ui';
import { withClass } from './utils';
export const NavigationMenu=withClass(P.Root,'av-navigation-menu');export const NavigationMenuList=withClass(P.List,'av-navigation-list frost-surface');export const NavigationMenuItem=P.Item;export const NavigationMenuTrigger=withClass(P.Trigger,'av-navigation-trigger');export const NavigationMenuContent=withClass(P.Content,'av-navigation-content av-popover-content');export const NavigationMenuLink=withClass(P.Link,'av-navigation-link');export const NavigationMenuIndicator=P.Indicator;
