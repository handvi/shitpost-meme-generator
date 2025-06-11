import React, { useRef, useState, useEffect } from 'react';

export default function App() {
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Memuat font "Alfa Slab One"
    const fontLink = document.createElement("link");
    fontLink.href = "https://fonts.googleapis.com/css2?family=Alfa+Slab+One&display=swap";
    fontLink.rel = "stylesheet";
    document.head.appendChild(fontLink);

    // Memuat Font Awesome CDN (versi 6.5.2 yang lebih stabil)
    const faLink = document.createElement("link");
    faLink.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css";
    faLink.rel = "stylesheet";
    document.head.appendChild(faLink);

    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();

    window.addEventListener('resize', checkIsMobile);

    return () => {
      document.head.removeChild(fontLink);
      document.head.removeChild(faLink);
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  useEffect(() => {
    const wrapText = (context: CanvasRenderingContext2D, text: string, maxWidth: number) => {
      const words = text.split(' ');
      let line = '';
      const lines: string[] = [];

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          lines.push(line);
          line = words[n] + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line);
      return lines;
    };

    const drawMeme = () => {
      if (!canvasRef.current || !image || !canvasWrapperRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const availableWidth = canvasWrapperRef.current.clientWidth;
      const availableHeight = canvasWrapperRef.current.clientHeight;

      let imgWidth = image.width;
      let imgHeight = image.height;
      const aspectRatio = imgWidth / imgHeight;

      let drawWidth = availableWidth;
      let drawHeight = availableWidth / aspectRatio;

      if (drawHeight > availableHeight) {
        drawHeight = availableHeight;
        drawWidth = availableHeight * aspectRatio;
      }

      canvas.width = drawWidth;
      canvas.height = drawHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, drawWidth, drawHeight);

      const fontSize = Math.max(20, Math.min(drawWidth * 0.1, 60));
      ctx.font = `bold ${fontSize}px "Alfa Slab One", Impact, sans-serif`;
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = Math.max(2, fontSize / 20);
      ctx.textAlign = 'center';

      if (topText) {
        const wrappedTopText = wrapText(ctx, topText.toUpperCase(), drawWidth * 0.9);
        let topTextY = fontSize + Math.max(10, fontSize * 0.1);
        wrappedTopText.forEach((line, index) => {
          ctx.fillText(line, drawWidth / 2, topTextY + (index * fontSize * 1.1));
          ctx.strokeText(line, drawWidth / 2, topTextY + (index * fontSize * 1.1));
        });
      }

      if (bottomText) {
        const wrappedBottomText = wrapText(ctx, bottomText.toUpperCase(), drawWidth * 0.9);
        let bottomTextY = drawHeight - (wrappedBottomText.length * fontSize * 1.1) + fontSize - Math.max(20, fontSize * 0.4);

        wrappedBottomText.forEach((line, index) => {
          ctx.fillText(line, drawWidth / 2, bottomTextY + (index * fontSize * 1.1));
          ctx.strokeText(line, drawWidth / 2, bottomTextY + (index * fontSize * 1.1));
        });
      }
    };

    const timeoutId = setTimeout(() => {
      drawMeme();
    }, 0);

    return () => clearTimeout(timeoutId);
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
      const messageBox = document.createElement('div');
      messageBox.className = "fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50";
      messageBox.innerHTML = `
        <div class="bg-gray-800 p-6 rounded-lg shadow-xl text-center">
          <p class="text-white text-lg mb-4">Gagal memuat gambar!</p>
          <button id="closeMessageBox" class="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg">OK</button>
        </div>
      `;
      document.body.appendChild(messageBox);
      document.getElementById('closeMessageBox')?.addEventListener('click', () => {
        document.body.removeChild(messageBox);
      });
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
      const messageBox = document.createElement('div');
      messageBox.className = "fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50";
      messageBox.innerHTML = `
        <div class="bg-gray-800 p-6 rounded-lg shadow-xl text-center">
          <p class="text-white text-lg mb-4">Gagal mengunduh meme!</p>
          <button id="closeMessageBox" class="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg">OK</button>
        </div>
      `;
      document.body.appendChild(messageBox);
      document.getElementById('closeMessageBox')?.addEventListener('click', () => {
        document.body.removeChild(messageBox);
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center p-4 font-sans">
        <div className="text-center bg-gray-800/70 p-8 rounded-2xl shadow-xl border border-gray-700 max-w-lg mx-auto">
          <p className="text-4xl mb-4">🚫</p>
          <h2 className="text-2xl font-bold mb-3 text-red-400">Akses Ditolak</h2>
          <p className="text-lg text-gray-300">
            Aplikasi ini dirancang khusus untuk perangkat seluler.
          </p>
          <p className="text-md text-gray-400 mt-2">
            Silakan buka aplikasi ini di ponsel atau tablet Anda.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 font-sans flex flex-col">
      <div className="container mx-auto max-w-6xl flex-grow flex flex-col">
        <h1 className="text-3xl font-bold mb-6 text-center lg:hidden bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
          🖼️ Meme Generator 🖼️
        </h1>

        <div className="flex flex-col lg:flex-row gap-6 bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700 overflow-hidden flex-grow">
          <div className="w-full lg:w-1/3 p-5 md:p-6 bg-gray-800/30 order-2 lg:order-1 flex flex-col">
            <h1 className="hidden lg:block text-3xl font-bold mb-6 text-left bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
              🖼️ Meme Generator 🖼️
            </h1>

            <div className="space-y-4 flex-grow flex flex-col">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Unggah Gambar
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
                    💾 Unduh Meme
                  </>
                )}
              </button>

              <div className="flex justify-center space-x-6 mt-6">
                <a href="https://www.facebook.com/profile.php?id=61571239041200" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition duration-200 text-3xl">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="https://www.threads.com/@sts2020_" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-600 transition duration-200 text-3xl">
                  <i className="fa-brands fa-threads"></i>
                </a>
                <a href="https://whatsapp.com/channel/0029Vb64U5t0Qeacja9u3W18" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-500 transition duration-200 text-3xl">
                  <i className="fab fa-whatsapp"></i>
                </a>
                <a href="https://www.instagram.com/sts2020_" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500 transition duration-200 text-3xl">
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
            </div>
          </div>

          <div
            ref={canvasWrapperRef}
            className="w-full lg:w-2/3 p-5 md:p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 flex items-center justify-center order-1 lg:order-2 flex-grow"
          >
            <div className="w-full h-full relative flex items-center justify-center">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full object-contain rounded-xl border-2 border-gray-700 shadow-lg bg-gray-900/50"
              />
              {!image && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <div className="text-center p-4">
                    <div className="text-5xl mb-4">🖼️</div>
                    <p className="text-lg">Unggah gambar untuk memulai</p>
                    <p className="text-sm text-gray-500 mt-2">
                      (Gunakan gambar lanskap untuk hasil terbaik)
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
