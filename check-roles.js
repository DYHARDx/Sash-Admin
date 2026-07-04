const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      process.env[match[1]] = match[2].replace(/^"|"$/g, '');
    }
  });
}

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Role = mongoose.models.Role || mongoose.model('Role', new mongoose.Schema({}, { strict: false }));
  console.log("Roles in DB:", JSON.stringify(await Role.find({}), null, 2));
  process.exit(0);
});
