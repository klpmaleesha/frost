import type { HTMLAttributes } from 'react';
export function Card({className = '', ...props}: HTMLAttributes<HTMLDivElement>) {return <div className={`av-card ${className}`} {...props}/>;}
export function CardHeader({className = '', ...props}: HTMLAttributes<HTMLDivElement>) {return <div className={`av-card-header ${className}`} {...props}/>;}
export function CardTitle({className = '', ...props}: HTMLAttributes<HTMLHeadingElement>) {return <h3 className={`av-card-title ${className}`} {...props}/>;}
export function CardDescription({className = '', ...props}: HTMLAttributes<HTMLParagraphElement>) {return <p className={`av-card-description ${className}`} {...props}/>;}
export function CardContent({className = '', ...props}: HTMLAttributes<HTMLDivElement>) {return <div className={`av-card-content ${className}`} {...props}/>;}
export function CardFooter({className = '', ...props}: HTMLAttributes<HTMLDivElement>) {return <div className={`av-card-footer ${className}`} {...props}/>;}
