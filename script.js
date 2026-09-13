/* ============================================================
   NORTH SOC — script.js
   HOW TO EDIT:
   - Project cards data    → edit the pfData array below
   - Legal modal text      → edit the legContent object
   - Payment / contact     → edit doPayment() / doContact()
   - Theme / nav / filters → edit the individual functions
   ============================================================ */

// ── THEME ──────────────────────────────────────────────────────────────────
document.getElementById('themeBtn').addEventListener('click',()=>{
  const h=document.documentElement;
  h.setAttribute('data-theme',h.getAttribute('data-theme')==='dark'?'light':'dark');
});

// ── MOBILE NAV ─────────────────────────────────────────────────────────────
const burgerBtn=document.getElementById('burgerBtn');
const mobNav=document.getElementById('mobNav');
burgerBtn.addEventListener('click',()=>mobNav.classList.toggle('open'));
function closeMob(){mobNav.classList.remove('open')}

// ── PAYMENT TABS ───────────────────────────────────────────────────────────
function switchTab(id,btn){
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('on'));
  document.querySelectorAll('.ptab').forEach(b=>b.classList.remove('on'));
  document.getElementById('tab-'+id).classList.add('on');
  btn.classList.add('on');
}
function selCard(el){
  document.querySelectorAll('.cicon').forEach(c=>c.classList.remove('sel'));
  el.classList.add('sel');
}
function fmtCard(el){
  let v=el.value.replace(/\D/g,'').substring(0,16);
  el.value=v.match(/.{1,4}/g)?.join(' ')||v;
}
function fmtExp(el){
  let v=el.value.replace(/\D/g,'').substring(0,4);
  if(v.length>=2)v=v.substring(0,2)+' / '+v.substring(2);
  el.value=v;
}

// ══════════════════════════════════════════════════════════════════════════
// ⚙️  NORTH SOC — CONFIGURATION
//     Edit these values to update your business info across the whole site
// ══════════════════════════════════════════════════════════════════════════
const CONFIG = {

  // ── Your WhatsApp number (international format, no + or spaces) ──────────
  // Example: Morocco 212 + your number without leading 0
  // e.g. if your number is 0612345678 → write "212612345678"
  whatsapp: 'YOUR_WHATSAPP_NUMBER',   // ← REPLACE THIS

  // ── Your email ────────────────────────────────────────────────────────────
  email: 'north.soc.info@gmail.com',

  // ── Payment links — paste your real links here after setup ───────────────
  // How to get these links:
  //   PayPal  → paypal.com → Pay & Get Paid → Payment Buttons → Create
  //   Wise    → wise.com   → Account → Payment Links → Create
  //   Payoneer→ payoneer.com → Request Payment → Copy Link
  payments: {
    starter:      'https://www.paypal.com/ncp/payment/YOUR_STARTER_LINK',      // $49/mo
    professional: 'https://www.paypal.com/ncp/payment/YOUR_PRO_LINK',          // $149/mo
    enterprise:   'https://www.paypal.com/ncp/payment/YOUR_ENTERPRISE_LINK',   // $349/mo
    paypal:       'https://www.paypal.com/ncp/payment/YOUR_PAYPAL_LINK',
    wise:         'https://wise.com/pay/YOUR_WISE_LINK',
    bank:         'mailto:north.soc.info@gmail.com?subject=Bank Transfer Request&body=I would like to pay by bank transfer. My selected plan is: ',
  },

  // ── Formspree endpoint — paste your form ID after signing up ─────────────
  // How to get this:
  //   1. Go to formspree.io → sign up free
  //   2. Click "New Form" → name it "North SOC Contact"
  //   3. Copy the endpoint URL e.g. https://formspree.io/f/abcdefgh
  //   4. Paste it below (replace the placeholder)
  formspree: 'https://formspree.io/f/YOUR_FORM_ID',  // ← REPLACE THIS

  // ── WhatsApp message sent after payment ───────────────────────────────────
  whatsappMsg: (plan) =>
    `Hello North SOC! I just completed payment for the ${plan}. Please confirm my subscription and let me know the next steps. Thank you!`,
};
// ══════════════════════════════════════════════════════════════════════════

// ── PLANS ──────────────────────────────────────────────────────────────────
function pickPlan(plan){
  document.getElementById('selPlan').value=plan;
  document.getElementById('payment').scrollIntoView({behavior:'smooth'});
  toast('Plan selected: '+plan);
}

// ── PAYMENT ────────────────────────────────────────────────────────────────
function doPayment(){
  const plan = document.getElementById('selPlan').value;
  const activeTab = document.querySelector('.ptab.on')?.textContent?.trim() || '';

  // Determine which payment link to use
  let payUrl = '';
  if(activeTab.includes('PayPal')){
    payUrl = CONFIG.payments.paypal;
  } else if(activeTab.includes('Apple')){
    toast('Apple Pay coming soon — redirecting to PayPal instead...');
    setTimeout(()=>{ window.open(CONFIG.payments.paypal,'_blank'); afterPayment(plan); },1500);
    return;
  } else if(activeTab.includes('Bank')){
    payUrl = CONFIG.payments.bank + encodeURIComponent(plan);
    window.location.href = payUrl;
    toast('Opening email for bank transfer request...');
    return;
  } else {
    // Card tab — detect plan from selector
    if(plan.includes('Starter'))      payUrl = CONFIG.payments.starter;
    else if(plan.includes('Profess')) payUrl = CONFIG.payments.professional;
    else if(plan.includes('Enter'))   payUrl = CONFIG.payments.enterprise;
    else payUrl = CONFIG.payments.professional; // default
  }

  // Show loading toast, open payment page, then redirect to WhatsApp
  toast('Redirecting to secure checkout...');
  setTimeout(()=>{
    window.open(payUrl,'_blank');
    afterPayment(plan);
  }, 800);
}

// ── AFTER PAYMENT — redirect to WhatsApp ───────────────────────────────────
function afterPayment(plan){
  const msg  = encodeURIComponent(CONFIG.whatsappMsg(plan));
  const waUrl = `https://wa.me/${CONFIG.whatsapp}?text=${msg}`;
  setTimeout(()=>{
    toast('Payment opened! Connecting you to WhatsApp...');
    setTimeout(()=>{ window.open(waUrl,'_blank'); }, 1500);
  }, 2000);
}

// ── CONTACT FORM — sends to Gmail via Formspree ────────────────────────────
async function doContact(){
  const form = document.getElementById('contactForm');
  const name    = form.querySelector('#cName').value.trim();
  const email   = form.querySelector('#cEmail').value.trim();
  const subject = form.querySelector('#cSubject').value;
  const message = form.querySelector('#cMessage').value.trim();

  if(!name || !email || !message){
    toast('Please fill in all fields.');
    return;
  }

  const btn = form.querySelector('.send-btn');
  btn.textContent = 'Sending...';
  btn.disabled = true;

  try {
    const res = await fetch(CONFIG.formspree, {
      method:'POST',
      headers:{'Content-Type':'application/json','Accept':'application/json'},
      body: JSON.stringify({ name, email, subject, message,
        _subject: `North SOC — ${subject} from ${name}` })
    });

    if(res.ok){
      toast('Message sent! We\'ll reply within 2 business days.');
      form.reset();
      // Also open WhatsApp as backup
      const waMsg = encodeURIComponent(
        `Hi North SOC! I just sent a contact form message. Subject: ${subject}. Name: ${name}`
      );
      setTimeout(()=>{
        window.open(`https://wa.me/${CONFIG.whatsapp}?text=${waMsg}`,'_blank');
      }, 2000);
    } else {
      throw new Error('Form submission failed');
    }
  } catch(err) {
    // Fallback: open Gmail compose
    const gmailUrl = `https://mail.google.com/mail/?view=cm&to=${CONFIG.email}&su=${encodeURIComponent('North SOC — '+subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`;
    window.open(gmailUrl,'_blank');
    toast('Opening Gmail as backup...');
  } finally {
    btn.textContent = 'Send Message →';
    btn.disabled = false;
  }
}

// ── TOAST ──────────────────────────────────────────────────────────────────
function toast(msg){
  const t=document.getElementById('toast');
  document.getElementById('toastMsg').textContent=msg;
  t.style.transform='translateY(0)';t.style.opacity='1';
  setTimeout(()=>{t.style.transform='translateY(100px)';t.style.opacity='0';},3400);
}

// ── SCROLL FADE ────────────────────────────────────────────────────────────
const obs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('on')});
},{threshold:.08});
document.querySelectorAll('.fade').forEach(el=>obs.observe(el));

// ── PORTFOLIO ──────────────────────────────────────────────────────────────
function filterPF(cat,btn){
  document.querySelectorAll('.pff').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  document.querySelectorAll('.pf-card').forEach(c=>{
    if(cat==='all'||c.dataset.cat===cat)c.classList.remove('hidden');
    else c.classList.add('hidden');
  });
}

const pfData=[
  {num:'01',title:'Home SOC Lab — Wazuh SIEM Deployment',
   tags:['Wazuh','Ubuntu 22.04','Elasticsearch','Kibana','Linux','Firewall'],
   overview:'Built a fully operational Security Operations Center on a DigitalOcean VPS. Deployed Wazuh SIEM, connected 3 agent machines, configured 40+ detection rules, and built real-time dashboards. This lab is the actual infrastructure used to monitor North SOC clients.',
   why:'Every SOC analyst needs a real lab environment. I built this not for a course — I built it to run my actual business. That makes it real experience, not classroom theory.',
   steps:['Provisioned Ubuntu 22.04 VPS on DigitalOcean with 4GB RAM and 80GB SSD','Installed Wazuh 4.x server following the official quick-start guide','Configured Filebeat and Elasticsearch for log ingestion and storage','Deployed Wazuh agents on 3 test machines (1 Windows 11, 2 Ubuntu)','Wrote 15 custom detection rules for common SMB attack patterns','Built Kibana dashboards: Login Anomalies, Geographic Access Map, Failed Auth Trends','Configured email alerting for High and Critical severity events','Tuned rule thresholds to eliminate false positives over 2 weeks of testing'],
   tools:['Wazuh 4.x','Elasticsearch','Kibana','Filebeat','Ubuntu 22.04','DigitalOcean','UFW Firewall'],
   result:'A fully operational SOC monitoring platform that now monitors real North SOC clients. Detects brute force, unusual logins, file integrity changes, and process anomalies in real time.',
   code:'# Install Wazuh server\ncurl -sO https://packages.wazuh.com/4.7/wazuh-install.sh\nsudo bash ./wazuh-install.sh -a\n\n# Deploy agent on Ubuntu client\ncurl -so wazuh-agent.sh https://packages.wazuh.com/4.7/wazuh-agent.sh\nsudo WAZUH_MANAGER="YOUR_IP" bash ./wazuh-agent.sh'},
  {num:'02',title:'Phishing Campaign Analysis — 50 Real Samples',
   tags:['Email Headers','IOC Extraction','PhishTank','MXToolbox','CyberChef','Reporting'],
   overview:'Collected 50 real phishing emails from PhishTank and OpenPhish. Analyzed each one — extracted headers, decoded base64 content, identified sender infrastructure, traced IPs, and categorized attack types. Produced a consolidated threat report with 120+ unique IOCs.',
   why:'Phishing analysis is the #1 service small businesses need. Being able to analyze any suspicious email and deliver a clear professional report is a core North SOC service.',
   steps:['Downloaded 50 verified phishing samples from PhishTank.com and OpenPhish.com','Set up isolated analysis environment using REMnux VM with no internet access','Analyzed each email: headers, sender IP, SPF/DKIM/DMARC status, links, attachments','Used MXToolbox to trace sender infrastructure and verify authentication failures','Decoded all base64 encoded content and obfuscated URLs using CyberChef','Submitted all links to VirusTotal and URLScan.io — logged detection rates','Categorized attacks: credential harvesting (28), malware delivery (14), BEC (8)','Extracted and formatted 120+ IOCs: IPs, domains, email addresses, hashes','Produced a 12-page consolidated threat report with recommendations'],
   tools:['REMnux','MXToolbox','VirusTotal','URLScan.io','PhishTank','CyberChef','Email Header Analyzer'],
   result:'120+ documented IOCs. 50 phishing techniques categorized across 3 attack types. Methodology now used for all North SOC phishing triage work.',
   code:'import email, re\n\ndef analyze_headers(raw_email):\n    msg = email.message_from_string(raw_email)\n    print("From:", msg["From"])\n    print("Reply-To:", msg["Reply-To"])\n    # Extract IPs from Received headers\n    received = msg.get_all("Received", [])\n    ip_pattern = r"\\b(?:[0-9]{1,3}\\.){3}[0-9]{1,3}\\b"\n    for r in received:\n        ips = re.findall(ip_pattern, r)\n        if ips: print("Relay IP:", ips[0])'},
  {num:'03',title:'Corporate Attack Surface Assessment — OSINT',
   tags:['Maltego','Shodan','theHarvester','Sublist3r','WHOIS','Google Dorks'],
   overview:'Performed a complete OSINT investigation on a fictional company to map its digital attack surface. Discovered exposed subdomains, leaked credentials, employee targets, and misconfigured services — all using free tools and legally available data.',
   why:'OSINT assessment is something I offer to North SOC clients — it shows them what an attacker sees before launching a targeted attack. This project documents the exact methodology I use.',
   steps:['Created fictional company AcmeCorp with realistic domain and email format','Used theHarvester to enumerate emails, subdomains, and hosts from public sources','Ran Sublist3r to find 23 subdomains — 4 were unprotected dev/staging servers','Searched HaveIBeenPwned API — found 3 employee emails in data breaches','Used Shodan to scan exposed IPs — found open RDP port (3389) on one server','Ran Maltego CE to map relationships between domain, IPs, emails, and personnel','Checked Google dorks for exposed documents, login pages, and sensitive files','Documented LinkedIn employee list — identified finance and IT staff for BEC risk','Produced 18-page OSINT report with risk ratings and remediation steps'],
   tools:['Maltego CE','theHarvester','Sublist3r','Shodan','HaveIBeenPwned','Recon-ng','Google Dorks'],
   result:'6 high-risk and 11 medium-risk findings in a fictional company with realistic infrastructure. Methodology is now the standard for all North SOC client OSINT reviews.',
   code:'# theHarvester — enumerate emails and subdomains\npython3 theHarvester.py -d acmecorp.com -l 500 -b all\n\n# Sublist3r — find subdomains\npython3 sublist3r.py -d acmecorp.com -o subdomains.txt\n\n# Shodan — find exposed services\nshodan search "org:AcmeCorp" --fields ip_str,port,banner'},
  {num:'04',title:'Malware Analysis — Ransomware Dissection',
   tags:['ANY.RUN','VirusTotal','PEStudio','MalwareBazaar','YARA','MITRE ATT&CK'],
   overview:'Performed static and dynamic analysis of a publicly documented ransomware sample from MalwareBazaar. Documented behavior, network indicators, file operations, registry modifications, persistence mechanisms, and mapped 12 MITRE ATT&CK techniques. Wrote a custom YARA detection rule.',
   why:'When a client\'s antivirus catches something, they want to know what it was trying to do. Malware analysis turns a scary alert into a clear, actionable report.',
   steps:['Downloaded sample from MalwareBazaar (legal repository for security researchers)','Ran static analysis: file type, strings extraction, PE header analysis with PEStudio','Checked file hash against VirusTotal — confirmed malicious, reviewed 60+ AV detections','Submitted to ANY.RUN interactive sandbox — observed live behavior in browser','Documented: file drops, registry keys, network connections, process tree','Identified 12 MITRE ATT&CK techniques: T1059, T1547, T1486, T1071, and others','Extracted network IOCs: C2 IP, beacon interval, HTTP User-Agent string','Wrote custom YARA rule to detect this malware family','Produced 10-page professional malware analysis report'],
   tools:['ANY.RUN','VirusTotal','PEStudio','MalwareBazaar','REMnux','YARA','Process Monitor','Wireshark'],
   result:'Complete behavioral profile. 12 MITRE ATT&CK techniques documented. Custom YARA detection rule written. Professional analysis report produced in North SOC format.',
   code:'rule Ransomware_Generic_2025 {\n    meta:\n        author = "North SOC"\n        date = "2025-05"\n    strings:\n        $s1 = "YOUR FILES ARE ENCRYPTED" nocase\n        $s2 = "bitcoin" nocase\n        $mutex = "Global\\\\XYZ_MUTEX_123"\n        $ext = ".locked" ascii\n    condition:\n        2 of ($s*) or $mutex or $ext\n}'},
  {num:'05',title:'Incident Response — Compromised Server Investigation',
   tags:['Windows Event Logs','Autopsy','Volatility 3','Chainsaw','Timeline Analysis','DFIR'],
   overview:'Investigated a simulated Windows Server 2019 compromise using a public DFIR dataset. Identified how the attacker got in, what they did, how long they had access, what data they touched, and how they tried to cover their tracks. Full incident report with 10-event timeline produced.',
   why:'Incident response is the most valuable skill in cybersecurity. Clients who experience a breach need someone who can tell them exactly what happened. This proves I can work through a full investigation.',
   steps:['Downloaded Windows Server compromise dataset from DFIR.training (legal forensic dataset)','Mounted disk image in Autopsy — began file system analysis and artifact collection','Extracted Windows Event Logs: Security events 4624, 4625, 4648, 4672, 4720','Found initial access: RDP brute force from IP 185.220.x.x at 02:14 on Day 1','Traced lateral movement: attacker created backdoor account svc_helper via net user','Identified data staging: 4.2GB compressed to C:\\Temp\\backup.zip before exfil','Used Volatility 3 to analyze memory dump — found injected code in svchost.exe','Reconstructed full 10-event attack timeline from access to containment','Produced complete incident report with IOCs, timeline, impact, and remediation'],
   tools:['Autopsy','Volatility 3','Chainsaw','Windows Event Viewer','Log Parser','Timeline Explorer','FTK Imager'],
   result:'Complete attacker timeline reconstructed from 47 hours of log data. Initial vector, persistence, lateral movement, and data staging all identified. Full incident report produced.',
   code:'# Volatility 3 — analyze running processes\npython3 vol.py -f memory.raw windows.pstree\n\n# Find code injection\npython3 vol.py -f memory.raw windows.malfind\n\n# Chainsaw — hunt Windows Event Logs fast\n./chainsaw hunt ./Logs/ --rules rules/ --output findings.csv'},
  {num:'06',title:'IOC Checker — Python Automation Tool',
   tags:['Python 3','VirusTotal API','AbuseIPDB','Shodan API','argparse','GitHub'],
   overview:'Open-source Python CLI tool that takes a list of IPs, domains, or hashes and simultaneously queries VirusTotal, AbuseIPDB, and Shodan — returning a color-coded threat report in seconds. Reduces manual IOC triage from 30 minutes to under 60 seconds.',
   why:'Manual IOC lookups waste 20-30 minutes per incident. This tool reduces it to 10 seconds. Every North SOC alert generates IOCs that need checking — automation makes the service faster.',
   steps:['Planned requirements: support IP, domain, URL, hash inputs; query 3 APIs; color output','Built VirusTotal API integration — returns detection score (e.g. 45/70)','Added AbuseIPDB integration — returns abuse confidence score and recent reports','Added Shodan integration — returns open ports and banners for IPs','Built CSV export function — saves full report with timestamp','Added rate limiting to respect free API tier limits (no paid tier required)','Implemented argparse CLI with --file flag for bulk IOC list input','Added color output with rich library: red=malicious, yellow=suspicious, green=clean','Published to GitHub with full README, setup guide, and example outputs'],
   tools:['Python 3','requests','rich library','argparse','VirusTotal API','AbuseIPDB API','Shodan API','GitHub'],
   result:'Open-source tool on GitHub. Reduces IOC triage from 30 minutes to under 60 seconds. Used daily in North SOC operations to process client alert IOCs.',
   code:'# Usage\npython3 ioc_checker.py --file iocs.txt --output report.csv\n\n# Example iocs.txt\n185.220.101.45\nmalicious-domain.net\na3f9c2e8b1d7f4c2a8e3f9b2\n\n# Output\n[!] 185.220.101.45 MALICIOUS (VT:45/70|Abuse:97%|Ports:443,80,22)\n[?] suspicious-site.net SUSPICIOUS (VT:3/70|Age:2 days)\n[OK] clean-company.com CLEAN (VT:0/70|Abuse:0%)'},
  {num:'07',title:'Network Traffic Threat Hunt — PCAP Analysis',
   tags:['Wireshark','Zeek','tshark','NetworkMiner','C2 Detection','DNS Tunneling'],
   overview:'Analyzed a 2GB network capture file from a public DFIR challenge. Used Wireshark filters and Zeek logs to identify three threats hidden in normal-looking traffic: C2 beaconing over HTTPS, DNS tunneling for data exfiltration, and an internal lateral movement scan.',
   why:'Most attacks happen at the network layer and leave traces in packet captures. Finding malicious traffic inside gigabytes of normal data is a critical T2 analyst skill.',
   steps:['Downloaded PCAP challenge dataset from DFIR.training (public legal dataset)','Ran Zeek to convert PCAP to structured logs: conn.log, dns.log, http.log, ssl.log','Used Wireshark statistics to identify unusual traffic volumes by IP and protocol','Found C2 beaconing: HTTPS traffic to 185.220.x.x every 300 seconds — too regular','Found 2,400 DNS queries to *.malware-c2.net with unusually long subdomains','Decoded subdomain data — confirmed DNS tunneling (base64 encoded in queries)','Identified internal port scan: one host scanned 254 IPs on port 445 in 3 minutes','Extracted all IOCs: C2 IPs, C2 domains, scanning host, DNS exfil domain','Produced threat hunt report with methodology, findings, timeline, and IOCs'],
   tools:['Wireshark','Zeek','tshark','NetworkMiner','RITA','CapSa'],
   result:'3 distinct threats found in 2GB dataset. 28 unique IOCs extracted. DNS tunneling methodology documented. Threat hunt report used as North SOC methodology reference.',
   code:'# Run Zeek on PCAP file\nzeek -C -r capture.pcap local\n\n# tshark: find regular beaconing\ntshark -r capture.pcap -T fields -e ip.dst \\\n  -e frame.time_delta -Y "ssl.handshake" \\\n  | sort | uniq -c | sort -rn\n\n# Find DNS tunneling (long subdomains)\ntshark -r capture.pcap -T fields -e dns.qry.name \\\n  -Y "dns" | awk "length($0)>50"'},
  {num:'08',title:'TryHackMe SOC Level 1 — Full Completion',
   tags:['MITRE ATT&CK','Splunk','ELK Stack','Zeek','Snort','Volatility','MISP'],
   overview:'Completed all 60+ rooms in TryHackMe\'s official SOC Level 1 learning path — the most comprehensive structured SOC training available. Covered every foundational SOC domain from threat intelligence to incident response. Official completion certificate earned.',
   why:'SOC Level 1 is the recognized benchmark for entry-level SOC readiness. Completing it end-to-end proves structured, comprehensive training across all foundational competencies.',
   steps:['Cyber Defence Frameworks: MITRE ATT&CK, Unified Kill Chain, Diamond Model','Cyber Threat Intelligence: threat feeds, MISP, OpenCTI, threat actor profiling','Network Security & Traffic Analysis: Zeek, Snort, NetworkMiner, Wireshark','Endpoint Security Monitoring: Windows Event Logs, Sysmon, Osquery, Wazuh','SIEM: Splunk and ELK Stack — investigation workflows and detection engineering','Digital Forensics & Incident Response: disk forensics, memory analysis, artifacts','Phishing Analysis: email headers, URL investigation, attachment triage workflows','SOC operations: alert triage, escalation procedures, report writing','Earned official TryHackMe SOC Level 1 completion certificate'],
   tools:['TryHackMe','Splunk','ELK/Elastic','Wireshark','Zeek','Snort','Sysmon','MISP','OpenCTI','Volatility'],
   result:'Official SOC Level 1 certification. 60+ lab environments completed. Comprehensive notes across all SOC competencies. Foundation for all North SOC service delivery.',
   code:'# Key Splunk SPL queries from the path\n\n# Find failed logins by source IP\nindex=security EventCode=4625\n| stats count by src_ip, user\n| where count > 5\n| sort -count\n\n# Detect process injection (Sysmon)\nindex=sysmon EventCode=8\n| table _time, SourceImage, TargetImage'},
  {num:'09',title:'Splunk Dashboard — SMB Security Monitoring',
   tags:['Splunk SPL','Dashboard XML','Alert Rules','SMB Security','KPI Panels'],
   overview:'Designed and built a Splunk dashboard specifically for small business security monitoring. Built for non-technical business owners — plain language labels, color-coded status indicators, and executive summaries instead of raw log data.',
   why:'North SOC clients are business owners, not security analysts. They need dashboards they understand at a glance. This proves I can build client-friendly security visibility tools.',
   steps:['Identified 6 critical SMB security indicators based on SANS top attack vectors','Built Login Anomaly panel: logins outside business hours and from new locations','Built Geographic Access Map: plots login locations — flags unusual countries','Built Failed Auth Trending: line chart of failed logins over 7 days with threshold','Built Phishing Alert panel: counts phishing emails by sender domain with triage link','Built Top Talkers panel: IPs generating unusual outbound traffic volume','Built Critical Alerts panel: last 24h alerts sorted by severity with drill-down','Added executive summary: plain-language status (All Clear / Attention / Critical)','Exported dashboard XML for 30-minute deployment on any Splunk instance'],
   tools:['Splunk Enterprise','SPL (Search Processing Language)','Splunk Dashboard XML','Lookup Tables','Scheduled Alerts'],
   result:'Complete Splunk dashboard template deployable in 30 minutes for any SMB client. Now the standard North SOC client-facing visibility tool. Saves 2+ hours per week of manual reporting.',
   code:'| tstats count WHERE index=wineventlog\n    sourcetype=WinEventLog:Security\n    EventCode=4625\n    BY src_ip _time span=1h\n| timechart span=1h sum(count) AS failed_logins\n| where failed_logins > 10\n\n// Alert: trigger when >10 failed logins in 1h from 1 IP'}
];

function openPF(i){
  const p=pfData[i];
  document.getElementById('pmNum').textContent='Project '+p.num;
  document.getElementById('pmTitle').textContent=p.title;
  document.getElementById('pmTags').innerHTML=p.tags.map(t=>`<span>${t}</span>`).join('');
  const steps=p.steps.map((s,j)=>`<div class="pm-step"><div class="pm-sn">${j+1}</div><div class="pm-st">${s}</div></div>`).join('');
  const tools=p.tools.map(t=>`<span>${t}</span>`).join('');
  document.getElementById('pmBody').innerHTML=`
    <div class="pm-sec">Overview</div>
    <p style="font-size:.82rem;line-height:1.75;color:var(--muted)">${p.overview}</p>
    <div class="pm-sec">Why I Built This</div>
    <div class="pm-why">${p.why}</div>
    <div class="pm-sec">What I Did — Step by Step</div>
    ${steps}
    <div class="pm-sec">Tools Used</div>
    <div class="pm-tools">${tools}</div>
    <div class="pm-sec">Results</div>
    <div class="pm-result">${p.result}</div>
    <div class="pm-sec">Code Sample</div>
    <div class="pm-code">${p.code}</div>
  `;
  document.getElementById('pmOverlay').style.display='block';
  document.getElementById('pmModal').style.display='flex';
  document.body.style.overflow='hidden';
}
function closePF(){
  document.getElementById('pmOverlay').style.display='none';
  document.getElementById('pmModal').style.display='none';
  document.body.style.overflow='';
}

// ── LEGAL MODALS ───────────────────────────────────────────────────────────
const legContent={
  tos:{title:'Terms of Service',html:`
    <p class="leg-p" style="font-size:.72rem;color:var(--muted)">Last updated: May 2025</p>
    <div class="leg-h2">1. Acceptance of Terms</div>
    <p class="leg-p">By accessing the North SOC website, subscribing to any plan, or using any of our services, you agree to be bound by these Terms of Service. If you do not agree, do not use our services.</p>
    <div class="leg-h2">2. Services</div>
    <p class="leg-p">North Security Operations Center provides remote cybersecurity monitoring, threat detection, phishing analysis, OSINT investigations, incident reporting, and advisory services. Services currently available are listed on our website. Services marked "Coming Soon" are not yet available.</p>
    <div class="leg-h2">3. Eligibility</div>
    <p class="leg-p">You must be at least 18 years old and legally capable of entering binding contracts. By subscribing, you confirm you have legal authority to enter this agreement.</p>
    <div class="leg-h2">4. Acceptable Use</div>
    <p class="leg-p">You agree NOT to use our services to monitor systems you do not own or have written authorization to monitor, conduct illegal activity, misrepresent your identity, or violate applicable laws.</p>
    <div class="leg-h2">5. Payment</div>
    <p class="leg-p">All plans are billed in advance in USD. Fees are non-refundable except as required by law. North reserves the right to change pricing with 30 days written notice.</p>
    <div class="leg-h2">6. No Security Guarantee</div>
    <p class="leg-p"><strong>Important:</strong> No cybersecurity service can guarantee complete protection. North reduces risk but cannot guarantee all incidents will be prevented. The client remains ultimately responsible for the security of their own systems.</p>
    <div class="leg-h2">7. Limitation of Liability</div>
    <p class="leg-p">North's total liability for any claim shall not exceed fees paid in the 3 months before the claim arose. North is not liable for indirect, incidental, or consequential damages.</p>
    <div class="leg-h2">8. Governing Law</div>
    <p class="leg-p">These Terms are governed by the laws of the Kingdom of Morocco. Disputes shall be resolved through good-faith negotiation, and if unresolved, by the competent courts in Morocco.</p>
    <div class="leg-h2">9. Contact</div>
    <p class="leg-p">For questions: <strong>north.soc.info@gmail.com</strong></p>
  `},
  privacy:{title:'Privacy Policy',html:`
    <p class="leg-p" style="font-size:.72rem;color:var(--muted)">Last updated: May 2025</p>
    <div class="leg-h2">1. Who We Are</div>
    <p class="leg-p">North Security Operations Center operates northsoc.io and provides cybersecurity services. Contact: <strong>north.soc.info@gmail.com</strong></p>
    <div class="leg-h2">2. Data We Collect</div>
    <table class="leg-tbl"><tr><th>Type</th><th>Data</th><th>Purpose</th></tr>
    <tr><td>Contact</td><td>Name, email, company</td><td>To respond and deliver services</td></tr>
    <tr><td>Payment</td><td>Billing name, country</td><td>To process payments (card data via Stripe/PayPal)</td></tr>
    <tr><td>Service</td><td>System logs, alerts</td><td>To deliver monitoring services</td></tr>
    <tr><td>Usage</td><td>IP, pages visited</td><td>Analytics (with consent only)</td></tr></table>
    <div class="leg-h2">3. How We Use Your Data</div>
    <p class="leg-p">To deliver services, process payments, send reports and alerts, respond to support, and comply with legal obligations. We <strong>never sell</strong> your data.</p>
    <div class="leg-h2">4. Data Sharing</div>
    <p class="leg-p">We share data only with: Stripe/PayPal (payments), cloud hosting providers (servers), and email providers (communications). All are bound by confidentiality agreements.</p>
    <div class="leg-h2">5. Your Rights</div>
    <p class="leg-p">You have the right to access, correct, delete, and export your data. Email <strong>north.soc.info@gmail.com</strong> — we respond within 30 days.</p>
    <div class="leg-h2">6. Data Retention</div>
    <p class="leg-p">Client data is retained for the duration of the contract plus 3 years for legal purposes. Contact form submissions are retained for 12 months.</p>
    <div class="leg-h2">7. Contact</div>
    <p class="leg-p">Privacy inquiries: <strong>north.soc.info@gmail.com</strong></p>
  `},
  cookies:{title:'Cookie Settings',html:`
    <div class="leg-h2">What Are Cookies?</div>
    <p class="leg-p">Cookies are small files stored on your device. We only use cookies that are necessary or that you explicitly consent to.</p>
    <div class="leg-h2">Manage Your Preferences</div>
    <div class="ck-row">
      <div><div class="ck-lbl">🔒 Essential Cookies <span style="background:var(--red);color:#fff;font-size:.65rem;padding:.1rem .4rem;border-radius:4px;margin-left:.3rem;font-weight:400">Required</span></div><div class="ck-desc">Required for the site to function. Cannot be disabled.</div></div>
      <label class="sw"><input type="checkbox" checked disabled><span class="sl"></span></label>
    </div>
    <div class="ck-row">
      <div><div class="ck-lbl">📊 Analytics Cookies</div><div class="ck-desc">Help us understand how visitors use the site. Data is anonymized.</div></div>
      <label class="sw"><input type="checkbox" id="ckAnalytics"><span class="sl"></span></label>
    </div>
    <div class="ck-row">
      <div><div class="ck-lbl">⚡ Functional Cookies</div><div class="ck-desc">Remember your preferences like dark/light theme across sessions.</div></div>
      <label class="sw"><input type="checkbox" id="ckFunctional" checked><span class="sl"></span></label>
    </div>
    <div class="ck-row" style="border-bottom:none">
      <div><div class="ck-lbl">🎯 Marketing Cookies</div><div class="ck-desc">We do not use marketing or advertising cookies. North is ad-free.</div></div>
      <label class="sw"><input type="checkbox" disabled><span class="sl"></span></label>
    </div>
    <div style="margin-top:1.4rem;display:flex;gap:.7rem;flex-wrap:wrap">
      <button onclick="saveCookies()" class="pbtn pbtn-fill" style="width:auto;padding:.6rem 1.3rem">Save Preferences</button>
      <button onclick="acceptCookies('all');closeLeg()" class="pbtn pbtn-out" style="width:auto;padding:.6rem 1.3rem;border:1px solid var(--border)">Accept All</button>
    </div>
  `}
};

function openLeg(type){
  const d=legContent[type];
  document.getElementById('legTitle').textContent=d.title;
  document.getElementById('legBody').innerHTML=d.html;
  document.getElementById('legOverlay').style.display='block';
  document.getElementById('legModal').style.display='flex';
  document.body.style.overflow='hidden';
}
function closeLeg(){
  document.getElementById('legOverlay').style.display='none';
  document.getElementById('legModal').style.display='none';
  document.body.style.overflow='';
}
function saveCookies(){
  localStorage.setItem('northCookies','custom');
  document.getElementById('cookieBar').classList.add('gone');
  toast('Cookie preferences saved!');
  closeLeg();
}

// ── COOKIES ────────────────────────────────────────────────────────────────
function acceptCookies(t){
  localStorage.setItem('northCookies',t);
  document.getElementById('cookieBar').classList.add('gone');
  toast(t==='all'?'All cookies accepted. Thank you!':'Essential cookies only. Got it.');
}
if(localStorage.getItem('northCookies')){
  document.getElementById('cookieBar').classList.add('gone');
}

// ── ESC KEY ────────────────────────────────────────────────────────────────
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){closePF();closeLeg();}
});

// ── OPEN WHATSAPP ───────────────────────────────────────────────────────────
function openWhatsApp(msg){
  const text = msg || 'Hi North SOC! I found your website and I have a question about your security services.';
  window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`, '_blank');
}
