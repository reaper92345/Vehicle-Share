export async function fetchEquipment({ category, location, search }: { category?: string; location?: string; search?: string }) {
  const params = new URLSearchParams();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  if (category) params.set('category', category);
  if (location) params.set('location', location);
  if (search) params.set('search', search);

  const response = await fetch(`${apiUrl}/api/equipment?${params.toString()}`);
  return response.json();
}
