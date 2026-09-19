import fs from "node:fs/promises"
import path from "node:path"

import sharp from "sharp"

const root = process.cwd()
const source = path.join(root, "public", "logo.png")
const destination = path.join(root, "public", "icons")
const background = "#fcfcfa"

await fs.mkdir(destination, { recursive: true })

// O símbolo ocupa a parte superior do logo original. O recorte mantém as
// setas originais sem o lettering, que ficaria ilegível em tamanhos pequenos.
const symbol = await sharp(source)
  .extract({ left: 40, top: 0, width: 95, height: 75 })
  .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer()

async function renderIcon(filename, size, symbolScale) {
  const symbolSize = Math.round(size * symbolScale)
  const resizedSymbol = await sharp(symbol)
    .resize(symbolSize, symbolSize, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer()

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background,
    },
  })
    .composite([{ input: resizedSymbol, gravity: "centre" }])
    .png()
    .toFile(path.join(destination, filename))
}

await Promise.all([
  renderIcon("icon-192x192.png", 192, 0.68),
  renderIcon("icon-512x512.png", 512, 0.68),
  // 60% do quadro mantém o símbolo dentro da zona segura de ícones maskable.
  renderIcon("icon-maskable-512x512.png", 512, 0.6),
  renderIcon("apple-touch-icon.png", 180, 0.68),
])
