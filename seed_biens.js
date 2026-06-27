const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Fetching profiles...');
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .limit(1);

  if (profileError) {
    console.error('Error fetching profiles:', profileError);
    return;
  }

  let ownerId = null;
  if (profiles && profiles.length > 0) {
    ownerId = profiles[0].id;
    console.log(`Found owner: ${ownerId}`);
  } else {
    console.log('No profiles found, owner_id will be null. You may not see these in your dashboard due to RLS.');
  }

  const dummyBiens = [];
  const types = ['Appartement', 'Maison', 'Studio', 'Villa', 'Bureau'];
  const cities = ['Dakar', 'Abidjan', 'Paris', 'Lyon', 'Bamako'];

  for (let i = 1; i <= 10; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    dummyBiens.push({
      id: `bien-dummy-${Date.now()}-${i}`,
      owner_id: ownerId,
      name: `${type} Moderne ${i}`,
      type: type,
      address: `${i * 10} Rue de la Paix`,
      city: city,
      country: 'Sénégal',
      monthly_rent: Math.floor(Math.random() * 1000 + 500) * 1000, // 500k to 1.5M
      status: Math.random() > 0.5 ? 'vacant' : 'occupied',
      description: `Un magnifique ${type.toLowerCase()} situé à ${city}.`,
      is_validated: true,
      tenant_count: 0
    });
  }

  console.log('Inserting 10 biens...');
  const { data, error } = await supabase
    .from('properties')
    .insert(dummyBiens);

  if (error) {
    console.error('Error inserting properties:', error);
  } else {
    console.log('Successfully inserted 10 biens!');
  }
}

seed();
