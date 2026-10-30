import fs from 'fs';

const path = 'src/pages/PatientsList.jsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('PatientMergeModal')) {
  content = content.replace(
    'import ConfirmDialog from "@/components/shared/ConfirmDialog";',
    'import ConfirmDialog from "@/components/shared/ConfirmDialog";\nimport PatientMergeModal from "@/components/shared/PatientMergeModal";\nimport { GitMerge } from "lucide-react";'
  );

  content = content.replace(
    '  const [sortBy, setSortBy] = useState("createdAt");',
    '  const [sortBy, setSortBy] = useState("createdAt");\n  const [mergingPatient, setMergingPatient] = useState(null);'
  );

  // Add the Merge button to the action cell
  content = content.replace(
    '<Button variant="outline" size="icon" className="h-7 w-7 text-xs rounded-md border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => handleEditPatient(p.id)} title="Edit">',
    `<Button variant="outline" size="icon" className="h-7 w-7 text-xs rounded-md border-blue-200 text-blue-700 hover:bg-blue-50" onClick={() => setMergingPatient(p)} title="Merge Patient Records">\n                              <GitMerge size={13} />\n                            </Button>\n                            <Button variant="outline" size="icon" className="h-7 w-7 text-xs rounded-md border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => handleEditPatient(p.id)} title="Edit">`
  );

  // Add the PatientMergeModal component at the bottom before closing
  content = content.replace(
    '</motion.div>\n  );',
    `<PatientMergeModal\n        sourcePatient={mergingPatient}\n        isOpen={Boolean(mergingPatient)}\n        onClose={() => setMergingPatient(null)}\n        onMergeComplete={fetchPatients}\n      />\n    </motion.div>\n  );`
  );

  if (!content.includes('PatientMergeModal')) {
    // CRLF fallback
    content = content.replace(
      '</motion.div>\r\n  );',
      `<PatientMergeModal\r\n        sourcePatient={mergingPatient}\r\n        isOpen={Boolean(mergingPatient)}\r\n        onClose={() => setMergingPatient(null)}\r\n        onMergeComplete={fetchPatients}\r\n      />\r\n    </motion.div>\r\n  );`
    );
  }

  fs.writeFileSync(path, content, 'utf8');
  console.log('✅ PatientsList.jsx patched with PatientMergeModal.');
} else {
  console.log('ℹ️ PatientsList.jsx already includes PatientMergeModal.');
}

