import { useState } from 'react';
import { X, CheckCircle, Loader2 } from 'lucide-react';

const UserLogo = ({ className, color }: { className?: string, color?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 74.93 114.93" className={className} style={{ color }}>
    <path fill="currentColor" d="M74.93,87.65h-26.09v-7.16c-2.6,2.6-5.75,4.61-9.47,6.01-3.71,1.41-7.34,2.11-10.9,2.11-8.06,0-14.64-2.5-19.72-7.48-3.39-3.39-5.7-7.1-6.92-11.09-1.22-4-1.83-8.65-1.83-13.96V0h26.72v52.5c0,4.41,1.15,7.5,3.46,9.31,2.31,1.8,4.73,2.7,7.28,2.7s4.98-.89,7.28-2.66c2.31-1.78,3.46-4.89,3.46-9.34V.01h26.72v87.65h0Z"/>
    <path fill="currentColor" d="M74.93,114.93H7.92c-4.38,0-7.92-3.55-7.92-7.92v-1.53c0-4.37,3.55-7.92,7.92-7.92h67.01v17.37h0Z"/>
  </svg>
);

const AVATAR_OPTIONS = {
  top: [
    { id: 'shavedSides', name: 'Laterales Rapados' },
    { id: 'theCaesarAndSidePart', name: 'César con Raya' },
    { id: 'shortCurly', name: 'Corto Rizado' },
    { id: 'shortRound', name: 'Corto Redondo' },
    { id: 'shortWaved', name: 'Corto Ondulado' },
    { id: 'shaggy', name: 'Desaliñado' },
    { id: 'shaggyMullet', name: 'Mullet Moderno' },
    { id: 'sides', name: 'Solo Laterales' },
    { id: 'dreads01', name: 'Dreads Finas' },
    { id: 'dreads02', name: 'Dreads Gruesas' },
    { id: 'frizzle', name: 'Frizz Abundante' },
    { id: 'curvy', name: 'Ondulado Largo' },
    { id: 'straightAndStrand', name: 'Lacio con Mechón' },
    { id: 'longButNotTooLong', name: 'Largo Medio' },
    { id: 'bigHair', name: 'Volumen Alto' },
    { id: 'frida', name: 'Trenzas Arriba' },
    { id: 'fro', name: 'Afro Grande' },
    { id: 'froBand', name: 'Afro con Banda' },
    { id: 'miaWallace', name: 'Bob Recto' },
    { id: 'straight02', name: 'Lacio Capas' },
    { id: 'shortFlat', name: 'Corto Liso' },
    { id: 'theCaesar', name: 'César' },
    { id: 'straight01', name: 'Largo Lacio' },
    { id: 'curly', name: 'Largo Rizado' },
    { id: 'bob', name: 'Corte Bob' },
    { id: 'bun', name: 'Moño' },
    { id: 'dreads', name: 'Rastas' },
    { id: 'hat', name: 'Sombrero' },
    { id: 'winterHat1', name: 'Gorro Invierno' },
    { id: 'winterHat02', name: 'Gorro Orejero' },
    { id: 'winterHat03', name: 'Gorro Pompón' },
    { id: 'winterHat04', name: 'Gorro Caído' },
    { id: 'hijab', name: 'Hijab' },
    { id: 'turban', name: 'Turbante' }
  ],
  accessories: [
    { id: '', name: 'Ninguno' },
    { id: 'prescription01', name: 'Lentes Clásicos' },
    { id: 'prescription02', name: 'Lentes Finos' },
    { id: 'round', name: 'Redondos' },
    { id: 'sunglasses', name: 'Gafas de Sol' },
    { id: 'wayfarers', name: 'Estilo Wayfarer' },
    { id: 'eyepatch', name: 'Parche' }
  ],
  facialHair: [
    { id: '', name: 'Sin Barba' },
    { id: 'beardMedium', name: 'Barba Media' },
    { id: 'beardLight', name: 'Barba Ligera' },
    { id: 'beardMajestic', name: 'Barba Majestuosa' },
    { id: 'moustacheFancy', name: 'Bigote Fino' },
    { id: 'moustacheMagnum', name: 'Bigote Grueso' }
  ],
  clothing: [
    { id: 'blazerAndShirt', name: 'Traje y Camisa' },
    { id: 'blazerAndSweater', name: 'Traje y Suéter' },
    { id: 'collarAndSweater', name: 'Suéter con Cuello' },
    { id: 'graphicShirt', name: 'Camiseta Gráfica' },
    { id: 'hoodie', name: 'Sudadera' },
    { id: 'overall', name: 'Overol' },
    { id: 'shirtCrewNeck', name: 'Camiseta Casual' }
  ],
  skinColor: [
    { id: 'ffdbb4', name: 'Pálida' },
    { id: 'edb98a', name: 'Clara' },
    { id: 'f8d25c', name: 'Amarilla' },
    { id: 'd08b5b', name: 'Bronceada' },
    { id: 'ae5d29', name: 'Castaña' },
    { id: '614335', name: 'Oscura' }
  ],
  hairColor: [
    { id: '2c1b18', name: 'Negro' },
    { id: '4a312c', name: 'Marrón Oscuro' },
    { id: 'a55728', name: 'Castaño' },
    { id: 'd6b370', name: 'Rubio' },
    { id: 'c93305', name: 'Pelirrojo' },
    { id: 'e8e1e1', name: 'Gris' },
    { id: 'f59797', name: 'Rosa' }
  ],
  accessoriesColor: [
    { id: '262e33', name: 'Negro Mate' },
    { id: 'e6e6e6', name: 'Plata / Blanco' },
    { id: 'ffdeb5', name: 'Dorado Metalizado' },
    { id: '5199e4', name: 'Azul Espejo' },
    { id: 'ff488e', name: 'Rosa Neón' },
    { id: 'ff5c5c', name: 'Rojo Fuego' }
  ],
  logoColor: [
    { id: '#ffffff', name: 'Blanco' },
    { id: '#000000', name: 'Negro' },
    { id: '#4f46e5', name: 'Índigo' },
    { id: '#ef4444', name: 'Rojo' },
    { id: '#22c55e', name: 'Verde' },
    { id: '#eab308', name: 'Amarillo' }
  ]
};

export function AvatarCreatorModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialSeed = 'nexus' 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (base64: string) => void;
  initialSeed?: string;
}) {
  const [creatorSeed, setCreatorSeed] = useState(initialSeed);
  const [avatarProps, setAvatarProps] = useState({
    top: 'shortFlat',
    hairColor: '2c1b18',
    accessories: '',
    accessoriesColor: '262e33',
    facialHair: '',
    facialHairColor: '2c1b18',
    clothing: 'blazerAndShirt',
    skinColor: 'edb98a',
    logoColor: '#ffffff'
  });

  const [stamping, setStamping] = useState(false);

  if (!isOpen) return null;

  const buildPreviewUrl = (style = 'circle', format = 'png', specificProps = avatarProps, bgTransparent = false) => {
    const params = new URLSearchParams({
      seed: creatorSeed,
      style: style,
      accessoriesProbability: specificProps.accessories ? '100' : '0',
      facialHairProbability: specificProps.facialHair ? '100' : '0'
    });
    
    if (bgTransparent) {
      params.append('backgroundColor', 'transparent');
    } else {
      params.append('backgroundColor', 'b6e3f4,c0aede,d1d4f9,ffdfbf');
    }
    
    if (specificProps.top) params.append('top', specificProps.top);
    if (specificProps.hairColor) params.append('hairColor', specificProps.hairColor);
    if (specificProps.accessories) params.append('accessories', specificProps.accessories);
    if (specificProps.accessoriesColor) params.append('accessoriesColor', specificProps.accessoriesColor);
    if (specificProps.facialHair) params.append('facialHair', specificProps.facialHair);
    if (specificProps.facialHairColor) params.append('facialHairColor', specificProps.facialHairColor);
    if (specificProps.clothing) params.append('clothing', specificProps.clothing);
    if (specificProps.skinColor) params.append('skinColor', specificProps.skinColor);

    return `https://api.dicebear.com/7.x/avataaars/${format}?${params.toString()}`;
  };

  const previewUrl = buildPreviewUrl('circle', 'svg');

  const handleStampAvatar = async () => {
    setStamping(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = buildPreviewUrl('circle', 'png') + '&size=512';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No canvas context');

      ctx.drawImage(img, 0, 0, 512, 512);

      const svgLogo = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 74.93 114.93" width="64" height="64">
          <path fill="${avatarProps.logoColor}" d="M74.93,87.65h-26.09v-7.16c-2.6,2.6-5.75,4.61-9.47,6.01-3.71,1.41-7.34,2.11-10.9,2.11-8.06,0-14.64-2.5-19.72-7.48-3.39-3.39-5.7-7.1-6.92-11.09-1.22-4-1.83-8.65-1.83-13.96V0h26.72v52.5c0,4.41,1.15,7.5,3.46,9.31,2.31,1.8,4.73,2.7,7.28,2.7s4.98-.89,7.28-2.66c2.31-1.78,3.46-4.89,3.46-9.34V.01h26.72v87.65h0Z"/>
          <path fill="${avatarProps.logoColor}" d="M74.93,114.93H7.92c-4.38,0-7.92-3.55-7.92-7.92v-1.53c0-4.37,3.55-7.92,7.92-7.92h67.01v17.37h0Z"/>
        </svg>
      `;
      const svgBlob = new Blob([svgLogo], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      const logoImg = new Image();
      
      await new Promise((resolve, reject) => {
        logoImg.onload = resolve;
        logoImg.onerror = reject;
        logoImg.src = svgUrl;
      });

      // Draw Logo on chest (lower position)
      ctx.drawImage(logoImg, 256 - 32, 420, 64, 64);
      
      const finalBase64 = canvas.toDataURL('image/png', 0.9);
      onSave(finalBase64);
    } catch (e) {
      console.error(e);
      alert('Error al estampar logo');
    } finally {
      setStamping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4">
      <div className="bg-nexus-darker w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-nexus-border">
        
        {/* Preview Area */}
        <div className="bg-nexus-dark p-8 flex-1 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-nexus-border relative">
          <h2 className="absolute top-6 left-6 font-black text-xl text-white">Creador de Avatar</h2>
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-slate-800 rounded-xl shadow-sm text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-64 h-64 rounded-3xl overflow-hidden shadow-2xl ring-8 ring-slate-800 mt-8 md:mt-0 relative group bg-white">
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            <UserLogo className="w-8 h-8 absolute left-1/2 -translate-x-1/2 top-[82%] drop-shadow-md transition-colors" color={avatarProps.logoColor} />
          </div>
        </div>

        {/* Controls Area */}
        <div className="p-8 flex-1 flex flex-col justify-start space-y-6 overflow-y-auto max-h-[80vh] custom-scrollbar text-white">
          
          {/* Ajustes Generales */}
          <div className="bg-slate-900/50 p-4 rounded-2xl flex flex-wrap gap-6 border border-slate-800">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tono de Piel</label>
              <div className="flex gap-1.5">
                {AVATAR_OPTIONS.skinColor.map(o => (
                  <button key={o.id} onClick={() => setAvatarProps({...avatarProps, skinColor: o.id})} className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${avatarProps.skinColor === o.id ? "border-nexus-primary scale-110 ring-2 ring-nexus-primary/30" : "border-slate-700"}`} style={{ backgroundColor: `#${o.id}` }} title={o.name} />
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Color Logo</label>
              <div className="flex gap-1.5">
                {AVATAR_OPTIONS.logoColor.map(o => (
                  <button key={o.id} onClick={() => setAvatarProps({...avatarProps, logoColor: o.id})} className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${avatarProps.logoColor === o.id ? "border-nexus-primary scale-110 ring-2 ring-nexus-primary/30" : "border-slate-700"}`} style={{ backgroundColor: o.id }} title={o.name} />
                ))}
              </div>
            </div>
          </div>

          {/* Cabello Visual */}
          <div>
            <div className="flex items-center gap-4 mb-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block m-0">Cabello / Sombrero</label>
              <div className="flex gap-1">
                {AVATAR_OPTIONS.hairColor.map(o => (
                  <button key={o.id} onClick={() => setAvatarProps({...avatarProps, hairColor: o.id})} className={`w-4 h-4 rounded-full border border-slate-700 transition-transform ${avatarProps.hairColor === o.id ? "scale-125 ring-1 ring-nexus-primary" : ""}`} style={{ backgroundColor: `#${o.id}` }} title={o.name} />
                ))}
              </div>
            </div>
            <div className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar pr-4">
              {AVATAR_OPTIONS.top.map(o => (
                <button key={o.id} onClick={() => setAvatarProps({...avatarProps, top: o.id})} className={`shrink-0 w-16 h-16 border-2 rounded-2xl transition-all overflow-hidden relative ${avatarProps.top === o.id ? "border-nexus-primary bg-nexus-primary/20" : "border-transparent bg-slate-800 hover:bg-slate-700"}`}>
                  <img className="w-full h-full object-cover scale-[1.7] translate-y-3" src={buildPreviewUrl('default', 'svg', {...avatarProps, top: o.id, accessories: '', facialHair: ''}, true)} alt={o.name} title={o.name} />
                </button>
              ))}
            </div>
          </div>

          {/* Barba Visual */}
          <div>
            <div className="flex items-center gap-4 mb-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block m-0">Barba / Bigote</label>
              <div className="flex gap-1">
                {AVATAR_OPTIONS.hairColor.map(o => (
                  <button key={o.id} onClick={() => setAvatarProps({...avatarProps, facialHairColor: o.id})} className={`w-4 h-4 rounded-full border border-slate-700 transition-transform ${avatarProps.facialHairColor === o.id ? "scale-125 ring-1 ring-nexus-primary" : ""}`} style={{ backgroundColor: `#${o.id}` }} title={o.name} />
                ))}
              </div>
            </div>
            <div className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar pr-4">
              {AVATAR_OPTIONS.facialHair.map(o => (
                <button key={o.id} onClick={() => setAvatarProps({...avatarProps, facialHair: o.id})} className={`shrink-0 w-16 h-16 border-2 rounded-2xl transition-all overflow-hidden relative flex items-center justify-center ${avatarProps.facialHair === o.id ? "border-nexus-primary bg-nexus-primary/20" : "border-transparent bg-slate-800 hover:bg-slate-700"}`}>
                  {o.id ? <img className="w-full h-full object-cover scale-[2] -translate-y-2" src={buildPreviewUrl('default', 'svg', {...avatarProps, top: 'shortFlat', facialHair: o.id, accessories: ''}, true)} alt={o.name} title={o.name} /> : <div className="font-bold text-[10px] text-slate-400">Ninguna</div>}
                </button>
              ))}
            </div>
          </div>

          {/* Lentes Visual */}
          <div>
            <div className="flex items-center gap-4 mb-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block m-0">Gafas / Lentes</label>
              <div className="flex gap-1">
                {AVATAR_OPTIONS.accessoriesColor.map(o => (
                  <button key={o.id} onClick={() => setAvatarProps({...avatarProps, accessoriesColor: o.id})} className={`w-4 h-4 rounded-full border border-slate-700 transition-transform ${avatarProps.accessoriesColor === o.id ? "scale-125 ring-1 ring-nexus-primary" : ""}`} style={{ backgroundColor: `#${o.id}` }} title={o.name} />
                ))}
              </div>
            </div>
            <div className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar pr-4">
              {AVATAR_OPTIONS.accessories.map(o => (
                <button key={o.id} onClick={() => setAvatarProps({...avatarProps, accessories: o.id})} className={`shrink-0 w-16 h-16 border-2 rounded-2xl transition-all overflow-hidden relative flex items-center justify-center ${avatarProps.accessories === o.id ? "border-nexus-primary bg-nexus-primary/20" : "border-transparent bg-slate-800 hover:bg-slate-700"}`}>
                  {o.id ? <img className="w-full h-full object-cover scale-[2] -translate-y-1" src={buildPreviewUrl('default', 'svg', {...avatarProps, accessories: o.id, top: 'shortFlat', facialHair: ''}, true)} alt={o.name} title={o.name} /> : <div className="font-bold text-[10px] text-slate-400">Ninguno</div>}
                </button>
              ))}
            </div>
          </div>

          {/* Ropa Visual */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Ropa / Atuendo</label>
            <div className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar pr-4">
              {AVATAR_OPTIONS.clothing.map(o => (
                <button key={o.id} onClick={() => setAvatarProps({...avatarProps, clothing: o.id})} className={`shrink-0 w-16 h-16 border-2 rounded-2xl transition-all overflow-hidden relative ${avatarProps.clothing === o.id ? "border-nexus-primary bg-nexus-primary/20" : "border-transparent bg-slate-800 hover:bg-slate-700"}`}>
                  <img className="w-full h-full object-cover scale-[2] -translate-y-7" src={buildPreviewUrl('default', 'svg', {...avatarProps, clothing: o.id, top: 'shortFlat', accessories: '', facialHair: ''}, true)} alt={o.name} title={o.name} />
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Modificar Semilla Base (Rasgos)</label>
            <input 
              type="text" 
              value={creatorSeed} 
              onChange={e => setCreatorSeed(e.target.value)} 
              placeholder="Escribe un nombre para cambiar rostro..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 font-bold focus:border-nexus-primary outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 mt-auto">
            <button 
              onClick={handleStampAvatar} 
              disabled={stamping}
              className="w-full py-4 bg-nexus-primary hover:bg-nexus-primaryHover text-white rounded-xl font-black shadow-lg shadow-nexus-primary/30 transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {stamping ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />} 
              {stamping ? 'Estampando...' : 'Asignar Avatar a Usuario'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
