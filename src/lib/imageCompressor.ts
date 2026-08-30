/**
 * Mengompresi file gambar di sisi client menggunakan HTML Canvas
 * Membatasi resolusi proporsional (landscape maupun portrait HP) dan kualitas JPEG
 * @param file File gambar asli
 * @param maxDimension Dimensi terpanjang maksimal (default 960px)
 * @param quality Kualitas JPEG (0.1 - 1.0, default 0.65)
 */
export async function compressImage(
  file: File | Blob,
  maxDimension: number = 960,
  quality: number = 0.65
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Hitung skala proporsional berbasis dimensi terpanjang (responsif untuk foto portrait maupun landscape)
        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback: kembalikan file asli jika canvas gagal
          resolve(file);
          return;
        }

        // Gambar ke canvas dengan smoothing berkualitas tinggi
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Ekspor sebagai JPEG terkompresi
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        resolve(file); // fallback file asli
      };
    };

    reader.onerror = (error) => {
      reject(error);
    };
  });
}
