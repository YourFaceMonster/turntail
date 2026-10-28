import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {renderToStaticMarkup} from 'react-dom/server';
import ClassicTileOrnament from '../app/components/ClassicTileOrnament';
import TileFace from '../app/components/TileFace';
import {StageVisuals} from '../app/components/StageVisuals';

// Approved 0.6.34 vector artwork, rendered without numbers. Moving a number must
// never redraw its rays, star points, small spark, moon, cloud or special frame.
const originalArt=[
 ['ef71eed3966eb7e82001940e3019db62b46f662ae1199978204e662e38c86573','c6bf999205f803b7dc77ef58661c1b3f6d2373d4cd9a5b6471d22a7a6072f5b7','4e0cca435d49d5d2fcc821d492bafb9b0c3dc34403b6a8cbd318604809b77b5d','44d7c8605b88209ebb7a715ba415225ff8fa5609561c58dd5d946ed64acdd0f8'],
 ['d4537c6bd5f6a66630ddfa45a418504a4bb07c70514d01ba7cef6b1a815bfcfd','deddc26a0d39ff252ddb8d9ad6d81373cef855b2428df814910fc2c049d2dd5e','d104d11d42682d7134ba841ed4ed01b464693d533599ae4f1818cfb0f87cd954','e10a321a600e917670fd234e5a538726481d7d451e504547cf30d449a427aefc'],
];
for(let special=0;special<2;special++)for(let s=0;s<4;s++){
 const art=renderToStaticMarkup(<ClassicTileOrnament s={s} special={!!special}/>);
 assert.equal(createHash('sha256').update(art).digest('hex'),originalArt[special][s],'the original engraving remains exactly the approved artwork');
 for(let stage=0;stage<=10;stage++)for(const small of [false,true]){
  const n=special?2:15,face=<TileFace tile={{id:(n-1)*4+s,n,s}} small={small}/>;
  const html=renderToStaticMarkup(stage?<StageVisuals stage={stage}>{face}</StageVisuals>:face);
  assert.ok(html.includes(art),'every material and compact tile embeds the unchanged original suit artwork');
 }
}
console.log('PASS: all eight approved 0.6.34 suit/frame vectors remain unchanged in eleven materials at normal and compact sizes.');
