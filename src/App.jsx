import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
// import Posts from "./pages/Posts";
// import Users from "./pages/Users";
import AdminLayout from "./layout/AdminLayout";
import "./App.css";
import { Pages } from "./pages/Pages";
import AllPageView from "./pages/NewPage/AllPageView";
import ProductsList from "./pages/PatientsList";
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
import PatientsCreate from "./pages/ReceptionistPage/PatientsCreate";
import AdmissionsList from "./pages/ReceptionistPage/AdmissionsList";
import AdmissionsCreate from "./pages/ReceptionistPage/AdmissionsCreate";
import DepartmentList from "./pages/AdminPage/DepartmentList";
import DepartmentCreate from "./pages/AdminPage/DepartmentCreate"
import DesignationList from "./pages/AdminPage/DesignationList"
import DesignationCreate from "./pages/AdminPage/DesignationCreate"
import DoctorList from "./pages/AdminPage/DoctorList";
import DoctorCreate from "./pages/AdminPage/DoctorCreate";
import ReceptionistList from "./pages/AdminPage/ReceptionistList";
import ReceptionistCreate from "./pages/AdminPage/ReceptionistCreate";
import WardList from "./pages/AdminPage/WardList";
import WardCreate from "./pages/AdminPage/WardCreate";
import RoomList from "./pages/AdminPage/RoomList"
import RoomCreate from "./pages/AdminPage/RoomCreate";
import BedList from "./pages/AdminPage/BedList";
import BedCreate from "./pages/AdminPage/BedCreate"
import LabtestList from "./pages/AdminPage/LabtestList";
import LabtestCreate from "./pages/AdminPage/LabtestCreate"
import CategoryList from "./pages/AdminPage/CategoryList";
import CategoryCreate from "./pages/AdminPage/CategoryCreate";
import SubCategoryList from "./pages/AdminPage/SubCategoryList";
import SubCategoryCreate from "./pages/AdminPage/SubCategoryCreate";
import ProductList from "./pages/AdminPage/ProductList";
import ProductCreate from "./pages/AdminPage/ProductCreate";
import VendorList from "./pages/AdminPage/VendorList";
import VendorCreate from "./pages/AdminPage/VendorCreate";
import OrderList from "./pages/AdminPage/OrderList";
import OrderCreate from "./pages/AdminPage/OrderCreate";
import OrderView from "./pages/AdminPage/OrderView";
import InwardList from "./pages/AdminPage/InwardList";
import InwardCreate from "./pages/AdminPage/InwardCreate";
import StockList from "./pages/AdminPage/StockList";
import AdminDashboard from "./pages/AdminPage/adminDashboard";
import LabTechnicianList from "./pages/AdminPage/LabTechnicianList";
import LabTechnicianCreate from "./pages/AdminPage/LabTechnicianCreate";
import AccountantList from "./pages/AdminPage/AccountantList.jsx";
import AccountantCreate from "./pages/AdminPage/AccountantCreate.jsx";
import PrescriptionList from "./pages/PharmacistPage/PrescriptionList"
import PatientDashboard from "./pages/PatientDashboard/PatientDashboard";
import PatientAppointment from "./pages/PatientDashboard/PatientAppointment";
import PatientAppointmentList from "./pages/PatientDashboard/PatientAppointmentList";
import Records from "./pages/RecordsPage/Records";
import CreateRecord from "./pages/RecordsPage/CreateRecord";
import CreateTemplate from "./pages/RecordsPage/CreateTemplate";
import PatientRecords from "./pages/RecordsPage/PatientRecords";
import Prescription from "./pages/PrescriptionPage/Prescription";
import NurseList from "./pages/AdminPage/NurseList";
import NurseCreate from "./pages/AdminPage/NurseCreate";
import NurseDashboard from "./pages/NursePage/NurseDashboard";
import PharmacistList from "./pages/AdminPage/PharmacistList";
import PharmacistCreate from "./pages/AdminPage/PharmacistCreate";

function App() {
  return (
    <SidebarProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />

          {/* Persistent Layout for all Admin Routes (Maintains Sidebar State) */}
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/patient-list" element={<ProductsList />} />
            <Route path="/today-appoinments" element={<TodayAppointments />} />
            <Route path="/overview/:id" element={<PatientProfile />} />
            <Route path="/appointment" element={<AppointmentsList />} />
            <Route path="/appointment/create" element={<AppointmentsCreate />} />
            <Route path="/admissions" element={<AdmissionsList />} />
            <Route path="admission/create" element={<AdmissionsCreate />} />
            <Route path="/admission/:id" element={<AdmissionsCreate />} />
            <Route path="/patients/create" element={<PatientsCreate />} />
            <Route path="/patients/edit/:id" element={<PatientsCreate />} />
            <Route path="/doctor-notes/:appointment_id" element={<DoctorNotes />} />
            <Route path="/labtestorder/:patient_id" element={<LabTestOrder />} />
            <Route path="/testresults/:patient_id" element={<LabTestResults />} />
            <Route path="/lab-result" element={<LabResult />} />
            <Route path="/patient-documents" element={<PatientDocument />} />
            <Route path="/triage" element={<Triage />} />
            <Route path="/room-allocation" element={<RoomAllocation />} />
            <Route path="/pharma-dashboard" element={<PharmacistDashboard />} />
            <Route path="/prescriptions" element={<PharmaPrescriptions />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/department" element={<DepartmentList />} />
            <Route path="/departments/create" element={<DepartmentCreate />} />
            <Route path="/departments/edit/:id" element={<DepartmentCreate />} />
            <Route path="/designation" element={<DesignationList />} />
            <Route path="/designations/create" element={<DesignationCreate />} />
            <Route path="/designations/edit/:id" element={<DesignationCreate />} />
            <Route path="/doctors" element={<DoctorList />} />
            <Route path="/receptionist" element={<ReceptionistList />} />
            <Route path="/labtechnician" element={<LabTechnicianList />} />
            <Route path="/labtechnician/create" element={<LabTechnicianCreate />} />
            <Route path="/labtechnician/edit/:id" element={<LabTechnicianCreate />} />
            <Route path="/doctors/create" element={<DoctorCreate />} />
            <Route path="/receptionist/create" element={<ReceptionistCreate />} />
            <Route path="/receptionist/edit/:id" element={<ReceptionistCreate />} />
            <Route path="/doctors/edit/:id" element={<DoctorCreate />} />
            <Route path="/ward" element={<WardList />} />
            <Route path="/wards/create" element={<WardCreate />} />
            <Route path="/wards/edit/:id" element={<WardCreate />} />
            <Route path="/room" element={<RoomList />} />
            <Route path="/rooms/create" element={<RoomCreate />} />
            <Route path="/rooms/edit/:id" element={<RoomCreate />} />
            <Route path="/bed" element={<BedList />} />
            <Route path="/beds/create" element={<BedCreate />} />
            <Route path="/beds/edit/:id" element={<BedCreate />} />
            <Route path="/labtest" element={<LabtestList />} />
            <Route path="/labtests/create" element={<LabtestCreate />} />
            <Route path="/labtests/edit/:id" element={<LabtestCreate />} />
            <Route path="/category" element={<CategoryList />} />
            <Route path="/category/create" element={<CategoryCreate />} />
            <Route path="/category/edit/:id" element={<CategoryCreate />} />
            <Route path="/subcategory" element={<SubCategoryList />} />
            <Route path="/subcategory/create" element={<SubCategoryCreate />} />
            <Route path="/subcategory/edit/:id" element={<SubCategoryCreate />} />
            <Route path="/product" element={<ProductList />} />
            <Route path="/product/create" element={<ProductCreate />} />
            <Route path="/product/edit/:id" element={<ProductCreate />} />
            <Route path="/vendor" element={<VendorList />} />
            <Route path="/vendor/create" element={<VendorCreate />} />
            <Route path="/vendor/edit/:id" element={<VendorCreate />} />
            <Route path="/order" element={<OrderList />} />
            <Route path="/order/create" element={<OrderCreate />} />
            <Route path="/order/edit/:id" element={<OrderCreate />} />
            <Route path="/order/view/:id" element={<OrderView />} />
            <Route path="/inward" element={<InwardList />} />
            <Route path="/inward/create" element={<InwardCreate />} />
            <Route path="/inward/edit/:id" element={<InwardCreate />} />
            <Route path="/stock" element={<StockList />} />
            <Route path="/prescription" element={<PrescriptionList />} />
            <Route path="/stockinventory" element={<PharmaStock />} />
            <Route path="/pharma-update/:id" element={<PharmaUpdatePage />} />
            <Route path="/labtech-dashboard" element={<LabTechDashboard />} />
            <Route path="/lab-tech-prescriptions" element={<LabTestList />} />
            <Route path="/patient-dashboard" element={<PatientDashboard />} />
            <Route path="/patient/appointment/create" element={<PatientAppointment />} />
            <Route path="/patient/appointment/list" element={<PatientAppointmentList />} />
            <Route path="/records" element={<Records />} />
            <Route path="/records/create" element={<CreateRecord />} />
            <Route path="/records/template/create" element={<CreateTemplate />} />
            <Route path="/records/template/edit/:id" element={<CreateTemplate />} />
            <Route path="/records/patient/:patient_id" element={<PatientRecords />} />
            <Route path="/prescription/:patient_id" element={<Prescription />} />
            <Route path="/nurses" element={<NurseList />} />
            <Route path="/nurses/create" element={<NurseCreate />} />
            <Route path="/nurses/edit/:id" element={<NurseCreate />} />
            <Route path="/nurse-dashboard" element={<NurseDashboard />} />
            <Route path="/pharmacists" element={<PharmacistList />} />
            <Route path="/pharmacists/create" element={<PharmacistCreate />} />
            <Route path="/pharmacists/edit/:id" element={<PharmacistCreate />} />
            <Route path="/accountant" element={<AccountantList />} />
            <Route path="/accountant/create" element={<AccountantCreate />} />
            <Route path="/accountant/edit/:id" element={<AccountantCreate />} />
          </Route>
        </Routes>
      </Router>
    </SidebarProvider>
  );
}

export default App;
