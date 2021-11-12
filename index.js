const axios = require('axios').default;
const fs = require('fs');
const path = require('path');
const prompt = require('prompt-sync')();
const delay = (ms) => new Promise(r => setTimeout(r, ms));

let cred = {};
const credPath = path.join(__dirname, './.cred.json');
if (!fs.existsSync(credPath)) {
  const login = prompt('Enter INSA login : ');
  const password = prompt('Password : ');
  cred = {login, password};
  fs.writeFileSync(credPath, JSON.stringify(cred));
} else {
  cred = JSON.parse(fs.readFileSync(credPath).toString());
}

const run = async () => {
  let phpsession, h;

  const step1 = async () => {
    let res = await axios.post(
      'https://controller-bourges.insa-cvl.fr/portal_api.php',
      'action=init&free_urls=',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36',
        }
      }
    );
    console.log(res.data);
    phpsession = res.headers['set-cookie'][0].match(/PHPSESSID=[a-zA-Z0-9]+/)[0];
    h = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36',
      'Cookie': phpsession,
      'Origin': 'https://controller-bourges.insa-cvl.fr',
      'Referer': 'https://controller-bourges.insa-cvl.fr/101/portal/',
      'X-Requested-With': 'XMLHttpRequest',
    };
    console.log(h);
    //return;
  };

  while (true) {
    try {
      await step1();
      break;
    } catch (e) {
      console.log('ERR STEP 1. Retrying...');
      await delay(2000);
    }
  }

  const step2 = async () => {
    res = await axios.post(
      'https://controller-bourges.insa-cvl.fr/portal_api.php',
      `action=authenticate&login=${encodeURIComponent(cred.login)}&password=${encodeURIComponent(cred.password)}&policy_accept=true&from_ajax=true&wispr_mode=false`,
      {
        headers: h
      }
    );
    console.log(res.data);
  };

  while (true) {
    try {
      await step2();
      break;
    } catch (e) {
      console.log('ERR STEP 2. Retrying...');
      await delay(2000);
    }
  }
};

run();