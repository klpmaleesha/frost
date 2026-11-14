import { createElement, forwardRef, type ComponentPropsWithoutRef, type ElementType } from 'react';
export function withClass<T extends ElementType>(Component:T,base:string){
  type Props=ComponentPropsWithoutRef<T>&{className?:string};
  const Styled=forwardRef<HTMLElement,Props>(function Styled(props,ref){const {className='',...rest}=props as Props&{className?:string};return createElement(Component as ElementType,{...rest,ref,className:`${base} ${className}`});});
  return Styled;
}
