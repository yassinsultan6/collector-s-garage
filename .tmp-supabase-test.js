const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenvPath = path.join(__dirname, '.env.local');
const env = Object.fromEntries(fs.readFileSync(dotenvPath, 'utf8').split(/\r?\n/).filter(Boolean).map((line) => line.split(/=(.*)/s).slice(0,2)).filter(([k]) => k));
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
console.log('url', !!url, 'key', !!key);
const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
(async () => {
  const bucket = 'vehicle-photos';
  const path = 'debug-test.txt';
  const result = await supabase.storage.from(bucket).upload(path, Buffer.from('hello'), { upsert: true, contentType: 'text/plain' });
  console.log(JSON.stringify(result, null, 2));
})();
