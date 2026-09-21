import fs from 'fs';
import path from 'path';

// Resolve config.json from project root (two levels up from src/)
const PROJECT_ROOT = path.resolve('/home/kuttypuli/Projects/mini2-student-manage');
const RAW = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'config.json'), 'utf-8'));

// Proxmox IP from config (hardcoded, no env file needed)
const PROXMOX_IP = RAW.proxmox_ip;

// Build URLs from config
export const config = {
  // Frontend service settings
  frontend: {
    internalIp: RAW.services.frontend.internal_ip,
    internalPort: RAW.services.frontend.internal_port,
    nginxPort: RAW.services.frontend.nginx_port
  },

  // Backend service settings
  backend: {
    internalIp: RAW.services.backend.internal_ip,
    internalPort: RAW.services.backend.internal_port,
    nginxPort: RAW.services.backend.nginx_port
  },

  // Database service settings
  database: {
    internalIp: RAW.services.database.internal_ip,
    internalPort: RAW.services.database.internal_port
  },

  // External URLs (use Proxmox IP for external access)
  urls: {
    // External: accessed via Proxmox IP from outside network
    externalFrontend: `http://${PROXMOX_IP}:8011`,
    externalBackend: `http://${PROXMOX_IP}:8012/api`,

    // Internal: for VM-to-VM communication within Proxmox network
    internalDatabase: RAW.urls_template.internal_database
  }
};