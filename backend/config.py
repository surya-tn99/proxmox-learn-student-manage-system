import json
import os
from pathlib import Path

# Resolve config.json relative to this script's location
# __file__ gives the path to config.py, we go up one level to project root
SCRIPT_DIR = Path(__file__).parent.resolve()
PROJECT_ROOT = SCRIPT_DIR.parent  # Goes up from backend/ to project root
CONFIG_FILE = PROJECT_ROOT / 'config.json'

with open(CONFIG_FILE, 'r') as f:
    RAW = json.load(f)

# Proxmox IP from config (hardcoded, no env file needed)
PROXMOX_IP = RAW['proxmox_ip']

# Build configuration from config.json
conf = {
    # Frontend URL (for CORS, etc.)
    'frontend_url': f"http://{PROXMOX_IP}:8011",

    # Database config from config.json
    'database': {
        'host': RAW['services']['database']['internal_ip'],
        'port': RAW['services']['database']['internal_port'],
        'connection_string': f"postgresql://user:pass@{RAW['services']['database']['internal_ip']}:{RAW['services']['database']['internal_port']}/dbname"
    },

    # Backend service ports
    'backend': {
        'internal_ip': RAW['services']['backend']['internal_ip'],
        'internal_port': RAW['services']['backend']['internal_port'],
        'nginx_port': RAW['services']['backend']['nginx_port']
    },

    # URLs template
    'urls': {
        'external_backend': f"http://{PROXMOX_IP}:8012/api",
        'internal_database': RAW['urls_template']['internal_database']
    }
}

# Make config dict available as module-level attributes for easy importing
for key, value in conf.items():
    globals()[key] = value