export const formatDateTime = (dateString?: string | Date): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  
  return date.toLocaleDateString('hi-IN', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};
