import Link from 'next/link'

export const metadata = {
  title: 'Blog',
  description: 'Read articles about technology, data science, physics, and more.',
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Blog</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Coming soon! Articles about technology, data science, physics, and more.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
