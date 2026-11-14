'use client';
import { createContext, useContext, useId, type ComponentProps, type ReactNode } from 'react';
import { FormProvider, Controller, useFormContext, type ControllerProps, type FieldValues, type FieldPath } from 'react-hook-form';
import { Slot } from 'radix-ui';
export { useForm } from 'react-hook-form';
export const Form=FormProvider;
const FieldContext=createContext({name:''});const ItemContext=createContext({id:''});
export function FormField<T extends FieldValues,N extends FieldPath<T>>(props:ControllerProps<T,N>){return <FieldContext.Provider value={{name:props.name}}><Controller {...props}/></FieldContext.Provider>;}
export function FormItem({className='',...props}:ComponentProps<'div'>){const id=useId();return <ItemContext.Provider value={{id}}><div className={`av-field ${className}`} {...props}/></ItemContext.Provider>;}
export function useFormField(){const{name}=useContext(FieldContext);const{id}=useContext(ItemContext);const{getFieldState,formState}=useFormContext();return {id,name,...getFieldState(name,formState)};}
export function FormLabel(props:ComponentProps<'label'>){const{id}=useFormField();return <label htmlFor={`${id}-control`} className="av-label" {...props}/>;}
export function FormControl({children}:{children:ReactNode}){const{id,error}=useFormField();return <Slot.Root id={`${id}-control`} aria-invalid={!!error} aria-describedby={`${id}-description${error?` ${id}-error`:''}`}>{children}</Slot.Root>;}
export function FormDescription(props:ComponentProps<'p'>){const{id}=useFormField();return <p id={`${id}-description`} className="av-hint" {...props}/>;}
export function FormMessage(props:ComponentProps<'p'>){const{id,error}=useFormField();return error?<p id={`${id}-error`} role="alert" className="av-hint av-error" {...props}>{String(error.message||'Check this field.')}</p>:null;}
