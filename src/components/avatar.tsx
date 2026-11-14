'use client';
import { Avatar as Primitive } from 'radix-ui';
export interface AvatarProps { name: string; src?: string; size?: 'sm' | 'md' | 'lg'; color?: 'peach' | 'sage' | 'lilac' | 'blue'; className?: string }
export function Avatar({name, src, size = 'md', color = 'sage', className = ''}: AvatarProps) { return <Primitive.Root className={`av-avatar av-avatar--${size} av-avatar--${color} ${className}`} role="img" aria-label={name}>{src && <Primitive.Image src={src} alt=""/>}<Primitive.Fallback>{name.split(' ').map(n => n[0]).slice(0,2).join('')}</Primitive.Fallback></Primitive.Root>; }
