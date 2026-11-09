import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {resolveTableLayout,tileLayout,stackedPlayedWidth,playedTileLayout} from '../lib/layout';

test('auto table layout follows how the device is held; a Settings pick wins',()=>{
 assert.equal(resolveTableLayout('auto',{width:844,height:390},true),'landscape','phone held sideways');
 assert.equal(resolveTableLayout('auto',{width:390,height:844},true),'portrait','phone held upright');
 assert.equal(resolveTableLayout('auto',{width:844,height:390},false),'landscape','short wide window');
 assert.equal(resolveTableLayout('auto',{width:1440,height:900},false),'portrait','wide desktop window keeps the portrait table');
 assert.equal(resolveTableLayout('auto',{width:0,height:0},true),'portrait','before the first measure');
 assert.equal(resolveTableLayout('portrait',{width:844,height:390},true),'portrait');
 assert.equal(resolveTableLayout('landscape',{width:390,height:844},true),'landscape');
 const page=readFileSync('app/page.tsx','utf8');
 assert.ok(page.includes('const layout=resolveTableLayout(layoutChoice,viewport,touchScreen)'));
 assert.ok(page.includes('useEffect(()=>{setLayoutChoice("auto");},[heldLandscape]);'),'turning the device drops a Settings pick');
 assert.ok(!page.includes('defaultTableLayout'),'no fixed portrait default left');
});

test('stacked landscape gives the floor the whole left column and the played row the hand column',()=>{
 const base={width:826,height:348,floorWidth:446,handWidth:305,handCount:10,cols:5,rows:3,players:3,landscape:true,rpg:true,classicLandscape:true};
 const before=tileLayout(base),after=tileLayout({...base,stackedLandscape:true});
 assert.ok(after.floorHeight>=before.floorHeight+15,`floor ${before.floorHeight} -> ${after.floorHeight}`);
 assert.ok(after.height>=55,'the hand stays readable');
 assert.equal(playedTileLayout(after.floorHeight,stackedPlayedWidth(305),5).height,(305-84-18-20)/5/.76,'played row is sized by the hand column');
 const portrait=tileLayout({...base,landscape:false,classicLandscape:false}),portraitStacked=tileLayout({...base,landscape:false,classicLandscape:false,stackedLandscape:true});
 assert.equal(portraitStacked.floorHeight,portrait.floorHeight,'portrait never stacks');
 const page=readFileSync('app/page.tsx','utf8'),css=readFileSync('app/landscape-stacked.css','utf8'),layout=readFileSync('app/layout.tsx','utf8');
 assert.ok(page.includes('const stackedLandscape=landscapeTable&&!bombEdition'),'Bomb Market keeps its own table');
 assert.ok(css.includes('grid-template-areas:"board played" "board hand"!important'));
 assert.ok(layout.trim().split('\n').filter(l=>l.startsWith('import "./')).pop()?.includes('landscape-stacked.css'),'loaded last');
});
