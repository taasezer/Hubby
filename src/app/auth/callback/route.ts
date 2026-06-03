import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/tr/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data?.session) {
      // Eğer GitHub'dan bir erişim anahtarı (provider_token) geldiyse, bunu profile kaydet
      if (data.session.provider_token) {
        await supabase
          .from('profiles')
          .update({ github_token: data.session.provider_token })
          .eq('id', data.session.user.id)
      }
      
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/tr/login?error=auth_failed`)
}
