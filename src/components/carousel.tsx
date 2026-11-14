'use client';
import useEmblaCarousel, {type UseEmblaCarouselType} from 'embla-carousel-react';
import { createContext, useContext, useEffect, useState, type HTMLAttributes, type ComponentProps } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from './button';
const Context=createContext<{ref:UseEmblaCarouselType[0];api:UseEmblaCarouselType[1];prev:boolean;next:boolean}|null>(null);
function useCarousel(){const ctx=useContext(Context);if(!ctx)throw new Error('Carousel controls must be inside Carousel');return ctx;}
export function Carousel({children,className='',...props}:HTMLAttributes<HTMLDivElement>){const[ref,api]=useEmblaCarousel({align:'start'});const[state,setState]=useState({prev:false,next:false});useEffect(()=>{if(!api)return;const update=()=>setState({prev:api.canScrollPrev(),next:api.canScrollNext()});update();api.on('select',update);api.on('reInit',update);return()=>{api.off('select',update);api.off('reInit',update)}},[api]);return <Context.Provider value={{ref,api,...state}}><div role="region" aria-roledescription="carousel" aria-label="Content carousel" className={`av-carousel ${className}`} onKeyDown={e=>{if(e.key==='ArrowLeft'){e.preventDefault();api?.scrollPrev()}if(e.key==='ArrowRight'){e.preventDefault();api?.scrollNext()}}} {...props}>{children}</div></Context.Provider>;}
export function CarouselContent({children,...props}:HTMLAttributes<HTMLDivElement>){const{ref}=useCarousel();return <div ref={ref} className="av-carousel-viewport"><div className="av-carousel-content" {...props}>{children}</div></div>;}
export function CarouselItem(props:HTMLAttributes<HTMLDivElement>){return <div role="group" aria-roledescription="slide" {...props} className={`av-carousel-item ${props.className||''}`}/>;}
export function CarouselPrevious(props:ComponentProps<typeof Button>){const{api,prev}=useCarousel();return <Button variant="secondary" size="icon" aria-label="Previous slide" disabled={!prev} onClick={()=>api?.scrollPrev()} {...props}><ArrowLeft size={15}/></Button>;}
export function CarouselNext(props:ComponentProps<typeof Button>){const{api,next}=useCarousel();return <Button variant="secondary" size="icon" aria-label="Next slide" disabled={!next} onClick={()=>api?.scrollNext()} {...props}><ArrowRight size={15}/></Button>;}
