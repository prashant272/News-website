export const getImageSrc = (img?: string): string => {
  if (!img) {
    return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80';
  }
  if (img.startsWith('http') || img.startsWith('data:')) {
    return img;
  }
  if (img.startsWith('/')) {
    return img;
  }
  return `/uploads/${img}`;
};