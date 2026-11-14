'use client';
import { OTPInput, OTPInputContext } from 'input-otp';
import { useContext, type ComponentProps } from 'react';
export function InputOTP({className='',containerClassName='',...props}:ComponentProps<typeof OTPInput>){return <OTPInput containerClassName={`av-input-otp ${containerClassName}`} className={className} {...props}/>;}
export function InputOTPGroup(props:ComponentProps<'div'>){return <div {...props} className={`av-input-otp-group ${props.className||''}`}/>;}
export function InputOTPSlot({index}:{index:number}){const context=useContext(OTPInputContext);const slot=context?.slots[index];return <div className={`av-input-otp-slot ${slot?.isActive?'active':''}`}>{slot?.char}{slot?.hasFakeCaret&&<span className="av-otp-caret"/>}</div>;}
export function InputOTPSeparator(){return <span role="presentation" className="av-otp-separator">−</span>;}
