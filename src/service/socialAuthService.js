// frontend/src/service/socialAuthService.js
import axios from "axios";
import BASE_API from "../api/baseurl.js";

const API_URL = `${BASE_API}/auth/social`;

const socialAuthService = {
  /**
   * ⚙️ Get OAuth config from backend
   */
  async getConfig() {
    try {
      const res = await axios.get(`${API_URL}/config`);
      return res.data?.data || {};
    } catch {
      return {};
    }
  },

  /**
   * 🌐 Verify Google credentials with backend
   */
  async verifyGoogle({ credential, accessToken }) {
    const res = await axios.post(`${API_URL}/google`, {
      credential,
      accessToken,
    });
    return res.data;
  },

  /**
   * 🟦 Verify Microsoft credentials with backend
   */
  async verifyMicrosoft({ accessToken, idToken }) {
    const res = await axios.post(`${API_URL}/microsoft`, {
      accessToken,
      idToken,
    });
    return res.data;
  },

  /**
   * 🚀 Initiate Google OAuth2 Popup
   */
  initiateGooglePopup(clientId, onTokenReceived, onError) {
    if (!clientId) {
      onError?.("Google Client ID is not configured. Please add VITE_GOOGLE_CLIENT_ID in your environment.");
      return;
    }

    const redirectUri = window.location.origin;
    const scope = encodeURIComponent("openid email profile");
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=token%20id_token&scope=${scope}&nonce=${Date.now()}&prompt=select_account`;

    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      authUrl,
      "Google Sign-In",
      `width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no,menubar=no`
    );

    if (!popup) {
      onError?.("Popup blocked by browser. Please allow popups for this site.");
      return;
    }

    // Monitor popup redirect with tokens in hash fragment
    const interval = setInterval(() => {
      try {
        if (!popup || popup.closed) {
          clearInterval(interval);
          return;
        }

        if (popup.location.href.includes(redirectUri)) {
          const hash = popup.location.hash || popup.location.search;
          const params = new URLSearchParams(hash.replace(/^[#?]/, ""));
          const idToken = params.get("id_token");
          const accessToken = params.get("access_token");

          if (idToken || accessToken) {
            clearInterval(interval);
            popup.close();
            onTokenReceived?.({ credential: idToken, accessToken });
          }
        }
      } catch {
        // Cross-origin restriction until popup redirects back to origin
      }
    }, 500);
  },

  /**
   * 🚀 Initiate Microsoft Azure AD OAuth2 Popup
   */
  initiateMicrosoftPopup(clientId, onTokenReceived, onError) {
    if (!clientId) {
      onError?.("Microsoft Client ID is not configured. Please add VITE_MICROSOFT_CLIENT_ID in your environment.");
      return;
    }

    const redirectUri = window.location.origin;
    const scope = encodeURIComponent("openid profile email User.Read");
    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&response_type=token%20id_token&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${scope}&nonce=${Date.now()}&response_mode=fragment&prompt=select_account`;

    const width = 500;
    const height = 620;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      authUrl,
      "Microsoft Sign-In",
      `width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no,menubar=no`
    );

    if (!popup) {
      onError?.("Popup blocked by browser. Please allow popups for this site.");
      return;
    }

    const interval = setInterval(() => {
      try {
        if (!popup || popup.closed) {
          clearInterval(interval);
          return;
        }

        if (popup.location.href.includes(redirectUri)) {
          const hash = popup.location.hash || popup.location.search;
          const params = new URLSearchParams(hash.replace(/^[#?]/, ""));
          const idToken = params.get("id_token");
          const accessToken = params.get("access_token");

          if (idToken || accessToken) {
            clearInterval(interval);
            popup.close();
            onTokenReceived?.({ accessToken, idToken });
          }
        }
      } catch {
        // Cross-origin restriction until redirect
      }
    }, 500);
  },
};

export default socialAuthService;

