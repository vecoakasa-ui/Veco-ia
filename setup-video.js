const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const tokenMatch = env.match(/SUPABASE_ACCESS_TOKEN=(.*)/);
const token = tokenMatch ? tokenMatch[1].trim() : null;

if (!token) {
  console.error('No SUPABASE_ACCESS_TOKEN found');
  process.exit(1);
}

const url = 'https://api.supabase.com/v1/projects/khbvtoeohzoegcxhcuqn/database/query';
const query = `
  ALTER TABLE leases ADD COLUMN IF NOT EXISTS inventory_in_video_url TEXT;
  ALTER TABLE leases ADD COLUMN IF NOT EXISTS inventory_out_video_url TEXT;
`;

fetch(url, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ query })
})
.then(res => res.json())
.then(data => {
  console.log('SQL Response:', data);
  
  // Now create the storage bucket
/* eslint-disable */
const { createClient } = require('@supabase/supabase-js');
  const sbUrlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
  const sbKeyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);
  
  if (sbUrlMatch && sbKeyMatch) {
    const supabase = createClient(sbUrlMatch[1].trim(), sbKeyMatch[1].trim());
    supabase.storage.createBucket('inventory-videos', { public: true })
      .then(({data, error}) => {
        if (error && error.message !== 'The resource already exists') {
            console.error('Error creating bucket:', error);
        } else {
            console.log('Bucket created or already exists');
        }
      });
  }
})
.catch(err => {
  console.error('Error:', err);
});
