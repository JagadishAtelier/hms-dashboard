import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import roomsService from "../../service/roomsService.js";
import wardsService from "../../service/wardsService.js";

export default function RoomCreate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [wards, setWards] = useState([]);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    ward_id: "",
    room_no: "",
    room_type: "",
    capacity: "",
    price_per_day: "",
    is_active: true,
  });

  const isEdit = Boolean(id);

  // ✅ Fetch Wards for Dropdown
  useEffect(() => {
    const fetchWards = async () => {
      try {
        const res = await wardsService.getAllWards();
        const data = res?.data?.data || res?.data || [];
        setWards(Array.isArray(data) ? data : []);
      } catch (err) {
        toast.error("Failed to fetch wards");
      }
    };
    fetchWards();
  }, []);

  // ✅ Fetch Room (Edit Mode)
  useEffect(() => {
    if (!id) return;
    const fetchRoom = async () => {
      setFetching(true);
      try {
        const res = await roomsService.getRoomById(id);
        const room = res?.data?.data || res?.data || res;
        setForm({
          ward_id: room.ward_id || "",
          room_no: room.room_no || "",
          room_type: room.room_type || "",
          capacity: room.capacity?.toString() || "",
          price_per_day: room.price_per_day?.toString() || "",
          is_active: room.is_active ?? true,
        });
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load room details");
      } finally {
        setFetching(false);
      }
    };
    fetchRoom();
  }, [id]);

  // ✅ Validation
  const validate = () => {
    const newErrors = {};
    if (!form.ward_id) newErrors.ward_id = "Ward is required";
    if (!form.room_no.trim()) newErrors.room_no = "Room number is required";
    if (!form.room_type) newErrors.room_type = "Room type is required";
    if (!form.capacity || isNaN(form.capacity) || parseInt(form.capacity) <= 0)
      newErrors.capacity = "Capacity must be a positive number";
    if (!form.price_per_day || isNaN(form.price_per_day) || parseFloat(form.price_per_day) <= 0)
      newErrors.price_per_day = "Price per day must be a positive number";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix validation errors");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        capacity: Number(form.capacity),
        price_per_day: Number(form.price_per_day),
      };

      if (isEdit) {
        await roomsService.updateRoom(id, payload);
        toast.success("Room updated successfully");
      } else {
        await roomsService.createRoom(payload);
        toast.success("Room created successfully");
      }
      navigate("/room");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold text-[#0E1680] mb-6">
        {isEdit ? "Edit Room" : "Create Room"}
      </h2>

      {fetching ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="animate-spin text-gray-500" size={24} />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Ward Selection */}
          <div>
            <label className="text-sm font-medium">
              Ward <span className="text-red-500">*</span>
            </label>
            <Select
              value={form.ward_id}
              onValueChange={(value) => setForm((prev) => ({ ...prev, ward_id: value }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a ward" />
              </SelectTrigger>
              <SelectContent>
                {wards.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.ward_id && (
              <p className="text-xs text-red-500 mt-1">{errors.ward_id}</p>
            )}
          </div>

          {/* Room No */}
          <div>
            <label className="text-sm font-medium">
              Room Number <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.room_no}
              onChange={(e) => setForm((prev) => ({ ...prev, room_no: e.target.value }))}
              placeholder="Enter room number"
              className="mt-1"
            />
            {errors.room_no && (
              <p className="text-xs text-red-500 mt-1">{errors.room_no}</p>
            )}
          </div>

          {/* Room Type */}
          <div>
            <label className="text-sm font-medium">
              Room Type <span className="text-red-500">*</span>
            </label>
            <Select
              value={form.room_type}
              onValueChange={(value) => setForm((prev) => ({ ...prev, room_type: value }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select room type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ICU">ICU</SelectItem>
                <SelectItem value="Private">Private</SelectItem>
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>
            {errors.room_type && (
              <p className="text-xs text-red-500 mt-1">{errors.room_type}</p>
            )}
          </div>

          {/* Capacity */}
          <div>
            <label className="text-sm font-medium">
              Capacity <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              min="1"
              value={form.capacity}
              onChange={(e) => setForm((prev) => ({ ...prev, capacity: e.target.value }))}
              placeholder="Enter room capacity"
              className="mt-1"
            />
            {errors.capacity && (
              <p className="text-xs text-red-500 mt-1">{errors.capacity}</p>
            )}
          </div>

          {/* Price per day */}
          <div>
            <label className="text-sm font-medium">
              Price per Day <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              min="0"
              value={form.price_per_day}
              onChange={(e) => setForm((prev) => ({ ...prev, price_per_day: e.target.value }))}
              placeholder="Enter price per day"
              className="mt-1"
            />
            {errors.price_per_day && (
              <p className="text-xs text-red-500 mt-1">{errors.price_per_day}</p>
            )}
          </div>
          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/room")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#0E1680] text-white"
              disabled={loading}
            >
              {loading ? "Saving..." : isEdit ? "Update Room" : "Create Room"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
