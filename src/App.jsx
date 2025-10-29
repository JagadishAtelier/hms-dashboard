import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
// import Posts from "./pages/Posts";
// import Users from "./pages/Users";
import AdminLayout from "./layout/AdminLayout";
import "./App.css";
import { Pages } from "./pages/Pages";
import AllPageView from "./pages/NewPage/AllPageView";
import ProductsList from "./pages/ProductsList";
import Login from "./pages/LoginPage/Login";
import Signup from "./pages/LoginPage/Signup";
import { SidebarProvider } from "./components/Context/SidebarContext";
import PatientProfile from "./pages/PatientProfile/PatientProfile";
import DoctorNotes from "./pages/PatientProfile/DoctorNotes";
import LabResult from "./pages/PatientProfile/LabResult";
import PatientDocument from "./pages/PatientProfile/PatientDocument";
import Triage from "./pages/PatientProfile/Triage";
import RoomAllocation from "./pages/RoomAllocation";
import PharmacistDashboard from "./pages/PharmacistPage/PharmacistDashboard";
import PharmaPrescriptions from "./pages/PharmacistPage/PharmaPrescriptions";
import PharmaStock from "./pages/PharmacistPage/PharmaStock";
import PharmaUpdatePage from "./pages/PharmacistPage/PharmaUpdatePage";
import LabTechDashboard from "./pages/LabtachPage/LabTechDashboard";
import LabTestList from "./pages/LabtachPage/LabTestList";
import TodayAppointments from "./pages/TodayAppointments";
import AppointmentsList from "./pages/ReceptionistPage/AppointmentsList";
import AppointmentsCreate from "./pages/ReceptionistPage/AppointmentsCreate";
import LabTestOrder from "./pages/PatientProfile/LabtestOrder";
import LabTestResults from "./pages/PatientProfile/LabtestResults";
function App() {
  return (
    <SidebarProvider>
    <Router>
        <Routes>
          <Route path="/" element={<Login/>} />
          <Route path="/login" element={<Signup/>} />
          <Route
            path="/dashboard"
            element={
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            }
          />
          <Route
            path="/patient-list"
            element={
              <AdminLayout>
                <ProductsList />
              </AdminLayout>
            }
          />
          <Route
            path="/today-appoinments"
            element={
              <AdminLayout>
                <TodayAppointments />
              </AdminLayout>
            }
          />
          <Route
            path="/overview/:id"
            element={
              <AdminLayout>
                <PatientProfile />
              </AdminLayout>
            }
          />
          <Route
            path="/appointment"
            element={
              <AdminLayout>
                <AppointmentsList />
              </AdminLayout>
            }
          />
          <Route
            path="/appointment/create"
            element={
              <AdminLayout>
                <AppointmentsCreate />
              </AdminLayout>
            }
          />
          <Route
            path="/doctor-notes/:appointment_id"
            element={
              <AdminLayout>
                <DoctorNotes />
              </AdminLayout>
            }
          />
          <Route
            path="/labtestorder/:encounter_id"
            element={
              <AdminLayout>
                <LabTestOrder />
              </AdminLayout>
            }
          />
          <Route
            path="/testresults/:encounter_id"
            element={
              <AdminLayout>
                <LabTestResults />
              </AdminLayout>
            }
          />
          <Route
            path="/lab-result"
            element={
              <AdminLayout>
                <LabResult />
              </AdminLayout>
            }
          />
          <Route
            path="/patient-documents"
            element={
              <AdminLayout>
                <PatientDocument />
              </AdminLayout>
            }
          />
          <Route
            path="/triage"
            element={
              <AdminLayout>
                <Triage />
              </AdminLayout>
            }
          />
          <Route
            path="/room-allocation"
            element={
              <AdminLayout>
                <RoomAllocation />
              </AdminLayout>
            }
          />
          <Route
            path="/pharma-dashboard"
            element={
              <AdminLayout>
                <PharmacistDashboard />
              </AdminLayout>
            }
          />
          <Route
            path="/prescriptions"
            element={
              <AdminLayout>
                <PharmaPrescriptions />
              </AdminLayout>
            }
          />
          <Route
            path="/stockinventory"
            element={
              <AdminLayout>
                <PharmaStock />
              </AdminLayout>
            }
          />
          <Route
            path="/pharma-update/:id"
            element={
              <AdminLayout>
                <PharmaUpdatePage />
              </AdminLayout>
            }
          />
          <Route
            path="/labtech-dashboard"
            element={
              <AdminLayout>
                <LabTechDashboard />
              </AdminLayout>
            }
          />
          <Route
            path="/lab-tech-prescriptions"
            element={
              <AdminLayout>
                <LabTestList />
              </AdminLayout>
            }
          />
        </Routes>
    </Router>
    </SidebarProvider>
  );
}

export default App;
