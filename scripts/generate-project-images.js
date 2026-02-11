#!/usr/bin/env node

/**
 * Generate Placeholder Project Images
 *
 * This script creates simple SVG placeholder images for projects.
 * Usage: node scripts/generate-project-images.js
 */

import fs from 'fs'
import path from 'path'

const projectsDir = path.join(process.cwd(), 'public', 'images', 'projects')

// Ensure projects directory exists
if (!fs.existsSync(projectsDir)) {
  fs.mkdirSync(projectsDir, { recursive: true })
}

const projects = [
  { slug: 'libertad', color: '#3b82f6', title: 'Libertad' },
  { slug: 'interpolation', color: '#10b981', title: 'Interpolation' },
  { slug: 'restaurant-analysis', color: '#f59e0b', title: 'Restaurant Analysis' },
  { slug: 'ssh-vpn', color: '#ef4444', title: 'SSH VPN' },
  { slug: 'nasta', color: '#8b5cf6', title: 'NASA Analysis' },
  { slug: 'tg-reminder', color: '#06b6d4', title: 'TG Reminder' },
  { slug: 'oscillation', color: '#ec4899', title: 'Oscillation' },
  { slug: 'skm-website', color: '#14b8a6', title: 'SKM Website' },
  { slug: 'uissf', color: '#f97316', title: 'UISSF' }
]

function generateSVG(project) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="${project.color}"/>
  <text x="200" y="150" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle">
    ${project.title}
  </text>
  <text x="200" y="180" font-family="Arial, sans-serif" font-size="14" fill="white" text-anchor="middle" opacity="0.8">
    Project Placeholder
  </text>
</svg>`
}

// Generate SVG files
for (const project of projects) {
  const svg = generateSVG(project)
  const filePath = path.join(projectsDir, `${project.slug}.png`)

  // Note: This creates SVG files with .png extension
  // For actual PNG files, you'd need a library like sharp
  fs.writeFileSync(filePath.replace('.png', '.svg'), svg)
  console.log(`Created: ${project.slug}.svg`)
}

console.log('\n✅ Placeholder SVG images created!')
console.log('Note: These are SVG files. For production, replace with actual PNG images.')
