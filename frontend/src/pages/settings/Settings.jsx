
import { useEffect, useState } from "react";
import {
  User,
  Bell,
  Settings as SettingsIcon,
  Save,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const DEFAULT_NOTIFICATIONS = {
  newIncident: true,
  criticalIncident: true,
  statusUpdates: false,
  weeklyReport: true,
};

const DEFAULT_PREFERENCES = {
  refreshInterval: "30",
  timezone: "Asia/Kolkata",
};

const readSettings = (key, defaults) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
  } catch {
    return defaults;
  }
};

function Settings() {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState(() =>
    readSettings("devopspilot_notifications", DEFAULT_NOTIFICATIONS)
  );

  const [preferences, setPreferences] = useState(() =>
    readSettings("devopspilot_preferences", DEFAULT_PREFERENCES)
  );

  const [saving, setSaving] = useState(false);

  const profile = {
    name: user?.name || "Not available",
    email: user?.email || "Not available",
    role: user?.role || "User",
  };

  const handleNotificationChange = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handlePreferenceChange = (e) => {
    const { name, value } = e.target;

    setPreferences((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    try {
      setSaving(true);

      localStorage.setItem(
        "devopspilot_notifications",
        JSON.stringify(notifications)
      );

      localStorage.setItem(
        "devopspilot_preferences",
        JSON.stringify(preferences)
      );

      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error("Settings save error:", error);
      toast.error("Unable to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const notificationOptions = [
    {
      key: "newIncident",
      title: "New incident reported",
      description: "Get notified when a new incident is created.",
    },
    {
      key: "criticalIncident",
      title: "Critical incidents",
      description: "Get notified about critical severity incidents.",
    },
    {
      key: "statusUpdates",
      title: "Incident status updates",
      description: "Get notified when an incident status changes.",
    },
    {
      key: "weeklyReport",
      title: "Weekly reports",
      description: "Receive a weekly system activity summary.",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-sm text-slate-400">
          Manage your account and application preferences.
        </p>
      </div>

      {/* Profile Settings */}
      <section className="panel space-y-5 p-5">
        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-cyan-400" />
          <div>
            <h2 className="font-semibold text-white">Profile Settings</h2>
            <p className="text-sm text-slate-400">
              Your account information.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Full Name
            </label>
            <input
              value={profile.name}
              readOnly
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-slate-300"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Email Address
            </label>
            <input
              value={profile.email}
              readOnly
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-slate-300"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Role
            </label>
            <input
              value={profile.role}
              readOnly
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-slate-300"
            />
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Profile information is retrieved from your authenticated account.
        </p>
      </section>

      {/* Notification Settings */}
      <section className="panel space-y-5 p-5">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-cyan-400" />
          <div>
            <h2 className="font-semibold text-white">
              Notification Preferences
            </h2>
            <p className="text-sm text-slate-400">
              Choose which incident notifications you prefer to receive.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {notificationOptions.map(({ key, title, description }) => (
            <div
              key={key}
              className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4 last:border-0 last:pb-0"
            >
              <div>
                <p className="text-sm font-medium text-white">{title}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {description}
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-label={title}
                aria-checked={notifications[key]}
                onClick={() => handleNotificationChange(key)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                  notifications[key] ? "bg-cyan-500" : "bg-slate-700"
                }`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                    notifications[key] ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Application Preferences */}
      <section className="panel space-y-5 p-5">
        <div className="flex items-center gap-3">
          <SettingsIcon className="h-5 w-5 text-cyan-400" />
          <div>
            <h2 className="font-semibold text-white">
              Application Preferences
            </h2>
            <p className="text-sm text-slate-400">
              Configure your dashboard preferences.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Dashboard Refresh Interval
            </label>
            <select
              name="refreshInterval"
              value={preferences.refreshInterval}
              onChange={handlePreferenceChange}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-white outline-none focus:border-cyan-500"
            >
              <option value="15">15 seconds</option>
              <option value="30">30 seconds</option>
              <option value="60">1 minute</option>
              <option value="300">5 minutes</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Timezone
            </label>
            <select
              name="timezone"
              value={preferences.timezone}
              onChange={handlePreferenceChange}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-white outline-none focus:border-cyan-500"
            >
              <option value="Asia/Kolkata">India Standard Time</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="Europe/London">London Time</option>
            </select>
          </div>
        </div>
      </section>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={17} />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

export default Settings;
