/**
 * Mengompresi file gambar di sisi client menggunakan HTML Canvas
 * @param file File gambar asli
 * @param maxWidth Lebar maksimal (default 1280px)
 * @param quality Kualitas JPEG (0.1 - 1.0, default 0.75)
 */
export async function compressImage(
  file: File | Blob,
  maxWidth: number = 1280,
  quality: number = 0.75
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

        // Hitung aspect ratio jika melebihi maxWidth
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
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
