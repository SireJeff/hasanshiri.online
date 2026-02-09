'use client'

import { cn } from '@/lib/utils'

/**
 * Reusable Language Tabs Component
 * For bilingual content editing
 */

export function LanguageTabs({
  activeTab,
  onTabChange,
  tabs = [
    { id: 'en', label: 'English', dir: 'ltr' },
    { id: 'fa', label: 'فارسی', dir: 'rtl' }
  ]
}) {
  return (
    <div className="flex gap-2 border-b border-border mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === tab.id
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
          dir={tab.dir}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

/**
 * Wrapper component for bilingual form fields
 */
export function BilingualField({
  label,
  activeTab,
  nameEn,
  nameFa,
  valueEn,
  valueFa,
  onChangeEn,
  onChangeFa,
  type = 'text',
  placeholderEn = '',
  placeholderFa = '',
  rows = 3,
  required = false,
}) {
  const isRtl = activeTab === 'fa'

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>

      {activeTab === 'en' ? (
        type === 'textarea' ? (
          <textarea
            name={nameEn}
            value={valueEn}
            onChange={onChangeEn}
            rows={rows}
            required={required}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder={placeholderEn}
          />
        ) : (
          <input
            type={type}
            name={nameEn}
            value={valueEn}
            onChange={onChangeEn}
            required={required}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder={placeholderEn}
          />
        )
      ) : (
        type === 'textarea' ? (
          <textarea
            name={nameFa}
            value={valueFa}
            onChange={onChangeFa}
            rows={rows}
            required={required}
            dir="rtl"
            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none text-right"
            placeholder={placeholderFa}
          />
        ) : (
          <input
            type={type}
            name={nameFa}
            value={valueFa}
            onChange={onChangeFa}
            required={required}
            dir="rtl"
            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-right"
            placeholder={placeholderFa}
          />
        )
      )}
    </div>
  )
}
