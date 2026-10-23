export function EditorialHeading({ text, accent, as: Tag = 'h2', className }: {
  text: string;
  accent: string;
  as?: 'h1' | 'h2';
  className?: string;
}) {
  const position = text.indexOf(accent);
  return <Tag className={className}>{position < 0 ? text : <>
    {text.slice(0, position)}<em>{accent}</em>{text.slice(position + accent.length)}
  </>}</Tag>;
}
