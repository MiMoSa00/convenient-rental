"use client";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  Bell,
  Lock,
  Palette,
  Globe,
  Trash,
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

// Enhanced scroll reveal component
const ScrollReveal = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.95 }}
      transition={{
        duration: 0.6,
        delay: delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
    >
      {children}
    </motion.div>
  );
};

export default function SettingsPage() {
  const { data: session, status } = useSession() as { data: any; status: string };
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
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Home className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Sign In Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please sign in to access your settings.
          </p>
        </motion.div>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-8 h-8 text-blue-500" />
        </motion.div>
      </div>
    );
  }

  if (!settings) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4"
      >
        <div className="text-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Error Loading Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            We encountered an issue loading your settings.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchSettings}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </motion.button>
        </div>
      </motion.div>
    );
  }

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
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700/80 transition border border-gray-200 dark:border-gray-700 cursor-pointer"
      onClick={() => onChange(!value)}
    >
      <div className="flex-1">
        <p className="font-medium text-gray-900 dark:text-white">{label}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
      <motion.button
        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ml-4 flex-shrink-0 ${
          value ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
        }`}
        whileTap={{ scale: 0.95 }}
      >
        <motion.span
          className="inline-block h-6 w-6 transform rounded-full bg-white shadow-md"
          animate={{ x: value ? 28 : 4 }}
          transition={{ type: "spring", stiffness: 500, damping: 40 }}
        />
      </motion.button>
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
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
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
    delay = 0,
  }: {
    icon: any;
    title: string;
    description?: string;
    children: React.ReactNode;
    delay?: number;
  }) => (
    <ScrollReveal delay={delay}>
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300"
      >
        <div className="flex items-start space-x-4 mb-6">
          <motion.div
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.6 }}
            className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0"
          >
            <Icon className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
            {description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
            )}
          </div>
        </div>
        <div className="space-y-3">{children}</div>
      </motion.div>
    </ScrollReveal>
  );

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8"
        >
          <motion.h1
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold text-gray-900 dark:text-white mb-2"
          >
            Settings
          </motion.h1>
          <motion.p
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-600 dark:text-gray-400"
          >
            Manage your account preferences and privacy settings
          </motion.p>
        </motion.div>

        {/* Messages */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={`mb-6 p-4 rounded-lg flex items-start space-x-3 border ${
              message.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
            }`}
          >
            <motion.div
              animate={{ rotate: message.type === "success" ? [0, 360] : [0, -10, 10, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
            >
              {message.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              )}
            </motion.div>
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
        <div className="space-y-6">
          {/* Notifications */}
          <SettingSection
            icon={Bell}
            title="Notifications"
            description="Control how you receive updates"
            delay={0.1}
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
            delay={0.2}
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
            delay={0.3}
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
            delay={0.4}
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
          <ScrollReveal delay={0.5}>
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-red-50 dark:bg-red-900/20 rounded-2xl shadow-sm border-2 border-red-200 dark:border-red-800 p-6 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start space-x-4 mb-4">
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                  className="p-2 rounded-lg bg-red-100 dark:bg-red-900/40 flex-shrink-0"
                >
                  <Trash className="w-6 h-6 text-red-600 dark:text-red-400" />
                </motion.div>
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
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 rounded-lg bg-red-100 dark:bg-red-900/40 mb-4 border border-red-200 dark:border-red-700"
                >
                  <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-3">
                    This action cannot be undone. Type DELETE to confirm.
                  </p>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
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
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDeleteConfirm(false)}
                      disabled={deleting}
                      className="px-4 py-2 bg-red-200 dark:bg-red-900/50 text-red-800 dark:text-red-200 rounded-lg hover:bg-red-300 dark:hover:bg-red-900/70 disabled:opacity-50 transition flex-1"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </motion.div>
              )}
              {!deleteConfirm && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeleteAccount}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                >
                  Delete Account
                </motion.button>
              )}
            </motion.div>
          </ScrollReveal>
        </div>

        {/* Action Buttons */}
        <ScrollReveal delay={0.6}>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleResetSettings}
              disabled={!hasChanges || saving}
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md hover:shadow-lg"
            >
              Reset Changes
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSaveSettings}
              disabled={!hasChanges || saving}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
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
            </motion.button>
          </div>
        </ScrollReveal>
      </div>
    </motion.div>
  );
}