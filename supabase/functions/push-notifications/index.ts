import { createClient } from 'jsr:@supabase/supabase-js@2'

console.log('Push Notifications Function Started')

interface Job {
  id: string
  title: string
  company: string
  description: string
  status: string
  created_at: string
}

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: Job
  schema: 'public'
  old_record: null | Job
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

Deno.serve(async (req) => {
  try {
    const payload: WebhookPayload = await req.json()
    
    console.log('Webhook received:', payload.type, payload.table)
    
    // Only process new job insertions
    if (payload.type !== 'INSERT' || payload.table !== 'jobs') {
      return new Response('Not a job insertion', { status: 200 })
    }
    
    const job = payload.record
    console.log('New job created:', job.title, 'at', job.company)
    
    // Get all push tokens from the database
    const { data: tokens, error } = await supabase
      .from('notification_tokens')
      .select('token')
      .eq('platform', 'expo')
    
    if (error) {
      console.error('Error fetching tokens:', error)
      return new Response('Error fetching tokens', { status: 500 })
    }
    
    if (!tokens || tokens.length === 0) {
      console.log('No push tokens found')
      return new Response('No tokens to send to', { status: 200 })
    }
    
    console.log(`Sending notifications to ${tokens.length} devices`)
    
    // Prepare notification messages
    const messages = tokens.map(({ token }) => ({
      to: token,
      sound: 'default',
      title: '🚨 New Job Available!',
      body: `${job.title} at ${job.company}`,
      data: {
        type: 'NEW_JOB',
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
      },
      priority: 'high',
      channelId: 'default',
    }))
    
    // Send notifications using Expo's push service
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('EXPO_ACCESS_TOKEN')}`,
      },
      body: JSON.stringify(messages),
    })
    
    const result = await response.json()
    console.log('Push notification result:', result)
    
    return new Response(JSON.stringify({
      success: true,
      sentTo: tokens.length,
      result: result
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
    
  } catch (error) {
    console.error('Function error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}) 