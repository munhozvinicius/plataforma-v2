export async function getConfig(key) {
  const r = await fetch(`/api/config/${key}`)
  if (!r.ok) throw new Error('Falha ao buscar config')
  return r.json()
}
export async function saveConfig(key, value) {
  const r = await fetch(`/api/config/${key}`, { method:'POST', body: JSON.stringify(value) })
  if (!r.ok) throw new Error('Falha ao salvar config')
}
export async function getProducts() {
  const r = await fetch('/api/products')
  if (!r.ok) throw new Error('Falha ao buscar produtos')
  return r.json()
}
export async function saveProducts(payload) {
  const r = await fetch('/api/products', { method:'POST', body: JSON.stringify(payload) })
  if (!r.ok) throw new Error('Falha ao salvar produtos')
}
