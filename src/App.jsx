import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardDispatcher from "./pages/Dashboards/DashboardDispatcher";
import AdminLayout from "./layout/AdminLayout";
import Login from "./pages/LoginPage/Login";
import PageSkeleton from "./components/shared/PageSkeleton";
import { SidebarProvider } from "./components/Context/SidebarContext";
import "./App.css";

// Lazy-loaded routes for optimal bundle chunking
const Signup = lazy(() => import("./pages/LoginPage/Signup"));
const Pages = lazy(() => import("./pages/Pages").then((m) => ({ default: m.Pages })));
const AllPageView = lazy(() => import("./pages/NewPage/AllPageView"));
const ProductsList = lazy(() => import("./pages/PatientsList"));
const PatientProfile = lazy(() => import("./pages/PatientProfile/PatientProfile"));
const DoctorNotes = lazy(() => import("./pages/PatientProfile/DoctorNotes"));
const LabResult = lazy(() => import("./pages/PatientProfile/LabResult"));
const PatientDocument = lazy(() => import("./pages/PatientProfile/PatientDocument"));
const Triage = lazy(() => import("./pages/PatientProfile/Triage"));
const RoomAllocation = lazy(() => import("./pages/RoomAllocation"));
const PharmacistDashboard = lazy(() => import("./pages/PharmacistPage/PharmacistDashboard"));
const PharmaPrescriptions = lazy(() => import("./pages/PharmacistPage/PharmaPrescriptions"));
const PharmaStock = lazy(() => import("./pages/PharmacistPage/PharmaStock"));
const PharmaUpdatePage = lazy(() => import("./pages/PharmacistPage/PharmaUpdatePage"));
const LabTechDashboard = lazy(() => import("./pages/LabtachPage/LabTechDashboard"));
const LabTestList = lazy(() => import("./pages/LabtachPage/LabTestList"));
const TodayAppointments = lazy(() => import("./pages/TodayAppointments"));
const AppointmentsList = lazy(() => import("./pages/ReceptionistPage/AppointmentsList"));
const AppointmentsCreate = lazy(() => import("./pages/ReceptionistPage/AppointmentsCreate"));
const LabTestOrder = lazy(() => import("./pages/PatientProfile/LabtestOrder"));
const LabTestResults = lazy(() => import("./pages/PatientProfile/LabtestResults"));
const PatientsCreate = lazy(() => import("./pages/ReceptionistPage/PatientsCreate"));
const AdmissionsList = lazy(() => import("./pages/ReceptionistPage/AdmissionsList"));
const AdmissionsCreate = lazy(() => import("./pages/ReceptionistPage/AdmissionsCreate"));
const DepartmentList = lazy(() => import("./pages/AdminPage/DepartmentList"));
const DepartmentCreate = lazy(() => import("./pages/AdminPage/DepartmentCreate"));
const DesignationList = lazy(() => import("./pages/AdminPage/DesignationList"));
const DesignationCreate = lazy(() => import("./pages/AdminPage/DesignationCreate"));
const DoctorList = lazy(() => import("./pages/AdminPage/DoctorList"));
const DoctorCreate = lazy(() => import("./pages/AdminPage/DoctorCreate"));
const ReceptionistList = lazy(() => import("./pages/AdminPage/ReceptionistList"));
const ReceptionistCreate = lazy(() => import("./pages/AdminPage/ReceptionistCreate"));
const WardList = lazy(() => import("./pages/AdminPage/WardList"));
const WardCreate = lazy(() => import("./pages/AdminPage/WardCreate"));
const RoomList = lazy(() => import("./pages/AdminPage/RoomList"));
const RoomCreate = lazy(() => import("./pages/AdminPage/RoomCreate"));
const BedList = lazy(() => import("./pages/AdminPage/BedList"));
const BedCreate = lazy(() => import("./pages/AdminPage/BedCreate"));
const LabtestList = lazy(() => import("./pages/AdminPage/LabtestList"));
const LabtestCreate = lazy(() => import("./pages/AdminPage/LabtestCreate"));
const CategoryList = lazy(() => import("./pages/AdminPage/CategoryList"));
const CategoryCreate = lazy(() => import("./pages/AdminPage/CategoryCreate"));
const SubCategoryList = lazy(() => import("./pages/AdminPage/SubCategoryList"));
const SubCategoryCreate = lazy(() => import("./pages/AdminPage/SubCategoryCreate"));
const ProductList = lazy(() => import("./pages/AdminPage/ProductList"));
const ProductCreate = lazy(() => import("./pages/AdminPage/ProductCreate"));
const VendorList = lazy(() => import("./pages/AdminPage/VendorList"));
const VendorCreate = lazy(() => import("./pages/AdminPage/VendorCreate"));
const OrderList = lazy(() => import("./pages/AdminPage/OrderList"));
const OrderCreate = lazy(() => import("./pages/AdminPage/OrderCreate"));
const OrderView = lazy(() => import("./pages/AdminPage/OrderView"));
const InwardList = lazy(() => import("./pages/AdminPage/InwardList"));
const InwardCreate = lazy(() => import("./pages/AdminPage/InwardCreate"));
const StockList = lazy(() => import("./pages/AdminPage/StockList"));
const AdminDashboard = lazy(() => import("./pages/AdminPage/adminDashboard"));
const LabTechnicianList = lazy(() => import("./pages/AdminPage/LabTechnicianList"));
const LabTechnicianCreate = lazy(() => import("./pages/AdminPage/LabTechnicianCreate"));
const AccountantList = lazy(() => import("./pages/AdminPage/AccountantList.jsx"));
const AccountantCreate = lazy(() => import("./pages/AdminPage/AccountantCreate.jsx"));
const AccountantDashboard = lazy(() => import("./pages/AccountantPage/AccountantDashboard.jsx"));
const BillingList = lazy(() => import("./pages/AccountantPage/BillingList.jsx"));
const HRList = lazy(() => import("./pages/AdminPage/HRList.jsx"));
const HRCreate = lazy(() => import("./pages/AdminPage/HRCreate.jsx"));
const LeaveConfig = lazy(() => import("./pages/HRMSPage/LeaveConfig.jsx"));
const LeaveApplications = lazy(() => import("./pages/HRMSPage/LeaveApplications.jsx"));
const Attendance = lazy(() => import("./pages/HRMSPage/Attendance.jsx"));
const SalaryConfig = lazy(() => import("./pages/HRMSPage/SalaryConfig.jsx"));
const SalarySlips = lazy(() => import("./pages/HRMSPage/SalarySlips.jsx"));
const StaffDocuments = lazy(() => import("./pages/HRMSPage/StaffDocuments.jsx"));
const MyHRMS = lazy(() => import("./pages/HRMSPage/MyHRMS.jsx"));
const BillableItemsList = lazy(() => import("./pages/BillableItems/BillableItemsList.jsx"));
const BillableItemForm = lazy(() => import("./pages/BillableItems/BillableItemForm.jsx"));
const POSPage = lazy(() => import("./pages/POSPage/POSPage.jsx"));
const POSList = lazy(() => import("./pages/POSPage/POSList.jsx"));
const POSReceipt = lazy(() => import("./pages/POSPage/POSReceipt.jsx"));
const SessionPlans = lazy(() => import("./pages/SessionPage/SessionPlans.jsx"));
const SessionPlanCreate = lazy(() => import("./pages/SessionPage/SessionPlanCreate.jsx"));
const SessionsDueTomorrow = lazy(() => import("./pages/SessionPage/SessionsDueTomorrow.jsx"));
const SessionPlanDetail = lazy(() => import("./pages/SessionPage/SessionPlanDetail.jsx"));
const PrescriptionList = lazy(() => import("./pages/PharmacistPage/PrescriptionList"));
const PatientDashboard = lazy(() => import("./pages/PatientDashboard/PatientDashboard"));
const PatientAppointment = lazy(() => import("./pages/PatientDashboard/PatientAppointment"));
const PatientAppointmentList = lazy(() => import("./pages/PatientDashboard/PatientAppointmentList"));
const Records = lazy(() => import("./pages/RecordsPage/Records"));
const CreateRecord = lazy(() => import("./pages/RecordsPage/CreateRecord"));
const CreateTemplate = lazy(() => import("./pages/RecordsPage/CreateTemplate"));
const PatientRecords = lazy(() => import("./pages/RecordsPage/PatientRecords"));
const Prescription = lazy(() => import("./pages/PrescriptionPage/Prescription"));
const NurseList = lazy(() => import("./pages/AdminPage/NurseList"));
const NurseCreate = lazy(() => import("./pages/AdminPage/NurseCreate"));
const NurseDashboard = lazy(() => import("./pages/NursePage/NurseDashboard"));
const PharmacistList = lazy(() => import("./pages/AdminPage/PharmacistList"));
const PharmacistCreate = lazy(() => import("./pages/AdminPage/PharmacistCreate"));
const SurgeriesList = lazy(() => import("./pages/SurgeriesPage/SurgeriesList"));
const SurgeryForm = lazy(() => import("./pages/SurgeriesPage/SurgeryForm"));
const DietTypeList = lazy(() => import("./pages/AdminPage/DietTypeList"));
const FoodDashboard = lazy(() => import("./pages/FoodPage/FoodDashboard"));
const MealPlansList = lazy(() => import("./pages/FoodPage/MealPlansList"));
const FoodManagerList = lazy(() => import("./pages/AdminPage/FoodManagerList"));
const FoodManagerCreate = lazy(() => import("./pages/AdminPage/FoodManagerCreate"));
const ProceduresList = lazy(() => import("./pages/SurgeriesPage/ProceduresList"));
const ProcedureForm = lazy(() => import("./pages/SurgeriesPage/ProcedureForm"));

function App() {
  return (
    <SidebarProvider>
      <Router>
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <AdminLayout>
                <DashboardDispatcher />
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
            path="/patients"
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
            path="/admission/create"
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
            path="/patients/view/:id"
            element={
              <AdminLayout>
                <PatientProfile />
              </AdminLayout>
            }
          />
          <Route
            path="/patients/:id"
            element={
              <AdminLayout>
                <PatientProfile />
              </AdminLayout>
            }
          />
          <Route
            path="/patients/overview/:id"
            element={
              <AdminLayout>
                <PatientProfile />
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
            path="/labtestorder/:patient_id"
            element={
              <AdminLayout>
                <LabTestOrder />
              </AdminLayout>
            }
          />
          <Route
            path="/testresults/:patient_id"
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
                <DashboardDispatcher />
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
            path="/receptionist"
            element={
              <AdminLayout>
                <ReceptionistList />
              </AdminLayout>
            }
          />
          <Route
            path="/labtechnician"
            element={
              <AdminLayout>
                <LabTechnicianList />
              </AdminLayout>
            }
          />

          <Route
            path="/labtechnician/create"
            element={
              <AdminLayout>
                <LabTechnicianCreate />
              </AdminLayout>
            }
          />

          <Route
            path="/labtechnician/edit/:id"
            element={
              <AdminLayout>
                <LabTechnicianCreate />
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
            path="/receptionist/create"
            element={
              <AdminLayout>
                <ReceptionistCreate />
              </AdminLayout>
            }
          />
          <Route
            path="/receptionist/edit/:id"
            element={
              <AdminLayout>
                <ReceptionistCreate />
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
          <Route
            path="/patient-dashboard"
            element={
              <AdminLayout>
                <PatientDashboard />
              </AdminLayout>
            }
          />
          <Route
            path="/patient/appointment/create"
            element={
              <AdminLayout>
                <PatientAppointment />
              </AdminLayout>
            }
          />
          <Route
            path="/patient/appointment/list"
            element={
              <AdminLayout>
                <PatientAppointmentList />
              </AdminLayout>
            }
          />
          <Route
            path="/records"
            element={
              <AdminLayout>
                <Records />
              </AdminLayout>
            }
          />
          <Route
            path="/records/create"
            element={
              <AdminLayout>
                <CreateRecord />
              </AdminLayout>
            }
          />
          <Route
            path="/records/template/create"
            element={
              <AdminLayout>
                <CreateTemplate />
              </AdminLayout>
            }
          />
          <Route
            path="/records/template/edit/:id"
            element={
              <AdminLayout>
                <CreateTemplate />
              </AdminLayout>
            }
          />
          <Route
            path="/records/patient/:patient_id"
            element={
              <AdminLayout>
                <PatientRecords />
              </AdminLayout>
            }
          />
          <Route
            path="/prescription/:patient_id"
            element={
              <AdminLayout>
                <Prescription />
              </AdminLayout>
            }
          />
          <Route
            path="/nurses"
            element={
              <AdminLayout>
                <NurseList />
              </AdminLayout>
            }
          />
          <Route
            path="/nurses/create"
            element={
              <AdminLayout>
                <NurseCreate />
              </AdminLayout>
            }
          />
          <Route
            path="/nurses/edit/:id"
            element={
              <AdminLayout>
                <NurseCreate />
              </AdminLayout>
            }
          />
          <Route
            path="/nurse-dashboard"
            element={
              <AdminLayout>
                <NurseDashboard />
              </AdminLayout>
            }
          />
          <Route
            path="/pharmacists"
            element={
              <AdminLayout>
                <PharmacistList />
              </AdminLayout>
            }
          />
          <Route
            path="/pharmacists/create"
            element={
              <AdminLayout>
                <PharmacistCreate />
              </AdminLayout>
            }
          />
          <Route path="/pharmacists/edit/:id" element={<AdminLayout><PharmacistCreate /></AdminLayout>} />
          <Route path="/surgeries" element={<AdminLayout><SurgeriesList /></AdminLayout>} />
          <Route path="/surgeries/create" element={<AdminLayout><SurgeryForm /></AdminLayout>} />
          <Route path="/surgeries/edit/:id" element={<AdminLayout><SurgeryForm /></AdminLayout>} />
          <Route path="/food-dashboard" element={<AdminLayout><FoodDashboard /></AdminLayout>} />
          <Route path="/food/meal-plans" element={<AdminLayout><MealPlansList /></AdminLayout>} />
          <Route path="/food-managers" element={<AdminLayout><FoodManagerList /></AdminLayout>} />
          <Route path="/food-managers/create" element={<AdminLayout><FoodManagerCreate /></AdminLayout>} />
          <Route path="/food-managers/edit/:id" element={<AdminLayout><FoodManagerCreate /></AdminLayout>} />
          <Route path="/food/diet-types" element={<AdminLayout><DietTypeList /></AdminLayout>} />
          <Route path="/procedures" element={<AdminLayout><ProceduresList /></AdminLayout>} />
          <Route path="/procedures/create" element={<AdminLayout><ProcedureForm /></AdminLayout>} />
          <Route path="/procedures/edit/:id" element={<AdminLayout><ProcedureForm /></AdminLayout>} />
          <Route path="/accountant" element={<AdminLayout><AccountantList /></AdminLayout>} />
          <Route path="/accountant/create" element={<AdminLayout><AccountantCreate /></AdminLayout>} />
          <Route path="/accountant/edit/:id" element={<AdminLayout><AccountantCreate /></AdminLayout>} />
          <Route path="/accountant-dashboard" element={<AdminLayout><AccountantDashboard /></AdminLayout>} />
          <Route path="/billing" element={<AdminLayout><BillingList /></AdminLayout>} />
          <Route path="/hr" element={<AdminLayout><HRList /></AdminLayout>} />
          <Route path="/hr/create" element={<AdminLayout><HRCreate /></AdminLayout>} />
          <Route path="/hr/edit/:id" element={<AdminLayout><HRCreate /></AdminLayout>} />
          <Route path="/hrms/leave-config" element={<AdminLayout><LeaveConfig /></AdminLayout>} />
          <Route path="/hrms/leave" element={<AdminLayout><LeaveApplications /></AdminLayout>} />
          <Route path="/hrms/attendance" element={<AdminLayout><Attendance /></AdminLayout>} />
          <Route path="/hrms/salary-config" element={<AdminLayout><SalaryConfig /></AdminLayout>} />
          <Route path="/hrms/salary-slips" element={<AdminLayout><SalarySlips /></AdminLayout>} />
          <Route path="/hrms/documents" element={<AdminLayout><StaffDocuments /></AdminLayout>} />
          <Route path="/my-hrms" element={<AdminLayout><MyHRMS /></AdminLayout>} />
          <Route path="/billable-items" element={<AdminLayout><BillableItemsList /></AdminLayout>} />
          <Route path="/billable-items/create" element={<AdminLayout><BillableItemForm /></AdminLayout>} />
          <Route path="/billable-items/edit/:id" element={<AdminLayout><BillableItemForm /></AdminLayout>} />
          <Route path="/pos" element={<POSPage />} />
          <Route path="/pos/sales" element={<AdminLayout><POSList /></AdminLayout>} />
          <Route path="/receipt/:id" element={<POSReceipt />} />
          <Route path="/session-plans" element={<AdminLayout><SessionPlans /></AdminLayout>} />
          <Route path="/session-plans/create" element={<AdminLayout><SessionPlanCreate /></AdminLayout>} />
          <Route path="/session-plans/due-tomorrow" element={<AdminLayout><SessionsDueTomorrow /></AdminLayout>} />
          <Route path="/session-plans/:id" element={<AdminLayout><SessionPlanDetail /></AdminLayout>} />
        </Routes>
        </Suspense>
      </Router>
    </SidebarProvider>
  );
}

export default App;
