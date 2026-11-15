/** Hand-drawn default profile faces (Codex 2026-11-14, request F) that replace the 🦊🦉🐯🐼 emoji on seats without a photo. */
export const ANIMAL_FACES:Record<string,{src:string,name:string}>={
 '🦊':{src:'/avatars/fox-v1.webp',name:'여우'},
 '🦉':{src:'/avatars/owl-v1.webp',name:'부엉이'},
 '🐯':{src:'/avatars/tiger-v1.webp',name:'호랑이'},
 '🐼':{src:'/avatars/panda-v1.webp',name:'판다'},
};
export const SEAT_ANIMALS=['🦊','🦉','🐯','🐼'] as const;
export const animalFace=(emoji:string)=>ANIMAL_FACES[emoji]||ANIMAL_FACES['🦊'];
