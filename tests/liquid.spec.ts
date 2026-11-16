import {test,expect} from '@playwright/test';
import {LiquidField} from '../src/components/frost-fluid';

test('height field stays finite, bounded, frame independent and settles completely',()=>{
 const snapshots:Float32Array[]=[];
 for(const hz of [30,60,120]){
  const field=new LiquidField(280,64,217);field.impulse(60,25,1.5,24,{x:.5,y:-.2});
  for(let i=0;i<hz;i++)field.step(1/hz,2,7,1.4);
  expect([...field.height].every(v=>Number.isFinite(v)&&Math.abs(v)<=2)).toBe(true);snapshots.push(field.height.slice());
  for(let i=0;i<hz*7;i++)field.step(1/hz,2,7,1.4);
  expect(field.energy).toBe(0);expect([...field.height].every(v=>v===0)).toBe(true);
 }
 expect(Math.max(...snapshots[0].map((v,i)=>Math.abs(v-snapshots[2][i])))).toBeLessThan(.025);
 const a=new LiquidField(280,64,1),b=new LiquidField(280,64,2);a.impulse(25,20);b.impulse(25,20);expect(a.lastVariation).not.toEqual(b.lastVariation);
 a.step(1/60,0);expect([...a.height].every(v=>v===0)).toBe(true);
});

test('shell deforms asymmetrically, content and targets stay fixed, release settles',async({page})=>{
 await page.goto('/playground/liquid/');await page.getByRole('button',{name:'Extra liquid',exact:true}).click();
 const button=page.getByRole('button',{name:'Press the glass',exact:true});await button.scrollIntoViewIfNeeded();await page.waitForTimeout(1800);const before=(await button.boundingBox())!;
 await page.mouse.move(before.x+before.width*.2,before.y+before.height*.35);await page.mouse.down();await page.waitForTimeout(160);
 const deformation=await button.evaluate(el=>{const s=(el as HTMLElement).style;return ['top','right','bottom','left'].map(k=>Number.parseFloat(s.getPropertyValue('--frost-fluid-'+k)))});
 expect(deformation.every(Number.isFinite)).toBe(true);expect(Math.max(...deformation)-Math.min(...deformation)).toBeGreaterThan(.25);expect(await button.boundingBox()).toEqual(before);
 await page.screenshot({path:'test-results/liquid-contact.png'});await page.mouse.up();await page.mouse.move(0,0);await expect(page.locator('.liquid-count')).toHaveText('1 contacts');
 await expect.poll(()=>button.evaluate(el=>(el as HTMLElement).style.getPropertyValue('--frost-corner-a')),{timeout:6000}).toBe('');
 expect(await button.boundingBox()).toEqual(before);const input=page.getByLabel('A steady place to type',{exact:true});await input.fill('Stable editing under a liquid shell');await expect(input).toHaveValue('Stable editing under a liquid shell');
});

test('dialog entry, exit, nested overlay, toast and loading use the shared shell',async({page})=>{
 await page.goto('/playground/liquid/');await page.getByRole('button',{name:'Open a liquid dialog',exact:true}).click();const dialog=page.getByRole('dialog',{name:'A little room to move'});await expect(dialog).toBeVisible();
 await expect.poll(()=>dialog.evaluate(el=>(el as HTMLElement).style.getPropertyValue('--frost-fluid-top'))).not.toBe('');
 await dialog.getByRole('button',{name:'Save workspace'}).click();await expect(dialog.getByText('Enter a workspace name.')).toBeVisible();
 await dialog.getByRole('button',{name:'Nested settings'}).click();await expect(page.getByRole('switch',{name:'Keep it calm'})).toBeVisible();await page.keyboard.press('Escape');await expect(page.locator('.av-popover-content')).not.toBeVisible();await expect(dialog).toBeVisible();
 await page.keyboard.press('Escape');await expect(page.locator('.av-dialog-content[data-state=closed]')).toHaveCount(1);await expect(dialog).not.toBeVisible();
 await page.getByRole('button',{name:'Send a notification'}).click();const toast=page.locator('.av-toast');await expect(toast).toHaveCount(1);await expect(toast).toHaveAttribute('data-frost','');await expect.poll(()=>toast.evaluate(el=>(el as HTMLElement).style.getPropertyValue('--frost-fluid-top'))).not.toBe('');
 await toast.getByRole('button',{name:'Close toast'}).click();await expect(toast).not.toBeVisible();
 const loading=page.getByRole('button',{name:'Start loading'});await loading.click();await expect(page.getByRole('button',{name:'Stop loading'})).toHaveAttribute('aria-busy','true');await page.getByRole('button',{name:'Stop loading'}).click();
 await page.getByRole('tab',{name:'Activity',exact:true}).click();await expect(page.getByRole('tab',{name:'Activity',exact:true})).toHaveAttribute('aria-selected','true');
});

test('nested providers isolate material and portalled overlays',async({page})=>{
 await page.goto('/playground/liquid/');const cool=page.getByTestId('scope-a'),warm=page.getByTestId('scope-b');
 await expect(cool).toHaveAttribute('data-frost-quality','full');await expect(warm).toHaveAttribute('data-frost-quality','solid');
 expect(await cool.evaluate(el=>getComputedStyle(el).getPropertyValue('--frost-blur'))).toBe('8px');expect(await warm.evaluate(el=>getComputedStyle(el).getPropertyValue('--frost-blur'))).toBe('30px');
 await page.getByRole('button',{name:'Warm scope popover',exact:true}).click();const popup=page.locator('.av-popover-content[data-state=open]');await expect(popup).toHaveAttribute('data-frost-quality','solid');expect(await popup.evaluate(el=>getComputedStyle(el).getPropertyValue('--frost-tint'))).toBe('#ffead5');await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Cool scope popover',exact:true}).click();await expect(popup).toHaveAttribute('data-frost-quality','full');expect(await popup.evaluate(el=>getComputedStyle(el).getPropertyValue('--frost-blur'))).toBe('8px');
});

test('fallback material remains frosted on ordinary DOM and replaced native controls',async({page})=>{
 await page.goto('/playground/stress/');const note=page.getByLabel('Your note',{exact:true});await note.scrollIntoViewIfNeeded();await note.fill('Native textarea content stays editable.');
 const shell=page.locator('.av-textarea-wrap').first();await expect(shell).toHaveAttribute('data-frost','');expect(await note.evaluate(el=>el.querySelectorAll('canvas').length)).toBe(0);
 const material=await shell.evaluate(el=>{const s=getComputedStyle(el,'::before');return{blur:s.backdropFilter,texture:s.backgroundImage,body:s.backgroundColor}});expect(material.blur).toContain('blur(');expect(material.texture).toContain('data:image/png');expect(material.body).not.toBe('rgba(0, 0, 0, 0)');
 await page.goto('/components/native-select/');const select=page.locator('.collection-demo select').first();await expect(select).toBeVisible();await expect(select.locator('..')).toHaveAttribute('data-frost','');expect(await select.evaluate(el=>el.querySelectorAll('canvas').length)).toBe(0);
 await page.screenshot({path:'test-results/frost-native-controls.png'});
});
