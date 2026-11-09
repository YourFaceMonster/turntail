/** Width/height from a PNG or WebP header (served art switched to WebP on 2026-11-09). */
export function imageSize(buf:Buffer):{format:'png'|'webp',width:number,height:number}{
 if(buf.toString('ascii',1,4)==='PNG')return {format:'png',width:buf.readUInt32BE(16),height:buf.readUInt32BE(20)};
 if(buf.toString('ascii',0,4)!=='RIFF'||buf.toString('ascii',8,12)!=='WEBP')throw Error('not a PNG or WebP image');
 const chunk=buf.toString('ascii',12,16);
 if(chunk==='VP8X')return {format:'webp',width:1+buf.readUIntLE(24,3),height:1+buf.readUIntLE(27,3)};
 if(chunk==='VP8 ')return {format:'webp',width:buf.readUInt16LE(26)&0x3fff,height:buf.readUInt16LE(28)&0x3fff};
 if(chunk==='VP8L'){const b=buf.subarray(21,25);return {format:'webp',width:1+(b[0]|(b[1]&0x3f)<<8),height:1+((b[1]>>6)|(b[2]<<2)|((b[3]&0x0f)<<10))};}
 throw Error(`unknown WebP chunk ${chunk}`);
}
