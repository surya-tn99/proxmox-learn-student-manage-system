// Browser-safe config - NO Node.js imports (fs, path crash in browser)
// All URLs sourced from config.json at deployment time

// Proxmox dynamic IP - update if IP changes
const PROXMOX_IP = "10.161.50.66";

export const config = {
  // External URLs (accessed from browser via nginx on Proxmox IP)
  urls: {
    // Frontend accessed via Proxmox IP port 8011
    externalFrontend: `http://${PROXMOX_IP}:8011`,

    // Backend API accessed via Proxmox IP port 8012
    externalBackend: `http://${PROXMOX_IP}:8012/api`,

    // Internal database URL (for reference, not typically called directly from browser)
    internalDatabase: `http://10.10.10.13:8001`
  },

  // Service settings - internal IPs for VM communication
  services: {
    frontend: {
      internalIp: "10.10.10.11",
      internalPort: 5173,
      nginxPort: 8011
    },
    backend: {
      internalIp: "10.10.10.12",
      internalPort: 8000,
      nginxPort: 8012
    },
    database: {
      internalIp: "10.10.10.13",
      internalPort: 8001
    }
  }
};