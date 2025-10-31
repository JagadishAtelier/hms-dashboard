import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import bedsService from "../../service/bedsService.js";
import roomsService from "../../service/roomsService.js";
import { Card } from "@/components/ui/card";

export default function BedCreate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [errors, setErrors] = useState({});
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [form, setForm] = useState({
    room_id: "",
    bed_no: "",
    is_occupied: false,
    is_active: true,
  });

  // ✅ Fetch Rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await roomsService.getAllRooms();
        const data = res?.data?.data || res?.data || [];
        setRooms(Array.isArray(data) ? data : []);
      } catch (err) {
        toast.error("Failed to fetch rooms");
      }
    };
    fetchRooms();
  }, []);

  // ✅ Fetch Bed (edit mode)
  useEffect(() => {
    if (!id) return;
    const fetchBed = async () => {
      setFetching(true);
      try {
        const res = await bedsService.getBedById(id);
        const bed = res?.data?.data || res?.data || res;
        setForm({
          room_id: bed.room_id || "",
          bed_no: bed.bed_no || "",
          is_occupied: bed.is_occupied ?? false,
          is_active: bed.is_active ?? true,
        });
        setSelectedRoom(bed.room_id);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load bed details");
      } finally {
        setFetching(false);
      }
    };
    fetchBed();
  }, [id]);

  // ✅ Validation
  const validate = () => {
    const newErrors = {};
    if (!form.room_id) newErrors.room_id = "Room is required";
    if (!form.bed_no.trim()) newErrors.bed_no = "Bed number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix validation errors");
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await bedsService.updateBed(id, form);
        toast.success("Bed updated successfully");
      } else {
        await bedsService.createBed(form);
        toast.success("Bed created successfully");
      }
      navigate("/bed");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Room selection handler
  const handleRoomSelect = (room) => {
    setSelectedRoom(room.id);
    setForm((prev) => ({ ...prev, room_id: room.id }));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-[#0E1680] mb-6">
        {isEdit ? "Edit Bed" : "Create Bed"}
      </h2>

      {fetching ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="animate-spin text-gray-500" size={24} />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Room Selection */}
          <div>
            <label className="text-sm font-medium">
              Select Room <span className="text-red-500">*</span>
            </label>

            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto p-2 border rounded-lg bg-gray-50">
              {rooms.length > 0 ? (
                rooms.map((room) => {
                  const isSelected = selectedRoom === room.id;
                  return (
                    <Card
                      key={room.id}
                      onClick={() => handleRoomSelect(room)}
                      className={`cursor-pointer relative border-2 transition-all duration-150 p-4 rounded-xl flex flex-col items-center justify-center text-center ${
                        isSelected
                          ? "border-[#0E1680] bg-[#E6E8FF]"
                          : "border-gray-200 bg-white hover:border-[#0E1680]"
                      }`}
                    >
                      <div className="font-semibold text-gray-800">
                        Room {room.room_no}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {room.room_type}
                      </div>

                      {/* ✅ Selected indicator */}
                      {isSelected && (
                        <CheckCircle2
                          className="text-[#0E1680] absolute top-2 right-2"
                          size={18}
                        />
                      )}
                    </Card>
                  );
                })
              ) : (
                <p className="text-xs text-gray-500 italic text-center col-span-full">
                  No rooms available
                </p>
              )}
            </div>

            {errors.room_id && (
              <p className="text-xs text-red-500 mt-1">{errors.room_id}</p>
            )}
          </div>

          {/* Bed Number */}
          <div>
            <label className="text-sm font-medium">
              Bed Number <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.bed_no}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, bed_no: e.target.value }))
              }
              placeholder="Enter bed number (e.g. B-101)"
              className="mt-1"
            />
            {errors.bed_no && (
              <p className="text-xs text-red-500 mt-1">{errors.bed_no}</p>
            )}
          </div>

          

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/bed")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#0E1680] text-white"
              disabled={loading}
            >
              {loading ? "Saving..." : isEdit ? "Update Bed" : "Create Bed"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
