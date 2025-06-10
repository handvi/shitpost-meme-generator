import React, { useRef, useState, useEffect } from 'react';

export default function MemeGenerator() {
  const [topText, setTopText] = useState<string>('');
  const [bottomText, setBottomText] = useState<string>('');
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Responsive canvas dimensions
  const getMaxDimensions = () => ({
    width: window.innerWidth < 768 ? 350 : 600,
    height: window.innerWidth < 768 ? 350 : 600
  });

  // Load font and handle window resize
  useEffect(() => {
    // Load font
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Alfa+Slab+One&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    // Cleanup function
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Draw meme on canvas
  useEffect(() => {
    const drawMeme = () => {
      if (!canvasRef.current || !image) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { width: maxWidth, height: maxHeight } = getMaxDimensions();
      
      // Calculate dimensions while maintaining aspect ratio
      let width = image.width;
      let height = image.height;
      const aspectRatio = width / height;

      if (width > maxWidth) {
        width = maxWidth;
        height = width / aspectRatio;
      }
      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Clear and draw image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, width, height);

      // Text styling
      const fontSize = Math.min(width * 0.1, 60); // Responsive font size
      ctx.font = `bold ${fontSize}px "Alfa Slab One", Impact, sans-serif`;
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 4;
      ctx.textAlign = 'center';

      // Draw top text
      if (topText) {
        ctx.fillText(topText.toUpperCase(), width / 2, fontSize + 10);
        ctx.strokeText(topText.toUpperCase(), width / 2, fontSize + 10);
      }

      // Draw bottom text
      if (bottomText) {
        ctx.fillText(bottomText.toUpperCase(), width / 2, height - 20);
        ctx.strokeText(bottomText.toUpperCase(), width / 2, height - 20);
      }
    };

    drawMeme();
  }, [topText, bottomText, image]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      setImage(img);
      setIsLoading(false);
    };
    img.onerror = () => {
      setIsLoading(false);
      alert('Gagal memuat gambar');
    };
  };

  const downloadMeme = () => {
    if (!canvasRef.current) return;

    setIsLoading(true);
    try {
      const link = document.createElement('a');
      link.download = `meme-${Date.now()}.png`;
      link.href = canvasRef.current.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error downloading meme:', error);
      alert('Gagal mengunduh meme');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 font-sans">
      <div className="container mx-auto max-w-6xl">
        {/* Header for Mobile */}
        <h1 className="text-3xl font-bold mb-6 text-center lg:hidden bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
          🖼️ Meme Generator
        </h1>

        <div className="flex flex-col lg:flex-row gap-6 bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700 overflow-hidden">
          {/* Sidebar Form */}
          <div className="w-full lg:w-1/3 p-5 md:p-6 bg-gray-800/30 order-2 lg:order-1">
            {/* Header for Desktop */}
            <h1 className="hidden lg:block text-3xl font-bold mb-6 text-left bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
              🖼️ Meme Generator
            </h1>

            <div className="space-y-4">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Upload Gambar
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="file-upload"
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="file-upload"
                    className={`block w-full px-4 py-3 rounded-lg border cursor-pointer transition duration-200 flex items-center justify-between ${
                      isLoading
                        ? 'bg-gray-600 border-gray-500'
                        : 'bg-gray-700 hover:bg-gray-600 border-gray-600'
                    }`}
                  >
                    <span className="truncate">
                      {isLoading ? 'Memuat...' : '📁 Pilih Gambar'}
                    </span>
                    <span className="text-xs text-gray-400">PNG/JPG</span>
                  </label>
                </div>
              </div>

              {/* Text Inputs */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Teks Atas
                </label>
                <input
                  type="text"
                  placeholder="Masukkan teks atas..."
                  value={topText}
                  onChange={(e) => setTopText(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 transition duration-200"
                  disabled={isLoading || !image}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Teks Bawah
                </label>
                <input
                  type="text"
                  placeholder="Masukkan teks bawah..."
                  value={bottomText}
                  onChange={(e) => setBottomText(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 transition duration-200"
                  disabled={isLoading || !image}
                />
              </div>

              {/* Download Button */}
              <button
                onClick={downloadMeme}
                disabled={isLoading || !image}
                className={`w-full mt-4 px-6 py-3 rounded-lg font-bold text-white shadow-lg transition-all duration-300 flex items-center justify-center lg:mt-6 ${
                  isLoading || !image
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-green-500 hover:from-purple-600 hover:to-green-600 hover:shadow-purple-500/20'
                }`}
              >
                {isLoading ? (
                  <span className="animate-pulse">Memproses...</span>
                ) : (
                  <>
                    💾 Download Meme
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="w-full lg:w-2/3 p-5 md:p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 flex items-center justify-center order-1 lg:order-2 min-h-[300px] lg:min-h-[500px]">
            <div className="w-full max-w-full aspect-square relative">
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain rounded-xl border-2 border-gray-700 shadow-lg bg-gray-900/50"
              />
              {!image && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <div className="text-center p-4">
                    <div className="text-5xl mb-4">🖼️</div>
                    <p className="text-lg">Upload gambar untuk memulai</p>
                    <p className="text-sm text-gray-500 mt-2">
                      (Gunakan gambar landscape untuk hasil terbaik)
                    </p>
                  </div>
                </div>
              )}
              {isLoading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-xl">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}