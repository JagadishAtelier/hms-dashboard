// src/pages/AdminPage/DoctorScheduleModal.jsx
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";
import doctorScheduleService from "../../service/doctorscheduleService.js";
import { Loader2 } from "lucide-react";

const weekDays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function fmtRes(res) {
  // robust parse for different response envelopes
  return res?.data?.data ?? res?.data ?? res;
}

export default function DoctorScheduleModal({ doctor, onClose }) {
  const [form, setForm] = useState({
    start_time: "", // "HH:MM:SS"
    end_time: "",
    weekoffday: "",
    slot_duration_minutes: 15,
    location: "",
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [existingSchedule, setExistingSchedule] = useState(null);

  // fetch existing schedule for doctor (if any)
  useEffect(() => {
    if (!doctor?.id) return;
    let mounted = true;
    (async () => {
      setFetching(true);
      try {
        const res = await doctorScheduleService.getScheduleByDoctorId(doctor.id);
        const data = fmtRes(res);
        // if backend returns wrapped object with `data` array or single object — adjust:
        const schedule =
          Array.isArray(data) && data.length > 0 ? data[0] : data || null;

        if (schedule && mounted) {
          setExistingSchedule(schedule);
          setForm({
            start_time: schedule.start_time || "",
            end_time: schedule.end_time || "",
            weekoffday: schedule.weekoffday || "",
            slot_duration_minutes: schedule.slot_duration_minutes ?? 15,
            location: schedule.location || "",
            is_active: schedule.is_active ?? true,
          });
        }
      } catch (err) {
        // no schedule found or error — just ignore silently
        // console.debug("No existing schedule or fetch error", err);
      } finally {
        if (mounted) setFetching(false);
      }
    })();
    return () => (mounted = false);
  }, [doctor]);

  const handleChange = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // helpers
  const toMinutes = (hhmmss) => {
    if (!hhmmss) return null;
    // accept "HH:MM" or "HH:MM:SS"
    const t = hhmmss.split(":");
    const hh = Number(t[0] ?? 0);
    const mm = Number(t[1] ?? 0);
    return hh * 60 + mm;
  };

  const validateForm = () => {
    const required = [
      "start_time",
      "end_time",
      "weekoffday",
      "slot_duration_minutes",
      "location",
    ];
    for (const k of required) {
      if (!form[k] && form[k] !== 0) {
        toast.error("Please fill all required fields");
        return false;
      }
    }

    // check times
    const s = toMinutes(form.start_time);
    const e = toMinutes(form.end_time);
    if (s === null || e === null) {
      toast.error("Start and end times must be valid");
      return false;
    }
    if (s >= e) {
      toast.error("Start time must be earlier than end time");
      return false;
    }

    // slot duration reasonable
    const slot = Number(form.slot_duration_minutes);
    if (isNaN(slot) || slot < 5 || slot > 240) {
      toast.error("Slot duration must be between 5 and 240 minutes");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.debug("Doctor schedule submit handler triggered", form);
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        doctor_id: doctor.id,
        ...form,
        // ensure number
        slot_duration_minutes: Number(form.slot_duration_minutes),
      };

      if (existingSchedule?.id) {
        await doctorScheduleService.updateSchedule(existingSchedule.id, payload);
        toast.success("Doctor schedule updated");
      } else {
        await doctorScheduleService.createSchedule(payload);
        toast.success("Doctor schedule created");
      }

      onClose(true);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to save schedule");
    } finally {
      setLoading(false);
    }
  };

  // Controlled TimePicker value expects "HH:mm" or null
  const timeValue = (hhmmss) => (hhmmss ? hhmmss.slice(0, 5) : null);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-lg p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {existingSchedule ? "Edit Doctor Schedule" : "Add Doctor Schedule"}
            </h3>
            <p className="text-sm text-gray-500">
              {doctor?.doctor_name || doctor?.doctor_email || "Selected doctor"}
            </p>
          </div>

          {fetching ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading schedule...
            </div>
          ) : existingSchedule ? (
            <div className="text-xs bg-yellow-50 border border-yellow-100 text-yellow-800 px-3 py-1 rounded">
              Editing existing schedule
            </div>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* times side-by-side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Start Time <span className="text-red-500">*</span>
              </label>
              <TimePicker
                onChange={(v) => handleChange("start_time", v ? `${v}:00` : "")}
                value={timeValue(form.start_time)}
                disableClock={true}
                clearIcon={null}
                clockIcon={null}
                format="HH:mm"
                hourPlaceholder="hh"
                minutePlaceholder="mm"
                className="react-time-picker w-full"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Choose when the doctor's shift starts
              </p>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">
                End Time <span className="text-red-500">*</span>
              </label>
              <TimePicker
                onChange={(v) => handleChange("end_time", v ? `${v}:00` : "")}
                value={timeValue(form.end_time)}
                disableClock={true}
                clearIcon={null}
                clockIcon={null}
                format="HH:mm"
                hourPlaceholder="hh"
                minutePlaceholder="mm"
                className="react-time-picker w-full"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Choose when the doctor's shift ends
              </p>
            </div>
          </div>

          {/* Week off + Slot */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Week Off Day <span className="text-red-500">*</span>
              </label>
              <Select
                value={form.weekoffday}
                onValueChange={(v) => handleChange("weekoffday", v)}
              >
                {/* ensure SelectTrigger contains SelectValue so placeholder/choice shows */}
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {weekDays.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Slot Duration (min) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min={5}
                max={240}
                value={form.slot_duration_minutes}
                onChange={(e) => handleChange("slot_duration_minutes", e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">E.g., 15 (minutes)</p>
            </div>
          </div>

          {/* location */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Location <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.location}
              onChange={(e) => handleChange("location", e.target.value)}
              placeholder="e.g., OPD Room 2"
            />
          </div>

          {/* buttons: keep Cancel as custom Button, use native <button> for submit */}
          <div className="flex items-center justify-end gap-3 mt-2 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => onClose(false)}>
              Cancel
            </Button>

            {/* <-- Native button ensures form submit works reliably */}
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded px-4 py-2 bg-[#0E1680] text-white disabled:opacity-60"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : existingSchedule ? (
                "Update"
              ) : (
                "Save"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
