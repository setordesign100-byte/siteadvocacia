import { images, type ImageKey } from '../data/images';

export function EditorialImage({ image, priority = false, sizes = '(max-width: 700px) 100vw, 50vw', decorative = false }: {
  image: ImageKey; priority?: boolean; sizes?: string; decorative?: boolean;
}) {
  const asset = images[image];
  return <img src={asset.large} srcSet={`${asset.small} ${asset.smallWidth}w, ${asset.large} ${asset.width}w`}
    sizes={sizes} width={asset.width} height={asset.height} alt={decorative ? '' : asset.alt}
    loading={priority ? 'eager' : 'lazy'} decoding="async" fetchPriority={priority ? 'high' : 'auto'} />;
}
