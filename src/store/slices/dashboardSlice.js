import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// We could add fetch logic here if needed for global data
// export const fetchDashboardStats = createAsyncThunk('dashboard/fetchStats', async () => { ... })

const initialState = {
  currentRole: localStorage.getItem('role') || 'admin', 
  isLoading: false,
  error: null,
  globalStats: {}, // Place to store any globally shared stats across dashboards
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setRole: (state, action) => {
      state.currentRole = action.payload;
    },
    setGlobalStats: (state, action) => {
      state.globalStats = { ...state.globalStats, ...action.payload };
    }
  },
});

export const { setRole, setGlobalStats } = dashboardSlice.actions;
export default dashboardSlice.reducer;
