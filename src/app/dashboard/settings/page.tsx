"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Bell,
  Lock,
  Palette,
  Globe,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle,
  Loader2,
  Home,
} from "lucide-react";

interface Settings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  privateProfile: boolean;
  allowRoommateMatching: boolean;
  theme: "light" | "dark" | "auto";
  language: string;
  timezone: string;
  twoFactorEnabled: boolean;
}

interface UserSettingsData {
  id: number;
  email: string;
  settings: Settings;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [originalSettings, setOriginalSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetchSettings();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  // Track if settings have changed
  useEffect(() => {
    if (settings && originalSettings) {
      const changed = JSON.stringify(settings) !== JSON.stringify(originalSettings);
      setHasChanges(changed);
    }
  }, [settings, originalSettings]);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings", {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) throw new Error("Failed to fetch settings");

      const data: UserSettingsData = await response.json();
      setSettings(data.settings);
      setOriginalSettings(data.settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      setMessage({ type: "error", text: "Failed to load settings" });
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: keyof Settings, value: any) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
    }
  };

  const handleSaveSettings = async () => {
    if (!settings || !hasChanges) return;

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error("Failed to save settings");

      const data: UserSettingsData = await response.json();
      setSettings(data.settings);
      setOriginalSettings(data.settings);
      setMessage({ type: "success", text: "Settings saved successfully!" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage({ type: "error", text: "Failed to save settings. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handleResetSettings = () => {
    if (originalSettings) {
      setSettings(originalSettings);
      setHasChanges(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch("/api/settings", {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete account");

      setMessage({ type: "success", text: "Account deleted. Redirecting..." });
      setTimeout(() => (window.location.href = "/"), 2000);
    } catch (error) {
      console.error("Error deleting account:", error);
      setMessage({ type: "error", text: "Failed to delete account. Please try again." });
      setDeleting(false);
      setDeleteConfirm(false);
    }
  };

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <Home className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Sign In Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please sign in to access your settings.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Error Loading Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            We encountered an issue loading your settings.
          </p>
          <button
            onClick={fetchSettings}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const sectionVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
  };

  const SettingToggle = ({
    label,
    description,
    value,
    onChange,
  }: {
    label: string;
    description: string;
    value: boolean;
    onChange: (v: boolean) => void;
  }) => (
    <motion.div
      variants={sectionVariants}
      className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700/80 transition border border-gray-200 dark:border-gray-700"
    >
      <div className="flex-1">
        <p className="font-medium text-gray-900 dark:text-white">{label}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ml-4 flex-shrink-0 ${
          value ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
        }`}
      >
        <motion.span
          className="inline-block h-6 w-6 transform rounded-full bg-white shadow-md"
          animate={{ x: value ? 28 : 4 }}
          transition={{ type: "spring", stiffness: 500, damping: 40 }}
        />
      </button>
    </motion.div>
  );

  const SettingSelect = ({
    label,
    description,
    value,
    onChange,
    options,
  }: {
    label: string;
    description: string;
    value: string;
    onChange: (v: string) => void;
    options: { label: string; value: string }[];
  }) => (
    <motion.div
      variants={sectionVariants}
      className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
    >
      <label className="block font-medium text-gray-900 dark:text-white mb-2">{label}</label>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{description}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </motion.div>
  );

  const SettingSection = ({
    icon: Icon,
    title,
    description,
    children,
  }: {
    icon: any;
    title: string;
    description?: string;
    children: React.ReactNode;
  }) => (
    <motion.div
      variants={containerVariants}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="flex items-start space-x-4 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
          )}
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </motion.div>
  );

  return (
    <motion.div
      className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div variants={containerVariants} className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account preferences and privacy settings
          </p>
        </motion.div>

        {/* Messages */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-6 p-4 rounded-lg flex items-start space-x-3 border ${
              message.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <span
              className={
                message.type === "success"
                  ? "text-green-800 dark:text-green-300"
                  : "text-red-800 dark:text-red-300"
              }
            >
              {message.text}
            </span>
          </motion.div>
        )}

        {/* Settings Sections */}
        <motion.div className="space-y-6">
          {/* Notifications */}
          <SettingSection
            icon={Bell}
            title="Notifications"
            description="Control how you receive updates"
          >
            <SettingToggle
              label="Email Notifications"
              description="Receive email updates about your account activity"
              value={settings.emailNotifications}
              onChange={(v) => handleSettingChange("emailNotifications", v)}
            />
            <SettingToggle
              label="Push Notifications"
              description="Receive push notifications on your device"
              value={settings.pushNotifications}
              onChange={(v) => handleSettingChange("pushNotifications", v)}
            />
            <SettingToggle
              label="Marketing Emails"
              description="Receive emails about new features and promotions"
              value={settings.marketingEmails}
              onChange={(v) => handleSettingChange("marketingEmails", v)}
            />
          </SettingSection>

          {/* Privacy & Safety */}
          <SettingSection
            icon={Lock}
            title="Privacy & Safety"
            description="Control your profile visibility and matching"
          >
            <SettingToggle
              label="Private Profile"
              description="Hide your profile from other users"
              value={settings.privateProfile}
              onChange={(v) => handleSettingChange("privateProfile", v)}
            />
            <SettingToggle
              label="Allow Roommate Matching"
              description="Let the algorithm find compatible roommates for you"
              value={settings.allowRoommateMatching}
              onChange={(v) => handleSettingChange("allowRoommateMatching", v)}
            />
            <SettingToggle
              label="Two-Factor Authentication"
              description="Add an extra layer of security to your account"
              value={settings.twoFactorEnabled}
              onChange={(v) => handleSettingChange("twoFactorEnabled", v)}
            />
          </SettingSection>

          {/* Appearance */}
          <SettingSection
            icon={Palette}
            title="Appearance"
            description="Customize how the app looks"
          >
            <SettingSelect
              label="Theme"
              description="Choose how the app looks"
              value={settings.theme}
              onChange={(v) => handleSettingChange("theme", v as "light" | "dark" | "auto")}
              options={[
                { label: "Light", value: "light" },
                { label: "Dark", value: "dark" },
                { label: "Auto (System)", value: "auto" },
              ]}
            />
          </SettingSection>

          {/* Localization */}
          <SettingSection
            icon={Globe}
            title="Localization"
            description="Set your language and timezone"
          >
            <SettingSelect
              label="Language"
              description="Choose your preferred language"
              value={settings.language}
              onChange={(v) => handleSettingChange("language", v)}
              options={[
                { label: "English", value: "en" },
                { label: "Spanish", value: "es" },
                { label: "French", value: "fr" },
                { label: "German", value: "de" },
                { label: "Portuguese", value: "pt" },
                { label: "Chinese", value: "zh" },
                { label: "Japanese", value: "ja" },
              ]}
            />
            <SettingSelect
              label="Timezone"
              description="Select your timezone for accurate scheduling"
              value={settings.timezone}
              onChange={(v) => handleSettingChange("timezone", v)}
              options={[
                { label: "UTC", value: "UTC" },
                { label: "GMT", value: "GMT" },
                { label: "EST (UTC-5)", value: "EST" },
                { label: "CST (UTC-6)", value: "CST" },
                { label: "MST (UTC-7)", value: "MST" },
                { label: "PST (UTC-8)", value: "PST" },
                { label: "IST (UTC+5:30)", value: "IST" },
                { label: "JST (UTC+9)", value: "JST" },
                { label: "AEST (UTC+10)", value: "AEST" },
              ]}
            />
          </SettingSection>

          {/* Danger Zone */}
          <motion.div
            variants={containerVariants}
            className="bg-red-50 dark:bg-red-900/20 rounded-2xl shadow-sm border-2 border-red-200 dark:border-red-800 p-6"
          >
            <div className="flex items-start space-x-4 mb-4">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/40 flex-shrink-0">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-red-700 dark:text-red-400">Danger Zone</h2>
                <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                  Deleting your account is permanent and cannot be undone. All your data will be
                  deleted.
                </p>
              </div>
            </div>

            {deleteConfirm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-4 rounded-lg bg-red-100 dark:bg-red-900/40 mb-4 border border-red-200 dark:border-red-700"
              >
                <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-3">
                  This action cannot be undone. Type DELETE to confirm.
                </p>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition flex items-center justify-center space-x-2 flex-1"
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      "Confirm Delete"
                    )}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    disabled={deleting}
                    className="px-4 py-2 bg-red-200 dark:bg-red-900/50 text-red-800 dark:text-red-200 rounded-lg hover:bg-red-300 dark:hover:bg-red-900/70 disabled:opacity-50 transition flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
            {!deleteConfirm && (
              <button
                onClick={handleDeleteAccount}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Delete Account
              </button>
            )}
          </motion.div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div variants={containerVariants} className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleResetSettings}
            disabled={!hasChanges || saving}
            className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Reset Changes
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={!hasChanges || saving}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center space-x-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}