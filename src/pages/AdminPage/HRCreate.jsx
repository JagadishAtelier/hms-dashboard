import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import hrService from "../../service/hrService.js";
import departmentService from "../../service/departmentService.js";
import designationService from "../../service/designationService.js";

export default function HRCreate() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [designations, setDesignations] = useState([]);

    const [form, setForm] = useState({
        hr_email: "", hr_phone: "", employee_id_prefix: "EMP",
        user: { password: "" },
        staff: {
            first_name: "", last_name: "", gender: "", dob: "", address: "",
            qualification: "", department_id: "", designation_id: "", date_of_joining: "",
            emergency_contact: { name: "", relationship: "", phone: "" },
        },
    });

    useEffect(() => {
        if (!id) return;
        setFetching(true);
        hrService.getById(id)
            .then(res => {
                const d = res?.data?.data || res?.data;
                const s = d?.staff_profiles || {};
                setForm({
                    hr_email: d.hr_email || "",
                    hr_phone: d.hr_phone || "",
                    employee_id_prefix: d.employee_id_prefix || "EMP",
                    user: { password: "" },
                    staff: {
                        first_name: s.first_name || "", last_name: s.last_name || "",
                        gender: s.gender || "", dob: s.dob ? s.dob.split("T")[0] : "",
                        address: s.address || "", qualification: s.qualification || "",
                        department_id: s.department_id || "", designation_id: s.designation_id || "",
                        date_of_joining: s.date_of_joining ? s.date_of_joining.split("T")[0] : "",
                        emergency_contact: s.emergency_contact || { name: "", relationship: "", phone: "" },
                    },
                });
            })
            .catch(() => toast.error("Failed to load HR staff"))
            .finally(() => setFetching(false));
    }, [id]);

    useEffect(() => {
        Promise.all([departmentService.getAllDepartments(), designationService.getAllDesignations()])
            .then(([deptRes, desigRes]) => {
                const deptData = deptRes?.data?.data || deptRes?.data || [];
                const desigData = desigRes?.data?.data || desigRes?.data || [];
                setDepartments(Array.isArray(deptData) ? deptData : []);
                setDesignations(Array.isArray(desigData) ? desigData : []);
            })
            .catch(() => toast.error("Failed to load dropdown data"));
    }, []);

    const setStaff = (k, v) => setForm(p => ({ ...p, staff: { ...p.staff, [k]: v } }));
    const setEmergency = (k, v) => setForm(p => ({ ...p, staff: { ...p.staff, emergency_contact: { ...p.staff.emergency_contact, [k]: v } } }));

    const validate = () => {
        if (!form.staff.first_name.trim()) { toast.error("First name is required"); return false; }
        if (!form.hr_email.trim()) { toast.error("Email is required"); return false; }
        if (!form.hr_phone.trim()) { toast.error("Phone is required"); return false; }
        if (!isEdit && !form.user.password.trim()) { toast.error("Password is required"); return false; }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const staffPayload = {
            first_name: form.staff.first_name, last_name: form.staff.last_name,
            gender: form.staff.gender, dob: form.staff.dob, address: form.staff.address,
            qualification: form.staff.qualification || "", date_of_joining: form.staff.date_of_joining,
            emergency_contact: form.staff.emergency_contact,
        };
        if (form.staff.department_id) staffPayload.department_id = form.staff.department_id;
        if (form.staff.designation_id) staffPayload.designation_id = form.staff.designation_id;

        const payload = {
            hr_name: `${form.staff.first_name} ${form.staff.last_name}`.trim(),
            hr_email: form.hr_email, hr_phone: form.hr_phone,
            employee_id_prefix: form.employee_id_prefix || "EMP",
            staff: staffPayload, user: { password: form.user.password },
        };

        setLoading(true);
        try {
            if (isEdit) { await hrService.update(id, payload); toast.success("HR staff updated"); }
            else { await hrService.create(payload); toast.success("HR staff created"); }
            navigate("/hr");
        } catch (err) { toast.error(err?.response?.data?.message || "Operation failed"); }
        finally { setLoading(false); }
    };

    if (fetching) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gray-400" size={24} /></div>;

    return (
        <div className="md:p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-[#0E1680] mb-6">{isEdit ? "Edit HR Staff" : "Create HR Staff"}</h2>
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">

                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <label>First Name <span className="text-red-500">*</span><Input value={form.staff.first_name} onChange={e => setStaff("first_name", e.target.value)} /></label>
                    <label>Last Name<Input value={form.staff.last_name} onChange={e => setStaff("last_name", e.target.value)} /></label>
                    <label>Gender
                        <select className="border rounded-md p-2 w-full mt-1" value={form.staff.gender} onChange={e => setStaff("gender", e.target.value)}>
                            <option value="">Select Gender</option>
                            <option>Male</option><option>Female</option><option>Other</option>
                        </select>
                    </label>
                    <label>Date of Birth<Input type="date" value={form.staff.dob} onChange={e => setStaff("dob", e.target.value)} /></label>
                </div>
                <label className="block">Address<Textarea value={form.staff.address} onChange={e => setStaff("address", e.target.value)} /></label>

                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Professional Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <label>Department
                        <select className="border rounded-md p-2 w-full mt-1" value={form.staff.department_id} onChange={e => setStaff("department_id", e.target.value)}>
                            <option value="">Select Department</option>
                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </label>
                    <label>Designation
                        <select className="border rounded-md p-2 w-full mt-1" value={form.staff.designation_id} onChange={e => setStaff("designation_id", e.target.value)}>
                            <option value="">Select Designation</option>
                            {designations.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                        </select>
                    </label>
                    <label>Date of Joining<Input type="date" value={form.staff.date_of_joining} onChange={e => setStaff("date_of_joining", e.target.value)} /></label>
                    <label>Qualification<Input value={form.staff.qualification} onChange={e => setStaff("qualification", e.target.value)} /></label>
                    <label>Employee ID Prefix<Input value={form.employee_id_prefix} onChange={e => setForm(p => ({ ...p, employee_id_prefix: e.target.value }))} placeholder="e.g. EMP" /></label>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Account Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <label>Email <span className="text-red-500">*</span><Input value={form.hr_email} onChange={e => setForm(p => ({ ...p, hr_email: e.target.value }))} /></label>
                    <label>Phone <span className="text-red-500">*</span><Input value={form.hr_phone} onChange={e => setForm(p => ({ ...p, hr_phone: e.target.value }))} /></label>
                    {!isEdit && (
                        <label>Password <span className="text-red-500">*</span>
                            <Input type="password" value={form.user.password} onChange={e => setForm(p => ({ ...p, user: { password: e.target.value } }))} />
                        </label>
                    )}
                </div>

                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Emergency Contact</h3>
                <div className="grid md:grid-cols-3 gap-4">
                    <label>Name<Input value={form.staff.emergency_contact.name} onChange={e => setEmergency("name", e.target.value)} /></label>
                    <label>Relationship<Input value={form.staff.emergency_contact.relationship} onChange={e => setEmergency("relationship", e.target.value)} /></label>
                    <label>Phone<Input value={form.staff.emergency_contact.phone} onChange={e => setEmergency("phone", e.target.value)} /></label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => navigate("/hr")}>Cancel</Button>
                    <Button type="submit" className="bg-[#0E1680] text-white" disabled={loading}>
                        {loading ? "Saving..." : isEdit ? "Update HR Staff" : "Create HR Staff"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
