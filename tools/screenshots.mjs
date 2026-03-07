/**
 * 3min Calendar — Multi-language screenshot generator
 *
 * Usage:
 *   node tools/screenshots.mjs [--dev-url http://localhost:5173] [--output-dir path]
 *
 * Prerequisites:
 *   - 3min dev server running (npm run dev)
 *   - Playwright installed (uses MCP server's node_modules)
 *   - Pillow for image resize: uv run --with Pillow python3
 *   - Background/logo images in ~/Downloads/ (optional, screenshots work without them)
 *
 * Key design decisions:
 *   - Uses clear() + put() instead of deleteDatabase() to avoid IndexedDB blocking
 *   - Resizes images via Pillow to reduce Base64 payload (512px bg, 128px logo)
 *   - Every day has explicit open/closed status (no empty days)
 *   - Each language has free text entries for realism
 */
import { createRequire } from 'module'
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

// Find Playwright — try MCP server location first, then local node_modules
let chromium
for (const p of [
  '/home/kako-jun/.config/mcp-servers/playwright/node_modules/',
  path.join(process.cwd(), 'node_modules/'),
]) {
  try {
    const req = createRequire(p)
    chromium = req('playwright').chromium
    break
  } catch {
    /* try next */
  }
}
if (!chromium) {
  console.error('Playwright not found')
  process.exit(1)
}

// Parse args
const args = process.argv.slice(2)
const DEV_URL = args.includes('--dev-url')
  ? args[args.indexOf('--dev-url') + 1]
  : 'http://localhost:5173'
const OUTPUT_DIR = args.includes('--output-dir')
  ? args[args.indexOf('--output-dir') + 1]
  : path.join(process.env.HOME, 'Downloads/3min-screenshots')
const DOWNLOADS = path.join(process.env.HOME, 'Downloads')

// ---------------------------------------------------------------------------
// Image helpers
// ---------------------------------------------------------------------------
function imgToBase64(filePath, size) {
  if (!filePath || !fs.existsSync(filePath)) return null
  const tmpPath = `/tmp/3min_resized_${Date.now()}_${Math.random().toString(36).slice(2)}.png`
  try {
    execSync(
      `uv run --with Pillow python3 -c "from PIL import Image; Image.open('${filePath}').resize((${size},${size}), Image.LANCZOS).save('${tmpPath}')"`
    )
    const buf = fs.readFileSync(tmpPath)
    return `data:image/png;base64,${buf.toString('base64')}`
  } finally {
    try {
      fs.unlinkSync(tmpPath)
    } catch {
      /* ignore */
    }
  }
}

function loadBg(name) {
  return imgToBase64(`${DOWNLOADS}/${name}`, 512)
}
function loadLogo(name) {
  return imgToBase64(`${DOWNLOADS}/${name}`, 128)
}

// ---------------------------------------------------------------------------
// Entry generator
// ---------------------------------------------------------------------------
function genEntries(year, month, pattern) {
  const entries = []
  const days = new Date(year, month + 1, 0).getDate()
  for (let d = 1; d <= days; d++) {
    const dow = new Date(year, month, d).getDay()
    const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const e = pattern(dow, d)
    if (e)
      entries.push({
        date: ds,
        text: e.text || '',
        symbol: e.symbol || null,
        stamp: e.stamp || null,
        timeFrom: e.timeFrom || '',
        timeTo: e.timeTo || '',
      })
  }
  return entries
}

// ---------------------------------------------------------------------------
// Config: 11 languages x different themes/months/businesses
// ---------------------------------------------------------------------------
const configs = [
  {
    name: '01_en_barber',
    year: 2026,
    month: 2,
    bgFile: null,
    logoFile: null,
    settings: {
      language: 'en',
      country: 'US',
      calendarTheme: 'light',
      weekStartsOn: 0,
      shopName: "Joe's Barber",
      showHolidays: true,
      showRokuyo: false,
      useWareki: false,
      appTheme: 'dark',
      backgroundOpacity: 0.15,
    },
    gridStyle: 'rounded',
    comment: 'Walk-ins welcome!',
    pattern: (dow, d) => {
      if (dow === 1) return { symbol: 'reserved' }
      if (d === 1) return { timeFrom: '10:00', timeTo: '17:00', text: '✂️' }
      if (d === 14) return { timeFrom: '09:00', timeTo: '19:00', text: '💈', symbol: 'few' }
      if (d === 22) return { text: "Gone fishin' 🎣" }
      if (dow === 0) return { timeFrom: '10:00', timeTo: '15:00' }
      if (dow === 6) return { timeFrom: '09:00', timeTo: '18:00', symbol: 'available' }
      return { timeFrom: '09:00', timeTo: '19:00', symbol: 'available' }
    },
  },
  {
    name: '02_ja_izakaya',
    year: 2026,
    month: 3,
    bgFile: '1_1_clean.png',
    logoFile: '2_1_clean.png',
    settings: {
      language: 'ja',
      country: 'JP',
      calendarTheme: 'dark-blue',
      weekStartsOn: 0,
      shopName: '居酒屋ゆかり',
      showHolidays: true,
      showRokuyo: true,
      useWareki: false,
      appTheme: 'dark',
      backgroundOpacity: 0.15,
    },
    gridStyle: 'lined',
    comment: 'ご予約はお電話で',
    pattern: (dow, d) => {
      if (dow === 2) return { stamp: 'closed' }
      if (d === 29) return { stamp: 'closed' }
      if (d === 10) return { timeFrom: '17:00', timeTo: '24:00', text: '貸切', symbol: 'reserved' }
      if (d === 18) return { text: '店主旅行中🍶' }
      if (d === 24) return { timeFrom: '17:00', timeTo: '24:00', text: '🍻', stamp: 'full' }
      if (dow === 5) return { timeFrom: '17:00', timeTo: '24:00', stamp: 'full' }
      if (dow === 6) return { timeFrom: '17:00', timeTo: '24:00', symbol: 'few' }
      if (dow === 0) return { timeFrom: '16:00', timeTo: '22:00' }
      return { timeFrom: '17:00', timeTo: '23:00', symbol: 'available' }
    },
  },
  {
    name: '03_es_steak',
    year: 2026,
    month: 0,
    bgFile: '1_2_clean.png',
    logoFile: null,
    settings: {
      language: 'es',
      country: 'ES',
      calendarTheme: 'light-orange',
      weekStartsOn: 1,
      shopName: 'El Toro',
      showHolidays: true,
      showRokuyo: false,
      useWareki: false,
      appTheme: 'dark',
      backgroundOpacity: 0.15,
    },
    gridStyle: 'rounded',
    comment: '',
    pattern: (dow, d) => {
      if (dow === 0) return { stamp: 'closed' }
      if (d === 1) return { stamp: 'closed', text: 'Año Nuevo' }
      if (d === 6) return { stamp: 'closed', text: 'Reyes' }
      if (d === 17) return { timeFrom: '12:00', timeTo: '24:00', text: '🔥', stamp: 'full' }
      if (dow === 6) return { timeFrom: '12:00', timeTo: '24:00', stamp: 'full' }
      if (dow === 5) return { timeFrom: '12:00', timeTo: '23:00', symbol: 'few' }
      if (d === 10) return { timeFrom: '12:00', timeTo: '23:00', text: 'Paella' }
      if (d === 23) return { timeFrom: '13:00', timeTo: '22:00', text: 'Cena especial' }
      return { timeFrom: '12:00', timeTo: '23:00', symbol: 'available' }
    },
  },
  {
    name: '04_fr_bakery',
    year: 2026,
    month: 5,
    bgFile: '1_3_clean.png',
    logoFile: '2_2_clean.png',
    settings: {
      language: 'fr',
      country: 'FR',
      calendarTheme: 'dark-purple',
      weekStartsOn: 1,
      shopName: 'Boulangerie Petit',
      showHolidays: true,
      showRokuyo: false,
      useWareki: false,
      appTheme: 'dark',
      backgroundOpacity: 0.15,
    },
    gridStyle: 'lined',
    comment: 'Fermé en août',
    pattern: (dow, d) => {
      if (dow === 1) return { stamp: 'closed' }
      if (dow === 0) return { timeFrom: '07:00', timeTo: '13:00' }
      if (d === 3) return { timeFrom: '06:30', timeTo: '19:00', text: 'Croissants 🥐' }
      if (d === 12)
        return { timeFrom: '06:30', timeTo: '19:00', text: 'Pain frais', symbol: 'available' }
      if (d === 15) return { timeFrom: '06:30', timeTo: '19:00', text: 'Spécial!', symbol: 'few' }
      if (d === 21) return { text: 'Fête 🎶' }
      if (d >= 22 && d <= 28) return { symbol: 'reserved' }
      return { timeFrom: '06:30', timeTo: '19:00', symbol: 'available' }
    },
  },
  {
    name: '05_ko_korean',
    year: 2026,
    month: 1,
    bgFile: null,
    logoFile: null,
    settings: {
      language: 'ko',
      country: 'KR',
      calendarTheme: 'light-green',
      weekStartsOn: 0,
      shopName: '한라산식당',
      showHolidays: true,
      showRokuyo: false,
      useWareki: false,
      appTheme: 'dark',
      backgroundOpacity: 0.15,
    },
    gridStyle: 'rounded',
    comment: '',
    pattern: (dow, d) => {
      if (dow === 0) return { stamp: 'closed' }
      if (d === 17 || d === 18 || d === 19) return { stamp: 'closed', text: '설날' }
      if (d === 14)
        return { timeFrom: '11:00', timeTo: '21:00', text: '💝발렌타인', symbol: 'reserved' }
      if (d === 5)
        return { timeFrom: '11:00', timeTo: '20:00', text: '김치찌개', symbol: 'available' }
      if (d === 24) return { timeFrom: '11:00', timeTo: '20:00', text: '삼겹살 🥓' }
      if (dow === 6) return { timeFrom: '11:00', timeTo: '21:00', symbol: 'few' }
      return { timeFrom: '11:00', timeTo: '20:00', symbol: 'available' }
    },
  },
  {
    name: '06_zh_chinese',
    year: 2026,
    month: 8,
    bgFile: '1_4_clean.png',
    logoFile: '2_3_clean.png',
    settings: {
      language: 'zh',
      country: 'CN',
      calendarTheme: 'dark-red',
      weekStartsOn: 1,
      shopName: '龍鳳酒家',
      showHolidays: true,
      showRokuyo: false,
      useWareki: false,
      appTheme: 'dark',
      backgroundOpacity: 0.15,
    },
    gridStyle: 'lined',
    comment: '欢迎预约包间',
    pattern: (dow, d) => {
      if (dow === 1) return { stamp: 'closed' }
      if (d === 21) return { timeFrom: '11:00', timeTo: '22:00', text: '🎆中秋', stamp: 'full' }
      if (d === 22) return { stamp: 'closed' }
      if (d === 10) return { timeFrom: '11:00', timeTo: '21:00', text: '火锅特价🍲' }
      if (d === 25) return { timeFrom: '11:00', timeTo: '21:00', text: '点心', symbol: 'available' }
      if (dow === 5 || dow === 6) return { timeFrom: '11:00', timeTo: '22:00', symbol: 'few' }
      if (dow === 0) return { timeFrom: '10:00', timeTo: '21:00', symbol: 'available' }
      return { timeFrom: '11:00', timeTo: '21:00', symbol: 'available' }
    },
  },
  {
    name: '07_pt_cafe',
    year: 2026,
    month: 11,
    bgFile: null,
    logoFile: '2_4_clean.png',
    settings: {
      language: 'pt',
      country: 'BR',
      calendarTheme: 'light-blue',
      weekStartsOn: 0,
      shopName: 'Café Brasil',
      showHolidays: true,
      showRokuyo: false,
      useWareki: false,
      appTheme: 'dark',
      backgroundOpacity: 0.15,
    },
    gridStyle: 'rounded',
    comment: 'Feliz Natal! 🎅',
    pattern: (dow, d) => {
      if (dow === 0) return { stamp: 'closed' }
      if (d === 24) return { timeFrom: '08:00', timeTo: '14:00', text: '🎄' }
      if (d === 25) return { stamp: 'closed', text: 'Natal' }
      if (d === 26) return { text: 'Ressaca 😴' }
      if (d === 31) return { symbol: 'reserved' }
      if (d === 5) return { timeFrom: '08:00', timeTo: '18:00', text: '☕', symbol: 'available' }
      if (d === 10) return { timeFrom: '08:00', timeTo: '18:00', text: 'Bolo novo 🍰' }
      if (d === 18) return { timeFrom: '08:00', timeTo: '18:00', text: 'Jazz ao vivo' }
      if (dow === 6) return { timeFrom: '09:00', timeTo: '16:00', symbol: 'few' }
      return { timeFrom: '08:00', timeTo: '18:00', symbol: 'available' }
    },
  },
  {
    name: '08_th_thai',
    year: 2026,
    month: 4,
    bgFile: '1_5_clean.png',
    logoFile: null,
    settings: {
      language: 'th',
      country: 'TH',
      calendarTheme: 'dark-green',
      weekStartsOn: 0,
      shopName: 'ร้านอาหารไทย',
      showHolidays: true,
      showRokuyo: false,
      useWareki: false,
      appTheme: 'dark',
      backgroundOpacity: 0.15,
    },
    gridStyle: 'lined',
    comment: '',
    pattern: (dow, d) => {
      if (dow === 3) return { stamp: 'closed' }
      if (d === 1) return { stamp: 'closed' }
      if (d === 4) return { stamp: 'closed' }
      if (d === 9) return { timeFrom: '10:00', timeTo: '22:00', text: '🍜', stamp: 'full' }
      if (d === 15) return { timeFrom: '10:00', timeTo: '21:00', text: 'ผัดไทย 🥘' }
      if (d === 22) return { timeFrom: '10:00', timeTo: '21:00', text: 'เมนูพิเศษ' }
      if (dow === 5 || dow === 6) return { timeFrom: '10:00', timeTo: '22:00', stamp: 'full' }
      if (dow === 0) return { timeFrom: '10:00', timeTo: '21:00', symbol: 'available' }
      return { timeFrom: '10:00', timeTo: '21:00', symbol: 'available' }
    },
  },
  {
    name: '09_vi_pho',
    year: 2026,
    month: 6,
    bgFile: null,
    logoFile: null,
    settings: {
      language: 'vi',
      country: 'VN',
      calendarTheme: 'light-yellow',
      weekStartsOn: 1,
      shopName: 'Phở Hà Nội',
      showHolidays: true,
      showRokuyo: false,
      useWareki: false,
      appTheme: 'dark',
      backgroundOpacity: 0.15,
    },
    gridStyle: 'rounded',
    comment: '',
    pattern: (dow, d) => {
      if (dow === 0) return { stamp: 'closed' }
      if (d === 8) return { timeFrom: '05:30', timeTo: '14:00', text: 'Phở đặc biệt' }
      if (d === 16) return { timeFrom: '05:30', timeTo: '14:00', text: 'Bún bò 🍜' }
      if (d === 20) return { timeFrom: '05:30', timeTo: '14:00', text: '🍴', symbol: 'few' }
      if (d === 28) return { text: 'Nghỉ phép 🏖️' }
      if (dow === 6) return { timeFrom: '06:00', timeTo: '15:00', symbol: 'available' }
      return { timeFrom: '05:30', timeTo: '14:00', symbol: 'available' }
    },
  },
  {
    name: '10_tl_filipino',
    year: 2026,
    month: 9,
    bgFile: '1_6_clean.png',
    logoFile: null,
    settings: {
      language: 'tl',
      country: 'PH',
      calendarTheme: 'dark-orange',
      weekStartsOn: 0,
      shopName: 'Kubo ni Juan',
      showHolidays: true,
      showRokuyo: false,
      useWareki: false,
      appTheme: 'dark',
      backgroundOpacity: 0.15,
    },
    gridStyle: 'lined',
    comment: '',
    pattern: (dow, d) => {
      if (dow === 0) return { stamp: 'closed' }
      if (d === 8) return { timeFrom: '07:00', timeTo: '20:00', text: 'Adobo day 🍗' }
      if (d === 15) return { timeFrom: '07:00', timeTo: '22:00', text: '🎉Fiesta', stamp: 'full' }
      if (d === 22) return { timeFrom: '07:00', timeTo: '20:00', text: 'Sinigang 🍲' }
      if (d === 31) return { timeFrom: '07:00', timeTo: '20:00', text: '🎃' }
      if (dow === 6) return { timeFrom: '07:00', timeTo: '21:00', symbol: 'few' }
      return { timeFrom: '07:00', timeTo: '20:00', symbol: 'available' }
    },
  },
  {
    name: '11_ne_nepali',
    year: 2026,
    month: 10,
    bgFile: null,
    logoFile: '2_5_clean.png',
    settings: {
      language: 'ne',
      country: 'NP',
      calendarTheme: 'light-purple',
      weekStartsOn: 0,
      shopName: 'काठमाडौँ किचन',
      showHolidays: true,
      showRokuyo: false,
      useWareki: false,
      appTheme: 'dark',
      backgroundOpacity: 0.15,
    },
    gridStyle: 'rounded',
    comment: '',
    pattern: (dow, d) => {
      if (dow === 6) return { stamp: 'closed' }
      if (d === 14 || d === 15) return { stamp: 'closed', text: '⭐Tihar' }
      if (d === 5) return { timeFrom: '11:00', timeTo: '20:00', text: 'मोमो 🥟' }
      if (d === 20) return { timeFrom: '11:00', timeTo: '20:00', text: 'दाल भात' }
      if (d === 26) return { text: 'बिदा 🏔️' }
      if (dow === 5) return { timeFrom: '11:00', timeTo: '21:00', symbol: 'few' }
      if (dow === 0) return { timeFrom: '11:00', timeTo: '20:00', symbol: 'available' }
      return { timeFrom: '11:00', timeTo: '20:00', symbol: 'available' }
    },
  },
]

// ---------------------------------------------------------------------------
// Capture one screenshot
// ---------------------------------------------------------------------------
async function captureOne(browser, config) {
  console.log(`Capturing ${config.name}...`)

  const bgB64 = config.bgFile ? loadBg(config.bgFile) : null
  const logoB64 = config.logoFile ? loadLogo(config.logoFile) : null
  const fullSettings = { ...config.settings, shopLogo: logoB64, backgroundImage: bgB64 }

  const context = await browser.newContext({
    viewport: { width: 600, height: 900 },
    deviceScaleFactor: 2,
  })
  const page = await context.newPage()

  // Load app first (need it to have created the DB schema)
  await page.goto(DEV_URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(300)

  const entries = genEntries(config.year, config.month, config.pattern)
  const mk = `${config.year}-${String(config.month + 1).padStart(2, '0')}`

  // Inject data — use clear() + put() to avoid deleteDatabase blocking
  await page.evaluate(
    async ({ settings, entries, mk, gridStyle, theme, comment }) => {
      const db = await new Promise((res, rej) => {
        const q = indexedDB.open('3min-db', 1)
        q.onupgradeneeded = (e) => {
          const d = e.target.result
          if (!d.objectStoreNames.contains('calendar:entries'))
            d.createObjectStore('calendar:entries', { keyPath: 'date' })
          if (!d.objectStoreNames.contains('data')) d.createObjectStore('data', { keyPath: 'key' })
        }
        q.onsuccess = () => res(q.result)
        q.onerror = () => rej(q.error)
      })
      await new Promise((res, rej) => {
        const tx = db.transaction('calendar:entries', 'readwrite')
        const s = tx.objectStore('calendar:entries')
        s.clear()
        for (const e of entries) s.put(e)
        tx.oncomplete = res
        tx.onerror = () => rej(tx.error)
      })
      await new Promise((res, rej) => {
        const tx = db.transaction('data', 'readwrite')
        const s = tx.objectStore('data')
        s.put({ key: 'calendar:settings', value: settings })
        s.put({ key: 'calendar:themes', value: { [mk]: theme } })
        s.put({ key: 'calendar:gridStyles', value: { [mk]: gridStyle } })
        s.put({ key: 'calendar:comments', value: comment ? { [mk]: comment } : {} })
        tx.oncomplete = res
        tx.onerror = () => rej(tx.error)
      })
      db.close()
    },
    {
      settings: fullSettings,
      entries,
      mk,
      gridStyle: config.gridStyle,
      theme: config.settings.calendarTheme,
      comment: config.comment || '',
    }
  )

  // Reload to apply injected data
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(800)

  // Navigate to target month
  const now = new Date()
  const diff = config.year * 12 + config.month - (now.getFullYear() * 12 + now.getMonth())
  const btn = diff > 0 ? '▶' : '◀'
  for (let i = 0; i < Math.abs(diff); i++) {
    await page.click(`button:has-text("${btn}")`)
    await page.waitForTimeout(50)
  }
  await page.waitForTimeout(500)

  // Deselect any selected cell
  await page.mouse.click(10, 10)
  await page.waitForTimeout(200)

  // Screenshot the canvas only
  const canvas = page.locator('canvas').first()
  if (await canvas.isVisible()) {
    await canvas.screenshot({ path: `${OUTPUT_DIR}/${config.name}.png` })
    console.log(`  OK: ${config.name}`)
  } else {
    console.log(`  WARN: no canvas for ${config.name}`)
  }
  await context.close()
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  const browser = await chromium.launch({ headless: true })

  for (const config of configs) {
    try {
      await captureOne(browser, config)
    } catch (e) {
      console.error(`  ERROR ${config.name}: ${e.message}`)
    }
  }

  await browser.close()
  console.log(`\nDone! ${configs.length} screenshots in ${OUTPUT_DIR}`)
}

main().catch((e) => {
  console.error('FATAL:', e)
  process.exit(1)
})
