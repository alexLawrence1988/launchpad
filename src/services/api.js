import settings from 'electron-settings';
import axios from 'axios';
import { ipcRenderer } from 'electron';

const baseURL = 'https://manhattan.leadforensics.com/manhattan/launchpad_apigateway';
const api = axios.create({
  baseURL,
  timeout: 30000,
});

export default {
  ping: async () => {
    try {
      await axios(`${baseURL}_ping/ping`);
      return true;
    } catch (err) {
      return false;
    }
  },
  //= =======================================
  // Login
  //= =======================================
  login: async (login) => {
    try {
      const body = {
        name: login.username,
        password: login.password,
        deviceModel: 'LeadForensics_Reveal',
        deviceVersion: '1.0',
      };

      const response = await api.post('/authenticate', body);

      if (response.data.success === false) {
        settings.set('authorised', false);

        return {
          success: false,
          error: response.data.message,
        };
      }
      settings.set('token', response.data.token);
      settings.set('authorised', true);

      return {
        success: true,
        user: response.data.user,
      };
    } catch (err) {
      return {
        success: false,
        error: 'It looks like we are having some problems connecting, please try again.'
      }
    }
  },

  //= =======================================
  // Logout
  //= =======================================
  logout: async () => {
    settings.set('authorised', false);
    settings.set('token', null);
    ipcRenderer.send('logout');
    ipcRenderer.send('open-window', 'LOGIN');
  },

  //= =======================================
  // Validate user is still active
  //= =======================================
  validateUser: async () => {
    try {
      console.log('validating user is still active');
      const token = settings.get('token', null);
      api.defaults.headers['x-access-token'] = token;
      const response = await api.get('/validateuser');
      return response.data;
    } catch (err) {
      console.log(err);
    }
  },
  //= =======================================
  // Get visits to display blocks
  //= =======================================
  getVisits: async (triggerReportFilterIds) => {
    const token = settings.get('token', null);
    api.defaults.headers['x-access-token'] = token;
    const response = await api.post('/visits', { triggerReportFilterIds });

    return response.data;
  },

  //= =======================================
  // Get trigger reports
  //= =======================================
  getTriggerReports: async () => {
    const token = settings.get('token', null);
    api.defaults.headers['x-access-token'] = token;

    const response = await api.get('/triggerreports');
    return response.data;
  },

  //= =======================================
  // Categories
  //= =======================================
  getCategories: async () => {
    const token = settings.get('token', null);
    api.defaults.headers['x-access-token'] = token;

    const response = await api.get('/categories');
    return response.data;
  },
  putBusinessCategory: async (businessId, category, onSuccess, onError) => {
    try {
      const token = settings.get('token', null);
      api.defaults.headers['x-access-token'] = token;

      await api.put('/businesscategory', { businessId, categoryId: category.id });
      // return the category on success, so we can update the store
      onSuccess(category);
    } catch (err) {
      onError(err);
    }
  },

  //= =======================================
  // Client Users/Assignments
  //= =======================================
  getClientUsers: async () => {
    const token = settings.get('token', null);
    api.defaults.headers['x-access-token'] = token;

    const response = await api.get('/clientusers');
    return response.data;
  },
  putBusinessAssignment: async (businessId, clientUser, onSuccess, onError) => {
    try {
      const token = settings.get('token', null);
      api.defaults.headers['x-access-token'] = token;

      await api.put('/businessassignment', { businessId, clientUserId: clientUser.id });
      // return the clientUser on success, so we can update the store
      onSuccess(clientUser);
    } catch (err) {
      onError(err);
    }
  },

  //= =======================================
  // Reset password
  //= =======================================
  forgotPwd: async (user) => {
    try {
      console.log(`resetting password for user ${user}`);
      const response = await api.post('/resetpwd', { user });
      return response.data;
    } catch (err) {
      console.log(err);
    }
  },

  //= =======================================
  // Get user settings
  //= =======================================
  getUserSettings: async () => {
    const token = settings.get('token', null);
    api.defaults.headers['x-access-token'] = token;

    const response = await api.get('/usersettings');
    return response.data;
  },

  //= =======================================
  // Post user settings
  //= =======================================
  postUserSettings: async (userSettings, triggerReportColors, onSuccess, onError) => {
    const defaultColors = [
      '#9B6EF3',
      '#83B2FF',
      '#8BF18B',
      '#FFE981',
      '#FF8650',
      '#FF555E',
      '#9B6EF3',
      '#83B2FF',
      '#8BF18B',
      '#FFE981',
      '#FF8650',
      '#FF555E',
    ];

    try {
      const token = settings.get('token', null);
      api.defaults.headers['x-access-token'] = token;

      const triggerReportFilterColors = [];
      if (userSettings.triggerReportFilters) {
        // build up TriggerReportIDs/colors to save in the database
        userSettings.triggerReportFilters.forEach((triggerReportId, index) => {
          triggerReportFilterColors.push({
            triggerReportId,
            // if a color is not already set, take one of the defaults defined
            colorHex: triggerReportColors[triggerReportId] || defaultColors[index] || '#E0E0E0',
          });
        });
      }

      const data = {
        blockExpireMins: userSettings.blockExpireMins,
        triggerReportFilters: triggerReportFilterColors,
      };

      await api.post('/usersettings', data);
      // return the settings and colors on success, so we can update the store
      onSuccess(userSettings, triggerReportFilterColors);
    } catch (err) {
      onError(err);
    }
  },

  //= =======================================
  // Send visit email
  //= =======================================
  sendVisitEmail: async (email, block, sender, onSuccess, onError) => {
    try {
      const token = await settings.get('token', null);
      api.defaults.headers['x-access-token'] = token;

      // User information
      const user = settings.get('user');

      // Visit Date
      const visitDate = new Date(block.startDate).toLocaleString().replace(/:\d{2}\s/, '');

      // Address
      const addressLines = [
        block.business.add1,
        block.business.add2,
        block.business.add3,
        block.business.locality,
        block.business.town,
        (!block.business.county && block.business.state) ? block.business.state : block.business.county,
        block.business.postcode,
        block.business.country,
      ];

      const fullAddress = addressLines.filter(Boolean).join(', ');

      // Assignments
      const assignments = block.assignments.map(a => a.name);

      // Categories
      const categories = block.categories.map(c => c.name);

      // View in Portal
      const link = `http://links.leadforensics.com?redir=portal&PageID=1&VisitID=${block.visitId}`;

      // Build Email
      let visitHtml = require('../templates/visitemail.js');
      visitHtml = visitHtml.replace(/%BUSINESS.LOGO%/g, block.logo);
      visitHtml = visitHtml.replace(/%VISIT.DATE%/g, visitDate);
      visitHtml = visitHtml.replace(/%BUSINESS.NAME%/g, block.business.name);
      visitHtml = visitHtml.replace(/%BUSINESS.FULLADDRESS%/g, fullAddress);
      if (assignments.length > 0) {
        visitHtml = visitHtml.replace(/%VISIT.ASSIGNMENTS%/g, assignments.join(', '));
      } else {
        visitHtml = visitHtml.replace(/class="assignments"/g, 'class="hidden"');
      }
      if (categories.length > 0) {
        visitHtml = visitHtml.replace(/%VISIT.CATEGORIES%/g, categories.join(', '));
      } else {
        visitHtml = visitHtml.replace(/class="categories"/g, 'class="hidden"');
      }
      if (block.business.website) {
        visitHtml = visitHtml.replace(/%BUSINESS.WEBSITE%/g, block.business.website);
      } else {
        visitHtml = visitHtml.replace(/class="website"/g, 'class="hidden"');
      }
      visitHtml = visitHtml.replace(/%VISIT.LINK%/g, link);

      const message = JSON.stringify({
        type: 'Lead Forensics Visit',
        client: user.clientId || 0,
        to: [email],
        subject: `Lead Forensics Visit sent by ${sender}`,
        html: visitHtml,
        sendvia: 'SES',
      });

      await api.post('/sendemail', { message });

      onSuccess();
    } catch (err) {
      onError(err);
    }
  },
  putLog: async (logType) => {
    const token = await settings.get('token', null);
    api.defaults.headers['x-access-token'] = token;
    api.put(`/log?logType=${logType}`);
  },
};
