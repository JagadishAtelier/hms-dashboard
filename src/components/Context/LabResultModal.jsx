import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UploadCloud, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const LabResultModal = ({ open, setOpen }) => {
  const [testType, setTestType] = useState("Biochemistry");
  const [urgencyLevel, setUrgencyLevel] = useState("Routine");
  const [testDate, setTestDate] = useState(new Date().toISOString().split("T")[0]);
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setOpen(false);
  };

  const onDrop = useCallback((acceptedFiles) => {
    setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [], "application/pdf": [] },
    multiple: false,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] h-fit rounded-2xl bg-[#FFFFFF] shadow-xl p-6">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-lg font-bold text-[#0E1680]">
            Attach Laboratory & Diagnostic Result
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                Diagnostic Category
              </label>
              <Select value={testType} onValueChange={setTestType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Biochemistry">Biochemistry</SelectItem>
                  <SelectItem value="Hematology">Hematology & Coagulation</SelectItem>
                  <SelectItem value="Microbiology">Microbiology</SelectItem>
                  <SelectItem value="Serology">Serology & Immunology</SelectItem>
                  <SelectItem value="Urinalysis">Clinical Pathology & Urinalysis</SelectItem>
                  <SelectItem value="X-Ray">Radiology / X-Ray</SelectItem>
                  <SelectItem value="CT Scan">Computed Tomography (CT)</SelectItem>
                  <SelectItem value="MRI">Magnetic Resonance Imaging (MRI)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                Test Date
              </label>
              <Input
                type="date"
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                Attending Ordering Doctor
              </label>
              <Input
                type="text"
                placeholder="Dr. Consultant / Attending Physician"
                defaultValue="Attending Duty Doctor"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                Urgency Triage Level
              </label>
              <Select value={urgencyLevel} onValueChange={setUrgencyLevel}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Routine">Routine / Normal</SelectItem>
                  <SelectItem value="Urgent">Urgent Clinical Priority</SelectItem>
                  <SelectItem value="STAT">STAT / Emergency Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col w-full pt-1">
            <label className="text-xs font-semibold uppercase text-slate-700 mb-1.5">
              Diagnostic File Attachment (PDF or Image)
            </label>

            <div
              {...getRootProps()}
              className={cn(
                "flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-5 cursor-pointer transition-all",
                isDragActive
                  ? "border-indigo-500 bg-indigo-50/50"
                  : "border-slate-300 bg-slate-50/50 hover:bg-slate-50"
              )}
            >
              <input {...getInputProps()} />
              <UploadCloud className="h-8 w-8 text-indigo-600 mb-2" />
              <p className="text-xs font-medium text-slate-700">
                {file ? file.name : "Drag & drop files here, or click to browse"}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Supports PDF, PNG, JPG up to 15MB</p>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#0E1680] hover:bg-[#0b1163] text-white">
              Save Diagnostic Entry
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LabResultModal;
