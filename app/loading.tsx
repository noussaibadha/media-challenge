export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Cercle avec dégradé orange-violet qui tourne */}
        <div className="absolute w-full h-full animate-spin rounded-full border-8 border-transparent bg-gradient-to-r from-orange-400 via-purple-500 to-transparent p-[2px]">
          {/* Masque blanc pour ne garder que le contour */}
          <div className="w-full h-full rounded-full bg-white"></div>
        </div>
        {/* Logo fixe au centre */}
        <img
          src="/favicon_spotIn.svg"
          alt="Logo"
          className="absolute w-24 h-24 object-contain"
        />
      </div>
    </div>
  );
}
