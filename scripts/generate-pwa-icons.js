#!/usr/bin/env node

/**
 * PWA Icon Generator
 *
 * This script generates PWA icons from an SVG source.
 * Requirements: npm install sharp
 *
 * Usage: node scripts/generate-pwa-icons.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Check if sharp is available
if (!sharp) {
  console.error('Error: sharp is not installed.')
  console.error('Please run: npm install sharp --save-dev')
  process.exit(1)
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]
const iconsDir = path.join(process.cwd(), 'public', 'icons')
const svgSource = path.join(iconsDir, 'icon.svg')

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true })
}

// Check if SVG source exists
if (!fs.existsSync(svgSource)) {
  console.error('Error: icon.svg not found in public/icons directory')
  process.exit(1)
}

async function generateIcons() {
  console.log('Generating PWA icons...\n')

  try {
    for (const size of sizes) {
      const outputFile = path.join(iconsDir, `icon-${size}x${size}.png`)

      await sharp(svgSource)
        .resize(size, size, { fit: 'cover' })
        .png()
        .toFile(outputFile)

      console.log(`✓ Generated icon-${size}x${size}.png`)
    }

    console.log('\n✓ All PWA icons generated successfully!')
    console.log('\nIcon sizes:', sizes.join(', '))
  } catch (error) {
    console.error('Error generating icons:', error)
    process.exit(1)
  }
}

generateIcons()
