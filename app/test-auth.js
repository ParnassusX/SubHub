// Simple authentication test script
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kfzuzxsywaptgbumrfgv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmenV6eHN5d2FwdGdidW1yZmd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTgwNTYsImV4cCI6MjA2NjUzNDA1Nn0.zXged0s_9x_K7i1EA8N8MaysPOYe-LJS4Nz0uzz3L8w';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log('🔄 Testing Supabase authentication...');
  
  try {
    // Test 1: Check current session
    console.log('\n1. Checking current session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('Session:', session ? 'exists' : 'null');
    console.log('Session error:', sessionError?.message || 'none');
    
    // Test 2: Try to sign in with test credentials
    console.log('\n2. Testing sign in with test credentials...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'test@subhub.com',
      password: 'test123456'
    });
    
    console.log('Sign in success:', signInData.user ? 'yes' : 'no');
    console.log('Sign in error:', signInError?.message || 'none');
    
    if (signInData.user) {
      console.log('User ID:', signInData.user.id);
      console.log('User email:', signInData.user.email);
      
      // Test 3: Fetch profile data
      console.log('\n3. Fetching profile data...');
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', signInData.user.id)
        .single();
      
      console.log('Profile data:', profileData ? 'exists' : 'null');
      console.log('Profile error:', profileError?.message || 'none');
      
      if (profileData) {
        console.log('Profile role:', profileData.role);
        console.log('Profile name:', profileData.name);
      }
      
      // Test 4: Fetch subscriptions
      console.log('\n4. Fetching subscriptions...');
      const { data: subscriptions, error: subsError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', signInData.user.id)
        .limit(5);
      
      console.log('Subscriptions count:', subscriptions ? subscriptions.length : 0);
      console.log('Subscriptions error:', subsError?.message || 'none');
      
      // Test 5: Sign out
      console.log('\n5. Testing sign out...');
      const { error: signOutError } = await supabase.auth.signOut();
      console.log('Sign out error:', signOutError?.message || 'none');
    }
    
    console.log('\n✅ Authentication test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAuth();
