import { useEffect, useState } from 'react'
import { getConfig, saveConfig, getProducts, saveProducts } from './services/data.js'

export default function App() {
  const [home, setHome] = useState({ title: 'Bem-vindo', desc: '' })
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const h = await getConfig('home')
        setHome({ title: h?.value?.title ?? 'Bem-vindo', desc: h?.value?.desc ?? '' })
        const p = await getProducts()
        setProducts(p.products ?? [])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  async function salvarHome() {
    await saveConfig('home', home)
    alert('Home salva no Neon!')
  }

  async function adicionarProduto() {
    const novo = {
      title: `Produto ${products.length + 1}`,
      subtitle: 'Sub',
      emoji: '⚡️',
      data: { features: ['ok'] },
      order_index: products.length
    }
    await saveProducts({ upserts: [novo] })
    const p = await getProducts()
    setProducts(p.products ?? [])
  }

  if (loading) return <div style={{padding:24}}>Carregando…</div>

  return (
    <div style={{ padding: 24, fontFamily: 'Inter, Arial, sans-serif' }}>
      <h1>Admin (MVP)</h1>

      <section style={{marginTop:16, padding:12, border:'1px solid #eee', borderRadius:8}}>
        <h2>Home</h2>
        <div style={{display:'flex', gap:8, marginTop:8}}>
          <input
            value={home.title}
            onChange={e=>setHome(v=>({...v,title:e.target.value}))}
            placeholder="Título"
          />
          <input
            value={home.desc}
            onChange={e=>setHome(v=>({...v,desc:e.target.value}))}
            placeholder="Descrição"
          />
          <button onClick={salvarHome}>Salvar Home</button>
        </div>
      </section>

      <section style={{marginTop:16, padding:12, border:'1px solid #eee', borderRadius:8}}>
        <h2>Produtos</h2>
        <button onClick={adicionarProduto}>Adicionar</button>
        <ul>
          {products.map(p => <li key={p.id || p.title}>{p.emoji} {p.title} — {p.subtitle}</li>)}
        </ul>
      </section>
    </div>
  )
}
