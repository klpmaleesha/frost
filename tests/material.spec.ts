import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {MotionPredictor,springStep,resist} from '../src/components/frost-physics';
test('spring converges across frame rates; resistance and prediction stay bounded',()=>{
 for(const hz of [30,60,120]){let s={position:0,velocity:0};for(let i=0;i<hz*3;i++)s=springStep(s,1,1/hz,{stiffness:240,damping:26,mass:1});expect(Math.abs(s.position-1)).toBeLessThan(.001);}
 expect(Math.abs(resist(10000,10))).toBeLessThanOrEqual(10);
 const p=new MotionPredictor();for(let i=0;i<20;i++)p.update({x:i*20,y:0,time:i*16});expect(p.predict(40).x-380).toBeLessThanOrEqual(70);p.update({x:340,y:0,time:320});expect(p.predict(20).x).toBeLessThan(340);
});
test('five live controls preserve precise input and nested overlays',async({page})=>{
 await page.goto('/__test/all/');await expect(page.getByRole('heading',{name:'Glass that feels a little more alive.'})).toBeVisible();
 const input=page.getByLabel('A place for your thoughts',{exact:true});await input.fill('No lag, no jumping caret.');await expect(input).toHaveValue('No lag, no jumping caret.');
 const slider=page.getByRole('slider',{name:'Find your balance',exact:true});await slider.focus();await page.keyboard.press('ArrowRight');await expect(slider).toHaveAttribute('aria-valuenow','63');await page.keyboard.press('End');await expect(slider).toHaveAttribute('aria-valuenow','100');
 await page.getByRole('button',{name:'Quick settings',exact:true}).click();await expect(page.getByText('Make room for focus')).toBeVisible();await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Open a dialog',exact:true}).click();const d=page.getByRole('dialog',{name:'Space to think.'});await expect(d).toBeVisible();await page.getByRole('button',{name:'Nested popover',exact:true}).click();await expect(page.getByLabel('Project note')).toBeVisible();await page.keyboard.press('Escape');await expect(page.getByLabel('Project note')).not.toBeVisible();await expect(d).toBeVisible();await page.keyboard.press('Escape');await expect(d).not.toBeVisible();
});
test('local lighting tracks reversals without moving the button or leaving stuck pressure',async({page})=>{
 await page.goto('/__test/all/');await page.evaluate(()=>document.fonts.ready);const b=page.getByRole('button',{name:'Feel the difference',exact:true});await b.scrollIntoViewIfNeeded();const before=await b.boundingBox();expect(before).not.toBeNull();const r=before!;
 await page.mouse.move(r.x+15,r.y+r.height/2);await page.waitForTimeout(150);const left=await b.evaluate(el=>Number.parseFloat((el as HTMLElement).style.getPropertyValue('--frost-light-x')));
 await page.mouse.move(r.x+r.width-15,r.y+r.height/2,{steps:16});await page.waitForTimeout(120);const right=await b.evaluate(el=>Number.parseFloat((el as HTMLElement).style.getPropertyValue('--frost-light-x')));expect(right).toBeGreaterThan(left+40);
 for(let i=0;i<12;i++)await page.mouse.move(r.x+(i%2?2:r.width-2),r.y+(i%2?2:r.height-2));
 await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down();await page.waitForTimeout(800);await page.mouse.up();await page.mouse.move(5,80);await page.waitForTimeout(1400);
 expect(await b.boundingBox()).toEqual(before);expect(await b.evaluate(el=>parseFloat((el as HTMLElement).style.getPropertyValue('--frost-pressure')||'0'))).toBeLessThan(.01);await expect(page.locator('.telemetry')).toContainText('Scheduler asleep');
});
test('comparison modes, backgrounds and solid fallbacks work',async({page})=>{
 await page.goto('/__test/all/');const backgrounds=page.getByRole('group',{name:'Preview background'});for(const name of ['Photography','Typography','Plain','Graphite']){await backgrounds.getByRole('button',{name,exact:true}).click();await expect(backgrounds.getByRole('button',{name,exact:true})).toHaveAttribute('aria-pressed','true');}
 for(const name of ['Flat','Static glass','Living glass']){await page.getByRole('button',{name,exact:true}).click();await expect(page.getByRole('button',{name,exact:true})).toHaveAttribute('aria-pressed','true');}
 await page.getByLabel('Rendering quality',{exact:true}).selectOption('solid');expect(await page.getByRole('button',{name:'Feel the difference'}).evaluate(el=>getComputedStyle(el).backdropFilter)).toBe('none');
 await page.screenshot({path:'test-results/material-lab-desktop.png',fullPage:true});
});
test('reduced motion and touch retain usable controls; mobile does not overflow',async({browser})=>{
 const context=await browser.newContext({reducedMotion:'reduce',hasTouch:true,isMobile:true,viewport:{width:390,height:844}});const page=await context.newPage();await page.goto('/__test/all/');await expect(page.locator('html')).toHaveAttribute('data-frost-motion','off');
  await page.getByRole('button',{name:'Feel the difference'}).tap();await expect(page.locator('.large-button-row>span')).toHaveText('01 contacts');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:'test-results/material-lab-mobile.png',fullPage:true});await context.close();
});
test('lab and modal pass automated WCAG A/AA rules',async({page})=>{
 await page.goto('/__test/all/');const check=()=>new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect((await check()).violations).toEqual([]);await page.getByRole('button',{name:'Open a dialog',exact:true}).click();expect((await check()).violations).toEqual([]);
});
