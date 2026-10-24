import {materialTextureCell} from './stage-texture.ts';
/** One shared mesh/atlas replaces hundreds of independently composited DOM faces. */
export const GPU_TILE_STRIDE=12;
export const TILE_ATLAS_CELL={width:192,height:264,columns:8,inset:6} as const;
export type GpuCamera={width:number,height:number,tilt:number,scale:number};
export function projectEntrancePoint(x:number,y:number,z:number,camera:GpuCamera){
 const c=Math.cos(camera.tilt),s=Math.sin(camera.tilt);
 const depth=(y-camera.height/2)*s+z*c,factor=camera.scale/(1-depth*camera.scale/1000);
 return {x:camera.width/2+(x-camera.width/2)*factor,y:camera.height/2+((y-camera.height/2)*c-z*s)*factor};
}
/** CSS cubic-bezier(.25,.45,.3,1), shared by the table camera and tile camera. */
export function entranceCameraEase(t:number){
 t=Math.max(0,Math.min(1,t));if(t===0||t===1)return t;let lo=0,hi=1;
 for(let i=0;i<18;i++){const m=(lo+hi)/2,x=3*(1-m)*(1-m)*m*.25+3*(1-m)*m*m*.3+m*m*m;if(x<t)lo=m;else hi=m;}
 const m=(lo+hi)/2;return 3*(1-m)*(1-m)*m*.45+3*(1-m)*m*m+m*m*m;
}
/** Rounded ivory prism, with a narrow bevel so the body keeps its solid appearance. */
export function entranceTileMesh(){
 const vertices:number[]=[],ring:{x:number,y:number}[]=[];
 for(let corner=0;corner<4;corner++)for(let step=0;step<=6;step++){
  const a=(-Math.PI/2+corner*Math.PI/2)+step*Math.PI/12;
  const cx=corner===0||corner===1?.38:-.38,cy=corner<2?(corner===0?-.41:.41):(corner===2?.41:-.41);
  ring.push({x:cx+Math.cos(a)*.12,y:cy+Math.sin(a)*.09});
 }
 const vertex=(x:number,y:number,z:number,u:number,v:number,nx:number,ny:number,nz:number,material:number)=>vertices.push(x,y,z,u,v,nx,ny,nz,material);
 // A soft contact shadow is one quad, drawn before the solid mesh.
 for(const [x,y] of [[0,0],[1,0],[0,1],[0,1],[1,0],[1,1]])vertex(x-.5,y-.5,-1,x,y,0,0,1,2);
 for(let i=0;i<ring.length;i++){
  const a=ring[i],b=ring[(i+1)%ring.length];
  vertex(0,0,0,.5,.5,0,0,1,1);vertex(a.x,a.y,0,a.x+.5,a.y+.5,0,0,1,1);vertex(b.x,b.y,0,b.x+.5,b.y+.5,0,0,1,1);
  // No second cap directly beneath the art: shallow depth buffers made the
  // two almost coplanar surfaces flicker as the camera leaned over them.
  const n=Math.hypot((a.x+b.x)/2,(a.y+b.y)/2),nx=(a.x+b.x)/2/n,ny=(a.y+b.y)/2/n;
  const rows=[{z:-.012,k:.98},{z:-.09,k:1},{z:-.91,k:1},{z:-1,k:.96}];
  for(let r=1;r<rows.length;r++){
   const p=rows[r-1],q=rows[r];
   for(const [point,row] of [[a,p],[a,q],[b,p],[b,p],[a,q],[b,q]] as const)vertex(point.x*row.k,point.y*row.k,row.z,0,0,nx,ny,r===1?.3:0,0);
  }
 }
 return new Float32Array(vertices);
}
const vertexSource=`#version 300 es
precision highp float;
layout(location=0) in vec3 a_position;
layout(location=1) in vec2 a_uv;
layout(location=2) in vec3 a_normal;
layout(location=3) in float a_material;
layout(location=4) in vec4 i_pose;
layout(location=5) in vec4 i_size;
layout(location=6) in vec4 i_meta;
uniform vec2 u_view;
uniform vec3 u_camera;
out vec2 v_uv;
out vec3 v_normal;
out float v_material;
out float v_slot;
out float v_faceBlend;
out float v_alpha;
out float v_shadowSoftness;
out vec3 v_surface;
void main(){
 vec3 p=vec3(a_position.xy*i_size.xy,a_position.z*i_size.z);
 v_uv=a_uv;v_material=a_material;v_slot=0.;v_faceBlend=0.;v_alpha=i_meta.z;v_surface=a_position;v_shadowSoftness=.055;
 if(a_material>1.5){float height=max(0.,i_pose.z-i_size.z);p.xy=p.xy*(1.12+min(height,160.)/650.);p.z=.35-i_pose.z;v_alpha*=1.-min(height/240.,.75);v_shadowSoftness=.075+min(height,180.)/950.;}
 else if(a_material>.5){
  v_slot=i_meta.x;v_faceBlend=smoothstep(0.,1.,i_size.w/3.14159265359);
 }else{v_alpha*=i_meta.y;}
 float c=cos(i_pose.w),s=sin(i_pose.w);
 p.xy=mat2(c,s,-s,c)*p.xy;if(a_material>1.5)p.xy+=vec2(2.,4.)+vec2(.28,.38)*max(0.,i_pose.z-i_size.z);p+=i_pose.xyz;
 v_normal=vec3(mat2(c,s,-s,c)*a_normal.xy,a_normal.z);
 vec2 centered=p.xy-u_view*.5;
 float depth=centered.y*u_camera.y+p.z*u_camera.x;
 float projectionW=max(.05,1.-depth*u_camera.z/1000.);
 float factor=u_camera.z/projectionW;
 vec2 screen=u_view*.5+vec2(centered.x,centered.y*u_camera.x-p.z*u_camera.y)*factor;
 // Retain homogeneous W so texture interpolation follows the perspective,
 // instead of shearing along the two triangles of a nearly horizontal tile.
 gl_Position=vec4(vec3(screen.x/u_view.x*2.-1.,1.-screen.y/u_view.y*2.,-depth/4096.)*projectionW,projectionW);
}`;
const fragmentSource=`#version 300 es
precision highp float;
uniform sampler2D u_atlas;
uniform vec3 u_body;
uniform vec2 u_atlasGrid;
in vec2 v_uv;
in vec3 v_normal;
in float v_material;
in float v_slot;
in float v_faceBlend;
in float v_alpha;
in float v_shadowSoftness;
in vec3 v_surface;
out vec4 color;
void main(){
 if(v_alpha<.001)discard;
 if(v_material>1.5){
  vec2 q=abs(v_uv-.5)-vec2(.32,.35);
  float d=length(max(q,0.))+min(max(q.x,q.y),0.)-.09;
  float aa=max(fwidth(d),.004);
  color=vec4(.035,.025,.02,(1.-smoothstep(-aa,v_shadowSoftness+aa,d))*.21*v_alpha);
 }else if(v_material>.5){
  vec2 cell=vec2(mod(v_slot,u_atlasGrid.x),floor(v_slot/u_atlasGrid.x));
  vec2 uv=(cell+clamp(v_uv,.002,.998))/u_atlasGrid;
  vec2 backUV=clamp(v_uv,.002,.998)/u_atlasGrid;
  color=mix(texture(u_atlas,backUV),texture(u_atlas,uv),v_faceBlend);color.a*=v_alpha;
 }else{
  float light=.79+.21*max(0.,dot(normalize(v_normal),normalize(vec3(-.5,-.7,.8))));
  float grain=(.5+.5*sin(v_surface.x*19.+v_surface.z*3.)*sin(v_surface.y*23.));
  float bevel=pow(max(0.,dot(normalize(v_normal),normalize(vec3(-.35,-.45,1.)))),18.)*.11;
  color=vec4(u_body*(light+(grain-.5)*.018)+vec3(bevel*.95,bevel*.89,bevel*.75),v_alpha);
 }
 if(color.a<.005)discard;
}`;
export class EntranceGpu{
 private gl:WebGL2RenderingContext;private program:WebGLProgram;private vao:WebGLVertexArrayObject;
 private mesh:WebGLBuffer;private instances:WebGLBuffer;private texture:WebGLTexture;private count:number;
 private uniforms:{view:WebGLUniformLocation|null,camera:WebGLUniformLocation|null,grid:WebGLUniformLocation|null};
 constructor(canvas:HTMLCanvasElement,atlas:HTMLCanvasElement,count:number,width:number,height:number,body:[number,number,number]=[1,.983,.937]){
  const gl=canvas.getContext('webgl2',{alpha:true,antialias:true,premultipliedAlpha:false,powerPreference:'high-performance'});
  if(!gl)throw Error('WebGL2 unavailable');this.gl=gl;
  const compile=(type:number,source:string)=>{const shader=gl.createShader(type)!;gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){const message=gl.getShaderInfoLog(shader);gl.deleteShader(shader);throw Error(message||'Tile shader compilation failed');}return shader;};
  const vs=compile(gl.VERTEX_SHADER,vertexSource),fs=compile(gl.FRAGMENT_SHADER,fragmentSource),program=gl.createProgram()!;
  gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program)||'Tile shader link failed');
  this.program=program;gl.useProgram(program);this.vao=gl.createVertexArray()!;gl.bindVertexArray(this.vao);
  this.mesh=gl.createBuffer()!;gl.bindBuffer(gl.ARRAY_BUFFER,this.mesh);const data=entranceTileMesh();this.count=data.length/9;gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
  for(const [location,size,offset] of [[0,3,0],[1,2,3],[2,3,5],[3,1,8]]){gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,size,gl.FLOAT,false,36,offset*4);}
  this.instances=gl.createBuffer()!;gl.bindBuffer(gl.ARRAY_BUFFER,this.instances);gl.bufferData(gl.ARRAY_BUFFER,count*GPU_TILE_STRIDE*4,gl.DYNAMIC_DRAW);
  for(let i=0;i<3;i++){gl.enableVertexAttribArray(4+i);gl.vertexAttribPointer(4+i,4,gl.FLOAT,false,GPU_TILE_STRIDE*4,i*16);gl.vertexAttribDivisor(4+i,1);}
  this.texture=gl.createTexture()!;gl.bindTexture(gl.TEXTURE_2D,this.texture);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,atlas);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.generateMipmap(gl.TEXTURE_2D);
  this.uniforms={view:gl.getUniformLocation(program,'u_view'),camera:gl.getUniformLocation(program,'u_camera'),grid:gl.getUniformLocation(program,'u_atlasGrid')};
  gl.uniform3fv(gl.getUniformLocation(program,'u_body'),body);gl.uniform2f(this.uniforms.grid,TILE_ATLAS_CELL.columns,atlas.height/TILE_ATLAS_CELL.height);gl.uniform1i(gl.getUniformLocation(program,'u_atlas'),0);
  const ratio=Math.min(window.devicePixelRatio||1,2,Math.sqrt(2200000/(width*height)));
  canvas.width=Math.max(1,Math.round(width*ratio));canvas.height=Math.max(1,Math.round(height*ratio));gl.viewport(0,0,canvas.width,canvas.height);
  gl.enable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.clearColor(0,0,0,0);
 }
 draw(data:Float32Array,camera:GpuCamera){
  const gl=this.gl;if(gl.isContextLost())throw Error('Tile graphics context lost');
  gl.useProgram(this.program);gl.bindVertexArray(this.vao);gl.bindBuffer(gl.ARRAY_BUFFER,this.instances);gl.bufferSubData(gl.ARRAY_BUFFER,0,data);
  gl.uniform2f(this.uniforms.view,camera.width,camera.height);gl.uniform3f(this.uniforms.camera,Math.cos(camera.tilt),Math.sin(camera.tilt),camera.scale);
  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.depthMask(false);gl.drawArraysInstanced(gl.TRIANGLES,0,6,data.length/GPU_TILE_STRIDE);
  gl.depthMask(true);gl.drawArraysInstanced(gl.TRIANGLES,6,this.count-6,data.length/GPU_TILE_STRIDE);
 }
 destroy(){const gl=this.gl;gl.deleteTexture(this.texture);gl.deleteBuffer(this.mesh);gl.deleteBuffer(this.instances);gl.deleteVertexArray(this.vao);gl.deleteProgram(this.program);}
}

const materialImages=new Map<string,Promise<HTMLImageElement>>();
function image(src:string){
 const cached=materialImages.get(src);if(cached)return cached;
 const pending=new Promise<HTMLImageElement>((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>{materialImages.delete(src);reject(Error('Tile artwork unavailable'));};img.src=src;});
 // Reuse decoded local materials, never transient face blobs or private hand art.
 if(src.startsWith('/'))materialImages.set(src,pending);return pending;
}
/** Rasterise the approved SVG art once, before any camera or tile starts moving. */
export async function entranceTileAtlas(faces:(SVGSVGElement|null)[],backSvg?:SVGSVGElement|null){
 const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');if(!ctx)throw Error('Tile atlas unavailable');
 const {width:w,height:h,columns,inset}=TILE_ATLAS_CELL;canvas.width=columns*w;canvas.height=Math.ceil((faces.length+2)/columns)*h;
 const urls:string[]=[];
 try{
  // External SVG images are blocked when decoded from a blob. Embed just the
  // current material crop once, before motion, rather than dropping the texture.
  const materials=new Map<number,string>(),sources=[...faces,backSvg].flatMap(svg=>svg?Array.from(svg.querySelectorAll<SVGImageElement>('image[data-stage-texture]')):[]);
  for(const source of sources){const stage=Number(source.getAttribute('data-stage-texture'));if(materials.has(stage))continue;
   const texture=await image(source.getAttribute('href')!),cell=materialTextureCell(stage,texture.naturalWidth,texture.naturalHeight),crop=document.createElement('canvas');crop.width=w;crop.height=h;
   const paint=crop.getContext('2d');if(!paint)throw Error('Material texture unavailable');paint.drawImage(texture,cell.x,cell.y,cell.width,cell.height,0,0,w,h);materials.set(stage,crop.toDataURL('image/png'));
  }
  const localImages=new Map<string,string>();
  for(const svg of [...faces,backSvg])if(svg)for(const source of svg.querySelectorAll<SVGImageElement>('image:not([data-stage-texture])')){
   const href=source.getAttribute('href');if(!href||localImages.has(href))continue;
   const asset=await image(href),copy=document.createElement('canvas');copy.width=Math.min(asset.naturalWidth,TILE_ATLAS_CELL.height*2);copy.height=Math.round(copy.width*asset.naturalHeight/asset.naturalWidth);const paint=copy.getContext('2d');if(!paint)throw Error('Tile grain unavailable');paint.drawImage(asset,0,0,copy.width,copy.height);localImages.set(href,copy.toDataURL('image/png'));
  }
  const back=backSvg?await raster(backSvg):await image('/turntale-tile-back-gold.svg');
  async function raster(svg:SVGSVGElement){const copy=svg.cloneNode(true) as SVGSVGElement;for(const texture of copy.querySelectorAll('image[data-stage-texture]')){const src=materials.get(Number(texture.getAttribute('data-stage-texture')));if(src){texture.setAttribute('href',src);texture.setAttribute('x','0');texture.setAttribute('y','0');texture.setAttribute('width','100');texture.setAttribute('height','132');}}for(const texture of copy.querySelectorAll('image:not([data-stage-texture])')){const src=localImages.get(texture.getAttribute('href')||'');if(src)texture.setAttribute('href',src);}copy.setAttribute('xmlns','http://www.w3.org/2000/svg');copy.setAttribute('width',String(w));copy.setAttribute('height',String(h));copy.setAttribute('preserveAspectRatio','none');const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(copy)],{type:'image/svg+xml'}));urls.push(url);return image(url);}
  const art=await Promise.all(faces.map(svg=>svg?raster(svg):null));
  for(let slot=0;slot<faces.length+2;slot++){
   const x=slot%columns*w,y=Math.floor(slot/columns)*h;
   ctx.fillStyle='#fffdf3';ctx.beginPath();ctx.roundRect(x,y,w,h,[22.5]);ctx.fill();
   ctx.fillStyle=slot===0?'#12513d':'#fff';ctx.beginPath();ctx.roundRect(x+inset,y+inset,w-inset*2,h-inset*2,[16.5]);ctx.fill();
   const svg=slot===0?back:slot>1?art[slot-2]:null;if(svg)ctx.drawImage(svg,x+inset,y+inset,w-inset*2,h-inset*2);
  }
 }finally{urls.forEach(url=>URL.revokeObjectURL(url));}
 return canvas;
}
