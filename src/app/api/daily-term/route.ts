import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const vertical_id = searchParams.get('vertical_id') ?? 'general'
  const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0]

  const supabase = createClient()

  const { data: term, error } = await supabase
    .from('terms')
    .select('*')
    .eq('vertical_id', vertical_id)
    .eq('published', true)
    .eq('publish_date', date)
    .single()

  if (error || !term) {
    // Fall back to the most recent published term if no term for today
    const { data: fallback, error: fallbackError } = await supabase
      .from('terms')
      .select('*')
      .eq('vertical_id', vertical_id)
      .eq('published', true)
      .order('publish_date', { ascending: false })
      .limit(1)
      .single()

    if (fallbackError || !fallback) {
      return NextResponse.json({ error: 'No term found' }, { status: 404 })
    }

    return NextResponse.json({ term: fallback })
  }

  return NextResponse.json({ term })
}
