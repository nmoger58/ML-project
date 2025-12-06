#!/usr/bin/env python3
"""
WiFi Network Device Scanner
Shows all devices connected to your current WiFi network
"""

import socket
import subprocess
import platform
import threading
import time
import re
import json
import ipaddress
from concurrent.futures import ThreadPoolExecutor

class WiFiDeviceScanner:
    def __init__(self):
        self.system = platform.system()
        self.devices = []
        
        # Device manufacturer database (MAC OUI)
        self.mac_vendors = {
            # Apple
            '00:03:93': 'Apple', '00:0A:95': 'Apple', '00:0D:93': 'Apple',
            '00:11:24': 'Apple', '00:14:51': 'Apple', '00:16:CB': 'Apple',
            '00:17:F2': 'Apple', '00:19:E3': 'Apple', '00:1B:63': 'Apple',
            '00:1E:C2': 'Apple', '00:1F:F3': 'Apple', '00:21:E9': 'Apple',
            '00:23:12': 'Apple', '00:23:DF': 'Apple', '00:25:00': 'Apple',
            '3C:D0:F8': 'Apple', '40:B0:FA': 'Apple', '44:00:10': 'Apple',
            '4C:B1:99': 'Apple', '58:1F:AA': 'Apple', '5C:F9:38': 'Apple',
            '68:96:7B': 'Apple', '6C:72:E7': 'Apple', '70:DE:E2': 'Apple',
            '78:4F:43': 'Apple', '7C:6D:62': 'Apple', '80:92:9F': 'Apple',
            '88:C6:63': 'Apple', '8C:58:77': 'Apple', '90:B0:ED': 'Apple',
            '90:FD:61': 'Apple', '94:E9:6A': 'Apple', '98:B8:E3': 'Apple',
            '9C:04:EB': 'Apple', 'A4:B1:97': 'Apple', 'A8:96:8A': 'Apple',
            'AC:BC:32': 'Apple', 'B0:65:BD': 'Apple', 'B4:F0:AB': 'Apple',
            'B8:78:26': 'Apple', 'BC:52:B7': 'Apple', 'C0:9A:D0': 'Apple',
            'C4:B3:01': 'Apple', 'C8:BC:C8': 'Apple', 'CC:08:8D': 'Apple',
            'D0:23:DB': 'Apple', 'D4:90:9C': 'Apple', 'D8:30:62': 'Apple',
            'DC:2B:2A': 'Apple', 'E0:B9:BA': 'Apple', 'E4:C6:3D': 'Apple',
            'E8:B2:AC': 'Apple', 'F0:B4:79': 'Apple', 'F4:F1:5A': 'Apple',
            'F8:1E:DF': 'Apple', 'FC:25:3F': 'Apple',
            
            # Samsung
            '00:12:FB': 'Samsung', '00:15:B9': 'Samsung', '00:16:32': 'Samsung',
            '00:17:D5': 'Samsung', '00:18:AF': 'Samsung', '00:1A:8A': 'Samsung',
            '00:1B:98': 'Samsung', '00:1D:25': 'Samsung', '00:1E:7D': 'Samsung',
            '00:21:19': 'Samsung', '00:21:D1': 'Samsung', '00:23:39': 'Samsung',
            '00:25:38': 'Samsung', '00:26:37': 'Samsung', '08:08:C2': 'Samsung',
            '08:D4:2B': 'Samsung', '10:30:47': 'Samsung', '18:3A:2D': 'Samsung',
            '1C:62:B8': 'Samsung', '20:64:32': 'Samsung', '28:39:26': 'Samsung',
            '2C:44:01': 'Samsung', '34:23:BA': 'Samsung', '38:AA:3C': 'Samsung',
            '3C:8B:FE': 'Samsung', '40:0E:85': 'Samsung', '44:4E:6D': 'Samsung',
            '4C:3C:16': 'Samsung', '50:CC:F8': 'Samsung', '54:88:0E': 'Samsung',
            '58:21:EF': 'Samsung', '5C:0A:5B': 'Samsung', '60:6B:BD': 'Samsung',
            '64:B3:10': 'Samsung', '68:EB:C5': 'Samsung', '6C:2F:2C': 'Samsung',
            '70:F9:27': 'Samsung', '78:1F:DB': 'Samsung', '7C:61:66': 'Samsung',
            '84:38:38': 'Samsung', '88:32:9B': 'Samsung', '8C:77:12': 'Samsung',
            '90:18:7C': 'Samsung', '94:35:0A': 'Samsung', '98:52:3D': 'Samsung',
            '9C:02:98': 'Samsung', 'A0:0B:BA': 'Samsung', 'A4:EB:D3': 'Samsung',
            'A8:DB:03': 'Samsung', 'AC:5F:3E': 'Samsung', 'B0:EC:71': 'Samsung',
            'B4:79:A7': 'Samsung', 'BC:20:A4': 'Samsung', 'C0:BD:D1': 'Samsung',
            'C4:57:6E': 'Samsung', 'C8:A8:23': 'Samsung', 'CC:3A:61': 'Samsung',
            'D0:59:E4': 'Samsung', 'D4:87:D8': 'Samsung', 'D8:90:E8': 'Samsung',
            'DC:71:44': 'Samsung', 'E0:91:F5': 'Samsung', 'E4:40:E2': 'Samsung',
            'E8:50:8B': 'Samsung', 'EC:1F:72': 'Samsung', 'F0:25:B7': 'Samsung',
            'F4:7B:5E': 'Samsung', 'F8:04:2E': 'Samsung', 'FC:00:12': 'Samsung',
            
            # Google
            '00:1A:11': 'Google', '84:38:38': 'Google', 'AC:37:43': 'Google',
            'F8:8F:CA': 'Google', 'CC:3A:61': 'Google', '64:BC:0C': 'Google',
            'F4:F5:E8': 'Google', '00:9A:CD': 'Google', '40:B4:F0': 'Google',
            'B4:CE:F6': 'Google', 'A4:77:33': 'Google', '2C:F0:A2': 'Google',
            
            # Huawei
            '00:15:E9': 'Huawei', '00:18:82': 'Huawei', '00:1E:10': 'Huawei',
            '00:25:9E': 'Huawei', '08:7A:4C': 'Huawei', '0C:96:E6': 'Huawei',
            '10:44:00': 'Huawei', '18:59:33': 'Huawei', '1C:1D:67': 'Huawei',
            '20:68:9D': 'Huawei', '28:6E:D4': 'Huawei', '2C:AB:00': 'Huawei',
            '34:6B:D3': 'Huawei', '3C:FA:43': 'Huawei', '40:4E:36': 'Huawei',
            '48:DB:50': 'Huawei', '4C:54:99': 'Huawei', '50:8F:4C': 'Huawei',
            '54:25:EA': 'Huawei', '58:2A:F7': 'Huawei', '5C:C9:D3': 'Huawei',
            '60:DE:44': 'Huawei', '64:3E:8C': 'Huawei', '68:3E:34': 'Huawei',
            '6C:92:BF': 'Huawei', '70:72:3C': 'Huawei', '74:A7:22': 'Huawei',
            '78:D9:9D': 'Huawei', '7C:B0:C2': 'Huawei', '80:71:7A': 'Huawei',
            '84:A4:23': 'Huawei', '88:CF:98': 'Huawei', '8C:34:FD': 'Huawei',
            '90:67:1C': 'Huawei', '94:04:9C': 'Huawei', '98:54:1B': 'Huawei',
            '9C:28:EF': 'Huawei', 'A0:C5:89': 'Huawei', 'A4:C4:94': 'Huawei',
            'A8:7E:EA': 'Huawei', 'AC:E2:15': 'Huawei', 'B0:E5:ED': 'Huawei',
            'B4:CD:27': 'Huawei', 'B8:08:CF': 'Huawei', 'BC:25:E7': 'Huawei',
            'C0:EE:FB': 'Huawei', 'C4:0B:CB': 'Huawei', 'C8:BE:19': 'Huawei',
            'CC:E6:FA': 'Huawei', 'D0:7A:B5': 'Huawei', 'D4:20:B0': 'Huawei',
            'D8:49:2F': 'Huawei', 'DC:D9:16': 'Huawei', 'E0:19:1D': 'Huawei',
            'E4:D3:32': 'Huawei', 'E8:CD:2D': 'Huawei', 'EC:23:3D': 'Huawei',
            'F0:79:59': 'Huawei', 'F4:28:53': 'Huawei', 'F8:7A:20': 'Huawei',
            'FC:48:EF': 'Huawei',
            
            # Xiaomi
            '00:9E:C8': 'Xiaomi', '14:F6:5A': 'Xiaomi', '18:59:36': 'Xiaomi',
            '2C:EA:DC': 'Xiaomi', '34:CE:00': 'Xiaomi', '50:8F:4C': 'Xiaomi',
            '64:09:80': 'Xiaomi', '68:DF:DD': 'Xiaomi', '78:11:DC': 'Xiaomi',
            '8C:BE:BE': 'Xiaomi', '98:FA:9B': 'Xiaomi', 'AC:C1:EE': 'Xiaomi',
            'C4:0B:CB': 'Xiaomi', 'D4:F4:6F': 'Xiaomi', 'F0:B4:29': 'Xiaomi',
            'F8:A4:5F': 'Xiaomi', '04:CF:8C': 'Xiaomi', '28:6C:07': 'Xiaomi',
            '3C:BD:D8': 'Xiaomi', '40:31:3C': 'Xiaomi', '4C:49:E3': 'Xiaomi',
            '58:44:98': 'Xiaomi', '64:B4:73': 'Xiaomi', '70:2A:D5': 'Xiaomi',
            '7C:1D:D9': 'Xiaomi', '80:E6:50': 'Xiaomi', '8C:53:C3': 'Xiaomi',
            '90:67:1C': 'Xiaomi', '9C:99:A0': 'Xiaomi', 'A0:86:C6': 'Xiaomi',
            'A4:50:46': 'Xiaomi', 'B0:E2:35': 'Xiaomi', 'B8:8A:60': 'Xiaomi',
            
            # OnePlus
            'AC:37:43': 'OnePlus', '98:5F:D3': 'OnePlus', 'E8:B2:AC': 'OnePlus',
            
            # Oppo
            '14:7D:DA': 'Oppo', '5C:C6:D4': 'Oppo', '90:68:C3': 'Oppo',
            
            # Vivo
            '08:86:3B': 'Vivo', '3C:28:6D': 'Vivo', 'C8:0E:14': 'Vivo',
            
            # LG
            '00:07:AB': 'LG', '00:09:DF': 'LG', '00:0C:E5': 'LG',
            '00:0F:1F': 'LG', '00:16:B2': 'LG', '00:1C:62': 'LG',
            '00:1E:75': 'LG', '00:22:A9': 'LG', '10:68:3F': 'LG',
            '20:21:A5': 'LG', '34:BB:1F': 'LG', '3C:A9:F4': 'LG',
            '60:D0:A9': 'LG', '64:BC:58': 'LG', '68:C4:4D': 'LG',
            '78:5D:C8': 'LG', '88:36:6C': 'LG', '9C:3A:AF': 'LG',
            'A0:07:98': 'LG', 'B4:EF:39': 'LG', 'C0:38:96': 'LG',
            'CC:FA:00': 'LG', 'E8:5A:8B': 'LG', 'F8:04:2E': 'LG',
            
            # Motorola
            '00:04:56': 'Motorola', '00:08:0E': 'Motorola', '00:0A:28': 'Motorola',
            '00:0C:E5': 'Motorola', '00:11:1B': 'Motorola', '00:13:71': 'Motorola',
            '00:15:9A': 'Motorola', '00:18:C0': 'Motorola', '00:1A:DB': 'Motorola',
            '00:1C:11': 'Motorola', '00:1E:46': 'Motorola', '00:21:CC': 'Motorola',
            '00:23:75': 'Motorola', '00:25:67': 'Motorola', '2C:36:F8': 'Motorola',
            '34:FC:EF': 'Motorola', '50:E0:85': 'Motorola', '5C:0E:8B': 'Motorola',
            '60:F2:62': 'Motorola', '68:EF:BD': 'Motorola', 'A4:ED:4E': 'Motorola',
            'C4:8E:8F': 'Motorola', 'F0:25:72': 'Motorola', 'F4:8C:50': 'Motorola',
            
            # Nokia
            '00:02:EE': 'Nokia', '00:0B:E1': 'Nokia', '00:0E:ED': 'Nokia',
            '00:12:EE': 'Nokia', '00:15:A0': 'Nokia', '00:18:0F': 'Nokia',
            '00:1B:AF': 'Nokia', '00:1D:6E': 'Nokia', '00:1F:01': 'Nokia',
            '00:21:08': 'Nokia', '00:23:45': 'Nokia', '00:25:47': 'Nokia',
            
            # Router/Network brands
            '00:11:D8': 'Netgear', '00:14:6C': 'Netgear', '00:18:E7': 'Netgear',
            '00:1B:2F': 'Netgear', '00:1E:2A': 'Netgear', '00:22:3F': 'Netgear',
            '00:26:F2': 'Netgear', '2C:30:33': 'Netgear', '44:94:FC': 'Netgear',
            '84:1B:5E': 'Netgear', 'A0:40:A0': 'Netgear', 'C0:3F:0E': 'Netgear',
            
            '00:07:7D': 'Linksys', '00:0C:41': 'Linksys', '00:12:17': 'Linksys',
            '00:13:10': 'Linksys', '00:14:BF': 'Linksys', '00:16:B6': 'Linksys',
            '00:18:39': 'Linksys', '00:1A:70': 'Linksys', '00:1C:10': 'Linksys',
            '00:1D:7E': 'Linksys', '00:1E:E5': 'Linksys', '00:20:A6': 'Linksys',
            '00:21:29': 'Linksys', '00:22:6B': 'Linksys', '00:23:69': 'Linksys',
            '00:25:9C': 'Linksys', '48:F8:B3': 'Linksys', '94:10:3E': 'Linksys',
            'C0:56:27': 'Linksys', 'E4:F4:C6': 'Linksys',
            
            '00:07:40': 'D-Link', '00:0F:3D': 'D-Link', '00:11:95': 'D-Link',
            '00:13:46': 'D-Link', '00:15:E9': 'D-Link', '00:17:9A': 'D-Link',
            '00:19:5B': 'D-Link', '00:1B:11': 'D-Link', '00:1C:F0': 'D-Link',
            '00:1E:58': 'D-Link', '00:21:91': 'D-Link', '00:22:B0': 'D-Link',
            '00:24:01': 'D-Link', '00:26:5A': 'D-Link', '14:D6:4D': 'D-Link',
            '1C:7E:E5': 'D-Link', '28:10:7B': 'D-Link', '34:08:04': 'D-Link',
            '50:46:5D': 'D-Link', '54:B8:0A': 'D-Link', '5C:D9:98': 'D-Link',
            '78:32:1B': 'D-Link', '84:C9:B2': 'D-Link', '90:94:E4': 'D-Link',
            'B0:C7:45': 'D-Link', 'C8:D3:A3': 'D-Link', 'CC:B2:55': 'D-Link',
            'E4:6F:13': 'D-Link', 'F0:7D:68': 'D-Link',
            
            '00:0B:AB': 'TP-Link', '00:27:19': 'TP-Link', '14:CC:20': 'TP-Link',
            '1C:61:B4': 'TP-Link', '50:C7:BF': 'TP-Link', '60:E3:27': 'TP-Link',
            '64:70:02': 'TP-Link', '98:DE:D0': 'TP-Link', 'A4:2B:B0': 'TP-Link',
            'C0:4A:00': 'TP-Link', 'C4:6E:1F': 'TP-Link', 'E8:DE:27': 'TP-Link',
            'F4:EC:38': 'TP-Link', 'F8:1A:67': 'TP-Link'
        }
        
        # Common device ports to check
        self.common_ports = [22, 23, 53, 80, 135, 139, 443, 445, 554, 993, 995, 1723, 3389, 5353, 8080]

    def get_current_wifi_info(self):
        """Get current WiFi network information"""
        wifi_info = {'ssid': 'Unknown', 'network': None, 'local_ip': None}
        
        try:
            # Get local IP and network
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            local_ip = s.getsockname()[0]
            s.close()
            
            # Calculate network range
            network = ipaddress.IPv4Network(f"{local_ip}/24", strict=False)
            wifi_info['local_ip'] = local_ip
            wifi_info['network'] = str(network)
            
            # Get WiFi SSID
            if self.system == "Windows":
                result = subprocess.run(["netsh", "wlan", "show", "interface"], 
                                      capture_output=True, text=True)
                for line in result.stdout.split('\n'):
                    if 'SSID' in line and 'BSSID' not in line:
                        wifi_info['ssid'] = line.split(':')[1].strip()
                        break
            
            elif self.system == "Darwin":  # macOS
                result = subprocess.run(["/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport", "-I"], 
                                      capture_output=True, text=True)
                for line in result.stdout.split('\n'):
                    if ' SSID:' in line:
                        wifi_info['ssid'] = line.split(':')[1].strip()
                        break
            
            elif self.system == "Linux":
                result = subprocess.run(["nmcli", "-t", "-f", "active,ssid", "dev", "wifi"], 
                                      capture_output=True, text=True)
                for line in result.stdout.split('\n'):
                    if line.startswith('yes:'):
                        wifi_info['ssid'] = line.split(':')[1]
                        break
        
        except Exception as e:
            print(f"Error getting WiFi info: {e}")
        
        return wifi_info

    def get_arp_table(self):
        """Get devices from ARP table"""
        devices = []
        try:
            if self.system == "Windows":
                result = subprocess.run(["arp", "-a"], capture_output=True, text=True)
            else:
                result = subprocess.run(["arp", "-a"], capture_output=True, text=True)
            
            if result.returncode == 0:
                for line in result.stdout.split('\n'):
                    if self.system == "Windows":
                        # Windows: "  192.168.1.100    aa-bb-cc-dd-ee-ff     dynamic"
                        parts = line.strip().split()
                        if len(parts) >= 2 and self.is_valid_ip(parts[0]):
                            ip = parts[0]
                            mac = parts[1].replace('-', ':').upper()
                            if len(mac) == 17:
                                devices.append({'ip': ip, 'mac': mac, 'source': 'ARP'})
                    else:
                        # Linux/Mac: "gateway (192.168.1.1) at aa:bb:cc:dd:ee:ff [ether] on wlan0"
                        ip_match = re.search(r'(\d+\.\d+\.\d+\.\d+)', line)
                        mac_match = re.search(r'([a-fA-F0-9:]{17})', line)
                        if ip_match and mac_match:
                            devices.append({
                                'ip': ip_match.group(1),
                                'mac': mac_match.group(1).upper(),
                                'source': 'ARP'
                            })
        except Exception as e:
            print(f"Error reading ARP table: {e}")
        
        return devices

    def ping_sweep(self, network_str):
        """Ping sweep the network to find active devices"""
        print(f"🔍 Ping sweeping network {network_str}...")
        active_devices = []
        
        network = ipaddress.IPv4Network(network_str, strict=False)
        
        def ping_host(ip_str):
            try:
                if self.system == "Windows":
                    cmd = ["ping", "-n", "1", "-w", "1000", ip_str]
                else:
                    cmd = ["ping", "-c", "1", "-W", "1", ip_str]
                
                result = subprocess.run(cmd, capture_output=True, text=True, timeout=2)
                if result.returncode == 0:
                    return ip_str
            except:
                pass
            return None
        
        # Use threading for faster scanning
        with ThreadPoolExecutor(max_workers=50) as executor:
            futures = []
            for ip in network.hosts():
                futures.append(executor.submit(ping_host, str(ip)))
            
            for future in futures:
                result = future.result()
                if result:
                    active_devices.append({'ip': result, 'source': 'Ping'})
                    print(f"  ✓ {result}")
        
        return active_devices

    def get_hostname(self, ip):
        """Get hostname for IP address"""
        try:
            hostname = socket.gethostbyaddr(ip)[0]
            return hostname
        except:
            return ""

    def get_vendor_from_mac(self, mac):
        """Get vendor from MAC address"""
        if not mac or len(mac) < 8:
            return "Unknown"
        
        oui = mac[:8].upper()
        return self.mac_vendors.get(oui, "Unknown")

    def scan_ports(self, ip, ports=None):
        """Scan common ports on a device"""
        if ports is None:
            ports = [22, 80, 443, 135, 139, 445, 5353, 8009]
        
        open_ports = []
        for port in ports:
            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(0.3)
                result = sock.connect_ex((ip, port))
                if result == 0:
                    open_ports.append(port)
                sock.close()
            except:
                pass
        
        return open_ports

    def identify_device_type(self, vendor, hostname, open_ports):
        """Identify device type based on available information"""
        hostname_lower = hostname.lower() if hostname else ""
        
        # Check for phones
        phone_indicators = ['iphone', 'android', 'phone', 'mobile', 'samsung', 'pixel', 
                           'galaxy', 'oneplus', 'huawei', 'xiaomi', 'oppo', 'vivo']
        if any(indicator in hostname_lower for indicator in phone_indicators):
            return "📱 Smartphone"
        
        if vendor in ['Apple', 'Samsung', 'Google', 'Huawei', 'Xiaomi', 'OnePlus', 'Oppo', 'Vivo']:
            # Check for phone-specific ports
            if 5353 in open_ports:  # mDNS (common on phones)
                return "📱 Smartphone"
            elif 8009 in open_ports:  # Chromecast (Android phones)
                return "📱 Android Phone"
            else:
                return f"📱 {vendor} Device (likely phone)"
        
        # Check for computers
        if 22 in open_ports or 3389 in open_ports:
            return "💻 Computer"
        
        # Check for routers/network devices
        if vendor in ['Netgear', 'Linksys', 'D-Link', 'TP-Link']:
            return "🌐 Router/Network Device"
        
        if 80 in open_ports and 443 in open_ports:
            return "🌐 Web Server/Router"
        
        # Check for media devices
        if 'tv' in hostname_lower or 'roku' in hostname_lower or 'chromecast' in hostname_lower:
            return "📺 Media Device"
        
        # Check for printers
        if 'printer' in hostname_lower or 'canon' in hostname_lower or 'epson' in hostname_lower:
            return "🖨️ Printer"
        
        # Generic device
        if vendor != "Unknown":
            return f"📟 {vendor} Device"
        
        return "❓ Unknown Device"

    def is_valid_ip(self, ip):
        """Check if IP address is valid"""
        try:
            ipaddress.IPv4Address(ip)
            return True
        except:
            return False

    def merge_device_info(self, arp_devices, ping_devices):
        """Merge information from different sources"""
        all_devices = {}
        
        # Add ARP devices (these have MAC addresses)
        for device in arp_devices:
            ip = device['ip']
            all_devices[ip] = {
                'ip': ip,
                'mac': device['mac'],
                'vendor': self.get_vendor_from_mac(device['mac']),
                'hostname': '',
                'open_ports': [],
                'device_type': '',
                'status': 'Active',
                'source': 'ARP Table'
            }
        
        # Add ping-only devices (no MAC info)
        for device in ping_devices:
            ip = device['ip']
            if ip not in all_devices:
                all_devices[ip] = {
                    'ip': ip,
                    'mac': 'Unknown',
                    'vendor': 'Unknown',
                    'hostname': '',
                    'open_ports': [],
                    'device_type': '',
                    'status': 'Active',
                    'source': 'Ping Scan'
                }
        
        return list(all_devices.values())

    def scan_wifi_network(self):
        """Main function to scan WiFi network"""
        print("🔍" + "=" * 60)
        print("📡 WIFI NETWORK DEVICE SCANNER")
        print("=" * 62)
        print("Scanning all devices connected to your WiFi network...")
        print("=" * 62 + "\n")
        
        # Get current WiFi information
        wifi_info = self.get_current_wifi_info()
        print(f"🌐 Connected to WiFi: {wifi_info['ssid']}")
        print(f"📍 Your IP Address: {wifi_info['local_ip']}")
        print(f"🔍 Network Range: {wifi_info['network']}\n")
        
        # Step 1: Get devices from ARP table
        print("📋 Step 1: Reading ARP table...")
        arp_devices = self.get_arp_table()
        print(f"   Found {len(arp_devices)} devices in ARP table\n")
        
        # Step 2: Ping sweep the network
        print("🏓 Step 2: Ping sweeping network...")
        ping_devices = []
        if wifi_info['network']:
            ping_devices = self.ping_sweep(wifi_info['network'])
        print(f"   Found {len(ping_devices)} responding devices\n")
        
        # Step 3: Merge device information
        print("🔗 Step 3: Merging device information...")
        all_devices = self.merge_device_info(arp_devices, ping_devices)
        
        # Step 4: Get detailed information for each device
        print("🔍 Step 4: Gathering detailed device information...")
        
        def analyze_device(device):
            ip = device['ip']
            
            # Skip our own IP
            if ip == wifi_info['local_ip']:
                return None
            
            print(f"   Analyzing {ip}...")
            
            # Get hostname
            device['hostname'] = self.get_hostname(ip)
            
            # Scan ports
            device['open_ports'] = self.scan_ports(ip)
            
            # Identify device type
            device['device_type'] = self.identify_device_type(
                device['vendor'], 
                device['hostname'], 
                device['open_ports']
            )
            
            return device
        
        # Use threading for faster analysis
        with ThreadPoolExecutor(max_workers=10) as executor:
            analyzed_devices = list(executor.map(analyze_device, all_devices))
            final_devices = [d for d in analyzed_devices if d is not None]
        
        return final_devices, wifi_info

    def display_results(self, devices, wifi_info):
        """Display scan results"""
        print("\n" + "=" * 62)
        print("📊 WIFI NETWORK SCAN RESULTS")
        print("=" * 62)
        
        if not devices:
            print("❌ No other devices found on the network")
            print("\n💡 Possible reasons:")
            print("• All devices have network discovery disabled")
            print("• Devices are using different IP ranges") 
            print("• Router has device isolation enabled")
            return
        
        print(f"🌐 WiFi Network: {wifi_info['ssid']}")
        print(f"📊 Total Devices Found: {len(devices)}")
        
        # Group devices by type
        phones = [d for d in devices if '📱' in d['device_type']]
        computers = [d for d in devices if '💻' in d['device_type']]
        network_devices = [d for d in devices if '🌐' in d['device_type']]
        media_devices = [d for d in devices if '📺' in d['device_type']]
        other_devices = [d for d in devices if d not in phones + computers + network_devices + media_devices]
        
        print(f"📱 Smartphones: {len(phones)}")
        print(f"💻 Computers: {len(computers)}")
        print(f"🌐 Network Devices: {len(network_devices)}")
        print(f"📺 Media Devices: {len(media_devices)}")
        print(f"📟 Other Devices: {len(other_devices)}")
        
        print("\n" + "=" * 62)
        print("🔍 DETAILED DEVICE LIST")
        print("=" * 62)
        
        for i, device in enumerate(devices, 1):
            print(f"\n{i}. {device['device_type']}")
            print(f"   📍 IP Address: {device['ip']}")
            
            if device['mac'] != 'Unknown':
                print(f"   🔗 MAC Address: {device['mac']}")
            
            if device['vendor'] != 'Unknown':
                print(f"   🏭 Manufacturer: {device['vendor']}")
            
            if device['hostname']:
                print(f"   🏷️ Device Name: {device['hostname']}")
            
            if device['open_ports']:
                ports_str = ', '.join(map(str, device['open_ports']))
                print(f"   🔓 Open Ports: {ports_str}")
            
            print(f"   📡 Detection: {device['source']}")
            print(f"   ✅ Status: {device['status']}")
        
        print("\n" + "=" * 62)
        print("📱 SMARTPHONES SUMMARY")
        print("=" * 62)
        
        if phones:
            print(f"Found {len(phones)} smartphone(s):")
            for phone in phones:
                vendor_info = f" ({phone['vendor']})" if phone['vendor'] != 'Unknown' else ""
                hostname_info = f" - {phone['hostname']}" if phone['hostname'] else ""
                print(f"  📱 {phone['ip']}{vendor_info}{hostname_info}")
        else:
            print("❌ No smartphones detected")
            print("\n💡 Tips to detect phones:")
            print("• Make sure phones are connected to WiFi (not mobile data)")
            print("• Phones might have network discovery disabled")
            print("• Some phones randomize MAC addresses for privacy")

    def export_results(self, devices, filename="wifi_devices.json"):
        """Export results to JSON file"""
        try:
            with open(filename, 'w') as f:
                json.dump(devices, f, indent=2)
            print(f"\n💾 Results exported to {filename}")
        except Exception as e:
            print(f"\n❌ Error exporting results: {e}")

def main():
    scanner = WiFiDeviceScanner()
    
    try:
        devices, wifi_info = scanner.scan_wifi_network()
        scanner.display_results(devices, wifi_info)
        
        # Ask if user wants to export results
        export = input("\n📝 Export results to JSON file? (y/n): ").lower().strip()
        if export == 'y':
            scanner.export_results(devices)
        
        print("\n✅ Network scan complete!")
        
    except KeyboardInterrupt:
        print("\n\n⏹️ Scan interrupted by user")
    except Exception as e:
        print(f"\n❌ Error during scan: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()