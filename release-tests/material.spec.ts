import {test,expect} from '@playwright/test';

test('production home ships the CSS material without visiting the component gallery',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');const button=page.getByRole('button',{name:'Meet the material'});await expect(button).toHaveAttribute('data-frost','');
 const material=await button.evaluate(el=>{const s=getComputedStyle(el,'::before');return{blur:s.backdropFilter,texture:s.backgroundImage,body:s.backgroundColor,display:s.display}});expect(material.display).not.toBe('none');expect(material.blur).toContain('blur(');expect(material.texture).toContain('data:image/png');expect(material.body).not.toBe('rgba(0, 0, 0, 0)');expect(errors).toEqual([]);
 await page.screenshot({path:'test-results/production-home-frost.png',fullPage:true});
});

test('built liquid scene, nested overlays, native controls and mobile docs work',async({page})=>{
 await page.addInitScript(()=>{const canvases=new Set<HTMLCanvasElement>(),original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,...args:Parameters<typeof original>){const context=original.apply(this,args);if(args[0]==='webgl'&&context){canvases.add(this);(window as unknown as {frostContextCount:number}).frostContextCount=canvases.size}return context} as typeof original});
 await page.goto('/playground/liquid/');await expect(page.locator('.liquid-main-button')).toHaveAttribute('data-frost-renderer','webgl');
 expect(await page.evaluate(()=>(window as unknown as {frostContextCount:number}).frostContextCount)).toBe(1);
 await page.getByRole('button',{name:'Extra liquid',exact:true}).click();await page.reload();await expect(page.getByLabel('Liquid strength')).toHaveValue('1.8');
 await page.getByRole('button',{name:'Open a liquid dialog',exact:true}).click();const dialog=page.getByRole('dialog',{name:'A little room to move'});await expect(dialog).toBeVisible();await dialog.getByLabel('Workspace title').fill('Production proof');await dialog.getByRole('button',{name:'Save workspace'}).click();await expect(dialog).not.toBeVisible();
 await page.getByRole('button',{name:'Send a notification'}).click();await expect(page.locator('.av-toast')).toHaveAttribute('data-frost','');
 await page.setViewportSize({width:390,height:844});await page.goto('/docs/motion/');await page.getByText('Guide navigation',{exact:true}).click();await expect(page.locator('.mobile-guide-navigation a').first()).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.goto('/components/textarea/');const textarea=page.locator('.collection-demo textarea');await expect(textarea.locator('..')).toHaveAttribute('data-frost','');await textarea.fill('The production caret stays steady.');await expect(textarea).toHaveValue('The production caret stays steady.');
});

test('production respects reduced motion and survives unavailable preference storage',async({browser})=>{
 const context=await browser.newContext({reducedMotion:'reduce',hasTouch:true,viewport:{width:390,height:844}});await context.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked','SecurityError')}})});const page=await context.newPage();await page.goto('/playground/liquid/');await page.getByRole('button',{name:'Press the glass',exact:true}).tap();await expect(page.locator('.liquid-count')).toHaveText('1 contacts');await expect(page.locator('.liquid-main-button')).toHaveAttribute('data-frost-motion','off');await context.close();
});
