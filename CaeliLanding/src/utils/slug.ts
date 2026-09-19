export function createSlug(name: string): string {
  if (!name) return 'joya';
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // elimina acentos
    .replace(/[^a-z0-9]+/g, "-")    // reemplaza caracteres no alfanuméricos por guiones
    .replace(/^-+|-+$/g, "");       // elimina guiones al principio o al final
}
