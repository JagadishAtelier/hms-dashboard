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
import PrescriptionList from "./pages/PharmacistPage/PrescriptionList"
function App() {
  return (
    <SidebarProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
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
            path="/admissions"
            element={
              <AdminLayout>
                <AdmissionsList />
              </AdminLayout>
            }
          />
          <Route
            path="admission/create"
            element={
              <AdminLayout>
                <AdmissionsCreate />
              </AdminLayout>
            }
          />
          <Route
            path="/admission/:id"
            element={
              <AdminLayout>
                <AdmissionsCreate />
              </AdminLayout>
            }
          />
          <Route
            path="/patients/create"
            element={
              <AdminLayout>
                <PatientsCreate />
              </AdminLayout>
            }
          />
          <Route
            path="/patients/edit/:id"
            element={
              <AdminLayout>
                <PatientsCreate />
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
            path="/admin-dashboard"
            element={
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            }
          />

          <Route
            path="/department"
            element={
              <AdminLayout>
                <DepartmentList />
              </AdminLayout>
            }
          />
          <Route
            path="/departments/create"
            element={
              <AdminLayout>
                <DepartmentCreate />
              </AdminLayout>
            }
          />
          <Route
            path="/departments/edit/:id"
            element={
              <AdminLayout>
                <DepartmentCreate />
              </AdminLayout>
            }
          />
          <Route
            path="/designation"
            element={
              <AdminLayout>
                <DesignationList />
              </AdminLayout>
            }
          />
          <Route
            path="/designations/create"
            element={
              <AdminLayout>
                <DesignationCreate />
              </AdminLayout>
            }
          />
          <Route
            path="/designations/edit/:id"
            element={
              <AdminLayout>
                <DesignationCreate />
              </AdminLayout>
            }
          />
          <Route
            path="/doctors"
            element={
              <AdminLayout>
                <DoctorList />
              </AdminLayout>
            }
          />
          <Route
            path="/doctors/create"
            element={
              <AdminLayout>
                <DoctorCreate />
              </AdminLayout>
            }
          />
          <Route
            path="/doctors/edit/:id"
            element={
              <AdminLayout>
                <DoctorCreate />
              </AdminLayout>
            }
          />
          <Route
            path="/ward"
            element={
              <AdminLayout>
                <WardList />
              </AdminLayout>
            }
          />
          <Route
            path="/wards/create"
            element={
              <AdminLayout>
                <WardCreate />
              </AdminLayout>
            }
          />
          <Route
            path="/wards/edit/:id"
            element={
              <AdminLayout>
                <WardCreate />
              </AdminLayout>
            }
          />
          <Route
            path="/room"
            element={
              <AdminLayout>
                <RoomList />
              </AdminLayout>
            }
          />
          <Route
            path="/rooms/create"
            element={
              <AdminLayout>
                <RoomCreate />
              </AdminLayout>
            }
          />
          <Route
            path="/rooms/edit/:id"
            element={
              <AdminLayout>
                <RoomCreate />
              </AdminLayout>
            }
          />
          <Route
            path="/bed"
            element={
              <AdminLayout>
                <BedList />
              </AdminLayout>
            }
          />
          <Route
            path="/beds/create"
            element={
              <AdminLayout>
                <BedCreate />
              </AdminLayout>
            }
          />
          <Route
            path="/beds/edit/:id"
            element={
              <AdminLayout>
                <BedCreate />
              </AdminLayout>
            }
          />
          <Route
            path="/labtest"
            element={
              <AdminLayout>
                <LabtestList />
              </AdminLayout>
            }
          />
          <Route
            path="/labtests/create"
            element={
              <AdminLayout>
                <LabtestCreate />
              </AdminLayout>
            }
          />
          <Route
            path="/labtests/edit/:id"
            element={
              <AdminLayout>
                <LabtestCreate />
              </AdminLayout>
            }
          />
          <Route
            path="/category"
            element={
              <AdminLayout>
                <CategoryList />
              </AdminLayout>
            }
          />
          <Route
            path="/category/create"
            element={
              <AdminLayout>
                <CategoryCreate />
              </AdminLayout>
            }
          />
          <Route
            path="/category/edit/:id"
            element={
              <AdminLayout>
                <CategoryCreate />
              </AdminLayout>
            }
          />
          <Route
            path="/subcategory"
            element={
              <AdminLayout>
                <SubCategoryList />
              </AdminLayout>
            }
          />
          <Route
            path="/subcategory/create"
            element={
              <AdminLayout>
                <SubCategoryCreate />
              </AdminLayout>
            }
          />
          <Route
            path="/subcategory/edit/:id"
            element={
              <AdminLayout>
                <SubCategoryCreate />
              </AdminLayout>
            }
          />
          <Route
            path="/product"
            element={
              <AdminLayout>
                <ProductList />
              </AdminLayout>
            }
          />
          <Route
            path="/product/create"
            element={
              <AdminLayout>
                <ProductCreate />
              </AdminLayout>
            }
          />
          <Route
            path="/product/edit/:id"
            element={
              <AdminLayout>
                <ProductCreate />
              </AdminLayout>
            }
          />
          <Route
            path="/vendor"
            element={
              <AdminLayout>
                <VendorList />
              </AdminLayout>
            }
          />
          <Route
            path="/vendor/create"
            element={
              <AdminLayout>
                <VendorCreate />
              </AdminLayout>
            }
          />
          <Route
            path="/vendor/edit/:id"
            element={
              <AdminLayout>
                <VendorCreate />
              </AdminLayout>
            }
          />
          <Route
            path="/order"
            element={
              <AdminLayout>
                <OrderList />
              </AdminLayout>
            }
          />
          <Route
            path="/order/create"
            element={
              <AdminLayout>
                <OrderCreate />
              </AdminLayout>
            }
          />
          <Route
            path="/order/edit/:id"
            element={
              <AdminLayout>
                <OrderCreate />
              </AdminLayout>
            }
          />
          <Route
            path="/order/view/:id"
            element={
              <AdminLayout>
                <OrderView />
              </AdminLayout>
            }
          />
          <Route
            path="/inward"
            element={
              <AdminLayout>
                <InwardList />
              </AdminLayout>
            }
          />
          <Route
            path="/inward/create"
            element={
              <AdminLayout>
                <InwardCreate />
              </AdminLayout>
            }
          />
          <Route
            path="/inward/edit/:id"
            element={
              <AdminLayout>
                <InwardCreate />
              </AdminLayout>
            }
          />
          <Route
            path="/stock"
            element={
              <AdminLayout>
                <StockList />
              </AdminLayout>
            }
          />
          <Route
            path="/prescription"
            element={
              <AdminLayout>
                <PrescriptionList />
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
