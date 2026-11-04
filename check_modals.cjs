const fs = require('fs');

['frontend/src/components/shared/DecoupledDischargeModal.jsx',
 'frontend/src/components/shared/PatientMergeModal.jsx',
 'frontend/src/components/shared/MaternityParturitionModal.jsx',
 'frontend/src/components/shared/MultiSplitPaymentModal.jsx'
].forEach(p => {
  if (fs.existsSync(p)) {
    const c = fs.readFileSync(p, 'utf8');
    c.split('\n').forEach((l, i) => {
      if (l.includes('<select') || l.includes('<Select') || l.includes('SelectItem')) {
        console.log(`${p}:${i+1}: ${l.trim()}`);
      }
    });
  }
});

