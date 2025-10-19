"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion, type Variants, type Transition } from "framer-motion";
import {
  User,
  Mail,
  Calendar,
  Briefcase,
  MapPin,
  Heart,
  Edit,
  Save,
  Camera,
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  occupation: string;
  bio: string;
  interests: string[];
  location: string;
  profileImage: string;
  preferences: {
    cleanliness: number;
    quietness: number;
    socialness: number;
    pets: boolean;
    smoking: boolean;
    maxRent: number;
  };
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Generate user-scoped localStorage keys
  const getUserScopedKey = (baseKey: string): string => {
    if (!session?.user?.id) return baseKey;
    return `${baseKey}_${session.user.id}`;
  };

  useEffect(() => {
    if (status === "loading") return;

    if (status !== "authenticated") {
      setLoading(false);
      setProfile(null);
      setErrorMsg("You are not signed in.");
      return;
    }

    // First try to load from localStorage (quiz data)
    const localProfile = buildProfileFromLocalQuiz();
    if (localProfile) {
      setProfile(localProfile);
      setEditedProfile(localProfile);
      setLoading(false);
    } else {
      // If no local data, try to fetch from server
      fetchProfile();
    }
  }, [status, session?.user?.id]);

  const normalizeProfile = (data: any): UserProfile => {
    return {
      ...data,
      interests: Array.isArray(data?.interests) ? data.interests : [],
      preferences: {
        cleanliness: data?.preferences?.cleanliness ?? 0,
        quietness: data?.preferences?.quietness ?? 0,
        socialness: data?.preferences?.socialness ?? 0,
        pets: Boolean(data?.preferences?.pets),
        smoking: Boolean(data?.preferences?.smoking),
        maxRent: Number.isFinite(Number(data?.preferences?.maxRent))
          ? Number(data.preferences.maxRent)
          : 0,
      },
    };
  };

  const fetchProfile = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const response = await fetch(`/api/profile`, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized (401)");
        }
        if (response.status === 404) {
          console.log("Profile not found - user needs to create one");
          setProfile(null);
          setEditedProfile(null);
          setLoading(false);
          return;
        }
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }

      const data = await response.json();
      if (!data || !data.id) {
        setProfile(null);
        setEditedProfile(null);
      } else {
        const normalized = normalizeProfile(data);
        setProfile(normalized);
        setEditedProfile(normalized);
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      setProfile(null);
      setEditedProfile(null);
      setErrorMsg(error?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editedProfile) return;
    
    setLoading(true);
    setErrorMsg(null);
    
    try {
      // Try PUT first (update existing profile)
      let response = await fetch("/api/profile", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedProfile),
      });

      // If profile doesn't exist (404), try POST (create new profile)
      if (response.status === 404) {
        response = await fetch("/api/profile", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editedProfile),
        });
      }

      if (response.ok) {
        const saved = await response.json().catch(() => editedProfile);
        const normalized = normalizeProfile(saved);
        setProfile(normalized);
        setEditedProfile(normalized);
        setIsEditing(false);
        setErrorMsg(null);
      } else {
        const errorData = await response.json().catch(() => ({ error: "Failed to update profile" }));
        console.error("Failed to update profile", errorData);
        setErrorMsg(errorData.error || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrorMsg("Error updating profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Image size must be less than 5MB");
      return;
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setErrorMsg("Please upload a valid image file (JPEG, PNG, GIF, or WebP)");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    
    setErrorMsg(null);
    setLoading(true);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setEditedProfile((prev) => (prev ? { ...prev, profileImage: data.url } : null));
        setErrorMsg("Image uploaded successfully! Don't forget to save your changes.");
      } else {
        const errorData = await response.json();
        setErrorMsg(errorData.error || "Image upload failed");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setErrorMsg("Error uploading image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Map roommate quiz data to user profile structure
  const mapRoommateProfileToUserProfile = (roommateProfile: any): Partial<UserProfile> => {
    // Map cleanliness levels
    const cleanlinessMap: Record<string, number> = {
      'very-clean': 5,
      'moderately-clean': 3,
      'relaxed': 1
    };

    // Map social levels
    const socialnessMap: Record<string, number> = {
      'very-social': 5,
      'moderately-social': 3,
      'prefer-quiet': 1
    };

    // Map sleep schedule to quietness (early birds tend to prefer quiet)
    const quietnessMap: Record<string, number> = {
      'early-bird': 4,
      'night-owl': 2,
      'flexible': 3
    };

    // Determine smoking from tolerance
    const smoking = roommateProfile.smokingTolerance === 'anywhere' || 
                    roommateProfile.smokingTolerance === 'outdoor-only';

    // Determine pets from preference
    const pets = roommateProfile.petPreference === 'love-pets' || 
                 roommateProfile.petPreference === 'okay-with-pets';

    // Convert shared activities to interests
    const interests = roommateProfile.sharedActivities || [];

    // Get budget max (using the max from range)
    const maxRent = roommateProfile.budget?.max || 0;

    return {
      age: roommateProfile.age || 0,
      gender: roommateProfile.gender || '',
      occupation: roommateProfile.occupation || '',
      location: roommateProfile.location || '',
      bio: `Looking for a roommate. Move-in date: ${roommateProfile.moveInDate || 'Flexible'}. ` +
           `Lease duration: ${roommateProfile.leaseDuration || 'Flexible'}.`,
      interests: interests,
      preferences: {
        cleanliness: cleanlinessMap[roommateProfile.cleanlinessLevel] || 3,
        quietness: quietnessMap[roommateProfile.sleepSchedule] || 3,
        socialness: socialnessMap[roommateProfile.socialLevel] || 3,
        pets: pets,
        smoking: smoking,
        maxRent: maxRent
      }
    };
  };

  // Build profile from quiz answers stored in user-scoped localStorage
  const buildProfileFromLocalQuiz = (): UserProfile | null => {
    if (typeof window === "undefined") return null;
    if (!session?.user?.id) return null;

    // Use user-scoped key
    const profileKey = getUserScopedKey('roommate_profile_data');
    const raw = localStorage.getItem(profileKey);

    if (!raw) return null;

    let quizData: any;
    try {
      quizData = JSON.parse(raw);
    } catch {
      return null;
    }

    // Verify the data belongs to this user (security check)
    if (quizData.userId && quizData.userId !== session.user.id) {
      console.warn('Quiz data user ID mismatch, ignoring');
      return null;
    }

    // Check if it's the new roommate profile format
    if (quizData.isComplete && quizData.userId) {
      const mapped = mapRoommateProfileToUserProfile(quizData);
      
      return {
        id: session.user?.id || '',
        name: session.user?.name || '',
        email: session.user?.email || '',
        profileImage: '',
        ...mapped,
        age: mapped.age || 0,
        gender: mapped.gender || '',
        occupation: mapped.occupation || '',
        location: mapped.location || '',
        bio: mapped.bio || '',
        interests: mapped.interests || [],
        preferences: mapped.preferences || {
          cleanliness: 0,
          quietness: 0,
          socialness: 0,
          pets: false,
          smoking: false,
          maxRent: 0
        }
      };
    }

    return null;
  };

  // Generate profile from quiz answers stored in localStorage
  const generateProfileFromQuiz = async () => {
    if (!session?.user?.id) {
      setErrorMsg('No user session found');
      return;
    }

    setErrorMsg(null);
    try {
      const draft = buildProfileFromLocalQuiz();
      if (!draft) {
        setErrorMsg(
          "No quiz answers found. Please complete the Roommate Compatibility Quiz first."
        );
        return;
      }

      const withUser: UserProfile = normalizeProfile({
        ...draft,
        id: draft.id || session.user.id,
        name: draft.name || session.user.name || '',
        email: draft.email || session.user.email || '',
      });

      // Show the draft immediately
      setEditedProfile(withUser);
      setProfile(withUser);

      setLoading(true);
      
      // Try to save to the server
      const res = await fetch("/api/profile", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(withUser),
      });

      if (res.ok) {
        const saved = await res.json().catch(() => withUser);
        const normalized = normalizeProfile(saved);
        setProfile(normalized);
        setEditedProfile(normalized);
        setIsEditing(false);
        setErrorMsg(null);
        
        // Clear the user-scoped quiz data from localStorage since we've used it
        const profileKey = getUserScopedKey('roommate_profile_data');
        const timestampKey = getUserScopedKey('roommate_profile_timestamp');
        localStorage.removeItem(profileKey);
        localStorage.removeItem(timestampKey);
      } else {
        const text = await res.text();
        console.warn("Profile creation failed; keeping local draft:", text);
        setIsEditing(true);
        setErrorMsg("Profile generated from quiz. Click 'Save Changes' to update your profile.");
      }
    } catch (e: any) {
      console.error("Generate profile error:", e);
      setErrorMsg(e?.message || "Failed to generate profile from quiz.");
    } finally {
      setLoading(false);
    }
  };

  const easeOutBezier: Transition["ease"] = [0.16, 1, 0.3, 1];

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: easeOutBezier },
    },
  };

  const sectionVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: easeOutBezier },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profile not found</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {errorMsg
              ? errorMsg
              : "We couldn't load your profile. You can generate it from your quiz answers."}
          </p>

          <button
            onClick={generateProfileFromQuiz}
            className="mt-4 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
          >
            Generate Profile from Quiz
          </button>

          {status === "authenticated" && (
            <button
              onClick={fetchProfile}
              className="mt-3 ml-2 inline-flex items-center rounded-lg bg-gray-200 dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Try Loading Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-3xl mx-auto">
        {/* Error Message */}
        {errorMsg && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between">
            <p className="text-red-600 dark:text-red-400">{errorMsg}</p>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
            >
              ✕
            </button>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl overflow-hidden">
          {/* Profile Header */}
          <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
            <div className="absolute -bottom-16 left-8">
              <div className="relative">
                {editedProfile?.profileImage ? (
                  <img
                    src={editedProfile.profileImage}
                    alt={profile.name || "Profile image"}
                    className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover bg-white"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        const icon = document.createElement('div');
                        icon.className = 'w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center';
                        icon.innerHTML = '<svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>';
                        parent.appendChild(icon);
                      }
                    }}
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <User className="w-16 h-16 text-white" />
                  </div>
                )}
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors shadow-lg">
                    <Camera className="w-5 h-5 text-white" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
            </div>
            <div className="absolute top-4 right-4">
              {isEditing ? (
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <Edit className="w-5 h-5" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>

          <div className="px-8 py-6 pt-20">
            {/* Basic Info */}
            <motion.div variants={sectionVariants} className="space-y-4">
              <div className="flex items-center space-x-2 text-2xl font-bold text-gray-900 dark:text-white">
                <User className="w-6 h-6" />
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile?.name ?? ""}
                    onChange={(e) =>
                      setEditedProfile((prev) => (prev ? { ...prev, name: e.target.value } : null))
                    }
                    className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg"
                  />
                ) : (
                  <span>{profile.name}</span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                  <Mail className="w-5 h-5" />
                  <span>{profile.email}</span>
                </div>

                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                  <Calendar className="w-5 h-5" />
                  {isEditing ? (
                    <input
                      type="number"
                      value={editedProfile?.age ?? 0}
                      onChange={(e) =>
                        setEditedProfile((prev) => {
                          const val = parseInt(e.target.value, 10);
                          return prev ? { ...prev, age: Number.isNaN(val) ? 0 : val } : null;
                        })
                      }
                      className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg w-24"
                    />
                  ) : (
                    <span>{profile.age} years old</span>
                  )}
                </div>

                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                  <Briefcase className="w-5 h-5" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile?.occupation ?? ""}
                      onChange={(e) =>
                        setEditedProfile((prev) =>
                          prev ? { ...prev, occupation: e.target.value } : null
                        )
                      }
                      className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg"
                    />
                  ) : (
                    <span>{profile.occupation}</span>
                  )}
                </div>

                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                  <MapPin className="w-5 h-5" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile?.location ?? ""}
                      onChange={(e) =>
                        setEditedProfile((prev) =>
                          prev ? { ...prev, location: e.target.value } : null
                        )
                      }
                      className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg"
                    />
                  ) : (
                    <span>{profile.location}</span>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Bio */}
            <motion.div variants={sectionVariants} className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">About Me</h3>
              {isEditing ? (
                <textarea
                  value={editedProfile?.bio ?? ""}
                  onChange={(e) =>
                    setEditedProfile((prev) => (prev ? { ...prev, bio: e.target.value } : null))
                  }
                  className="w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-gray-900 dark:text-white"
                />
              ) : (
                <p className="text-gray-600 dark:text-gray-300">{profile.bio}</p>
              )}
            </motion.div>

            {/* Interests */}
            <motion.div variants={sectionVariants} className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {(profile.interests ?? []).map((interest: string, index: number) => (
                  <span
                    key={`${interest}-${index}`}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 rounded-full text-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Preferences */}
            <motion.div variants={sectionVariants} className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Living Preferences
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-gray-600 dark:text-gray-300">Cleanliness</label>
                  <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${(profile.preferences.cleanliness / 5) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-600 dark:text-gray-300">Quietness</label>
                  <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${(profile.preferences.quietness / 5) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-600 dark:text-gray-300">Socialness</label>
                  <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${(profile.preferences.socialness / 5) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-600 dark:text-gray-300">Max Rent</label>
                  <div className="mt-2">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      ₦{profile.preferences.maxRent.toLocaleString()}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400"> / year</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex space-x-6">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Heart
                    className={`w-5 h-5 ${
                      profile.preferences.pets ? "text-red-500" : "text-gray-400"
                    }`}
                  />
                  <span className="ml-2">
                    {profile.preferences.pets ? "Pet Friendly" : "No Pets"}
                  </span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  🚬
                  <span className="ml-2">
                    {profile.preferences.smoking ? "Smoking Allowed" : "Non-Smoking"}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}