"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  User,
  Mail,
  Calendar,
  MapPin,
  Heart,
  Edit,
  Check,
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
  const { data: session, status } = useSession() as { data: any; status: string };
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

    const localProfile = buildProfileFromLocalQuiz();
    if (localProfile) {
      if (session?.user?.id) {
        const userId = session.user.id;
        const savedImageUrl = localStorage.getItem(`user_profile_image_${userId}`);
        if (savedImageUrl) {
          localProfile.profileImage = savedImageUrl;
        }
      }
      setProfile(localProfile);
      setEditedProfile(localProfile);
      setLoading(false);
    } else {
      fetchProfile();
    }
  }, [status, session?.user?.id]);

  const normalizeProfile = (data: any): UserProfile => {
    return {
      ...data,
      interests: Array.isArray(data?.interests) ? data.interests : [],
      profileImage: data?.profileImage || data?.image || '',
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
      console.log('Saving profile with image:', editedProfile.profileImage?.substring(0, 50));
      
      let response = await fetch("/api/profile", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedProfile),
      });

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
        console.log('Profile saved, image URL:', normalized.profileImage);
        setProfile(normalized);
        setEditedProfile(normalized);
        setIsEditing(false);
        setErrorMsg(null);
        
        if (session?.user?.id && normalized.profileImage) {
          const userId = session.user.id;
          localStorage.setItem(`user_profile_image_${userId}`, normalized.profileImage);
        }
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

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Image size must be less than 5MB");
      return;
    }

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
        console.log('Image uploaded, URL:', data.url);
        setEditedProfile((prev) => (prev ? { ...prev, profileImage: data.url } : null));
        
        if (session?.user?.id) {
          const userId = session.user.id;
          localStorage.setItem(`user_profile_image_${userId}`, data.url);
        }
        
        setErrorMsg("Image uploaded! Click 'Save Changes' to update your profile.");
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

  const mapRoommateProfileToUserProfile = (roommateProfile: any): Partial<UserProfile> => {
    const cleanlinessMap: Record<string, number> = {
      'very-clean': 5,
      'moderately-clean': 3,
      'relaxed': 1
    };

    const socialnessMap: Record<string, number> = {
      'very-social': 5,
      'moderately-social': 3,
      'prefer-quiet': 1
    };

    const quietnessMap: Record<string, number> = {
      'early-bird': 4,
      'night-owl': 2,
      'flexible': 3
    };

    const smoking = roommateProfile.smokingTolerance === 'anywhere' || 
                    roommateProfile.smokingTolerance === 'outdoor-only';

    const pets = roommateProfile.petPreference === 'love-pets' || 
                 roommateProfile.petPreference === 'okay-with-pets';

    const interests = roommateProfile.sharedActivities || [];
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

  const buildProfileFromLocalQuiz = (): UserProfile | null => {
    if (typeof window === "undefined") return null;
    if (!session?.user?.id) return null;

    const profileKey = getUserScopedKey('roommate_profile_data');
    const raw = localStorage.getItem(profileKey);

    if (!raw) return null;

    let quizData: any;
    try {
      quizData = JSON.parse(raw);
    } catch {
      return null;
    }

    if (quizData.userId && quizData.userId !== session.user.id) {
      console.warn('Quiz data user ID mismatch, ignoring');
      return null;
    }

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

      setEditedProfile(withUser);
      setProfile(withUser);

      setLoading(true);
      
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

  const easeOutBezier: readonly [number, number, number, number] = [0.16, 1, 0.3, 1];

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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 sm:p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Profile not found</h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
            {errorMsg
              ? errorMsg
              : "We couldn't load your profile. You can generate it from your quiz answers."}
          </p>

          <button
            onClick={generateProfileFromQuiz}
            className="mt-4 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm sm:text-base text-white hover:bg-blue-700 transition-colors"
          >
            Generate Profile from Quiz
          </button>

          {status === "authenticated" && (
            <button
              onClick={fetchProfile}
              className="mt-3 ml-2 inline-flex items-center rounded-lg bg-gray-200 dark:bg-gray-700 px-4 py-2 text-sm sm:text-base text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
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
      className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8 px-3 sm:px-4 lg:px-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-4xl mx-auto">
        {/* Error Message */}
        {errorMsg && (
          <div className="mb-4 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start justify-between">
            <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 flex-1 break-words pr-2">{errorMsg}</p>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 ml-2 flex-shrink-0"
            >
              ✕
            </button>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl overflow-hidden">
          {/* Profile Header */}
          <div className="relative h-32 sm:h-48 bg-gradient-to-r from-blue-500 to-purple-600">
            <div className="absolute -bottom-12 sm:-bottom-16 left-4 sm:left-8">
              <div className="relative">
                {editedProfile?.profileImage ? (
                  <img
                    src={editedProfile.profileImage}
                    alt={profile.name || "Profile image"}
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover bg-white"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        const icon = document.createElement('div');
                        icon.className = 'w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-gray-800 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center';
                        icon.innerHTML = '<svg class="w-12 h-12 sm:w-16 sm:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>';
                        parent.appendChild(icon);
                      }
                    }}
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-gray-800 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <User className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                  </div>
                )}
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-500 p-1.5 sm:p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors shadow-lg">
                    <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
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
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
              {isEditing ? (
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-1 sm:space-x-2 bg-green-500 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-green-600 transition-colors text-xs sm:text-sm"
                >
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Save Changes</span>
                  <span className="sm:hidden">Save</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-1 sm:space-x-2 bg-white/20 backdrop-blur-sm text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-white/30 transition-colors text-xs sm:text-sm"
                >
                  <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Edit Profile</span>
                  <span className="sm:hidden">Edit</span>
                </button>
              )}
            </div>
          </div>

          <div className="px-4 sm:px-6 md:px-8 py-6 pt-16 sm:pt-20">
            {/* Basic Info */}
            <motion.div variants={sectionVariants} className="space-y-4">
              <div className="flex items-center space-x-2 text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                <User className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile?.name ?? ""}
                    onChange={(e) =>
                      setEditedProfile((prev) => (prev ? { ...prev, name: e.target.value } : null))
                    }
                    className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg w-full text-base sm:text-xl"
                  />
                ) : (
                  <span className="break-words">{profile.name}</span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="break-all">{profile.email}</span>
                </div>

                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
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
                      className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg w-20 sm:w-24 text-sm sm:text-base"
                    />
                  ) : (
                    <span>{profile.age} years old</span>
                  )}
                </div>

                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile?.occupation ?? ""}
                      onChange={(e) =>
                        setEditedProfile((prev) =>
                          prev ? { ...prev, occupation: e.target.value } : null
                        )
                      }
                      className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg w-full text-sm sm:text-base"
                    />
                  ) : (
                    <span className="break-words">{profile.occupation}</span>
                  )}
                </div>

                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile?.location ?? ""}
                      onChange={(e) =>
                        setEditedProfile((prev) =>
                          prev ? { ...prev, location: e.target.value } : null
                        )
                      }
                      className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg w-full text-sm sm:text-base"
                    />
                  ) : (
                    <span className="break-words">{profile.location}</span>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Bio */}
            <motion.div variants={sectionVariants} className="mt-6 sm:mt-8">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">About Me</h3>
              {isEditing ? (
                <textarea
                  value={editedProfile?.bio ?? ""}
                  onChange={(e) =>
                    setEditedProfile((prev) => (prev ? { ...prev, bio: e.target.value } : null))
                  }
                  className="w-full h-24 sm:h-32 bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-gray-900 dark:text-white text-sm sm:text-base"
                />
              ) : (
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base break-words">{profile.bio}</p>
              )}
            </motion.div>

            {/* Interests */}
            <motion.div variants={sectionVariants} className="mt-6 sm:mt-8">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {(profile.interests ?? []).map((interest: string, index: number) => (
                  <span
                    key={`${interest}-${index}`}
                    className="px-2 sm:px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 rounded-full text-xs sm:text-sm break-words"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Preferences */}
            <motion.div variants={sectionVariants} className="mt-6 sm:mt-8">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Living Preferences
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Cleanliness</label>
                  <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{
                        width: `${(profile.preferences.cleanliness / 5) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Quietness</label>
                  <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{
                        width: `${(profile.preferences.quietness / 5) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Socialness</label>
                  <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{
                        width: `${(profile.preferences.socialness / 5) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Max Rent</label>
                  <div className="mt-2">
                    <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                      ₦{profile.preferences.maxRent.toLocaleString()}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base"> / year</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row sm:space-x-6 space-y-3 sm:space-y-0">
                <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  <Heart
                    className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${
                      profile.preferences.pets ? "text-red-500" : "text-gray-400"
                    }`}
                  />
                  <span className="ml-2">
                    {profile.preferences.pets ? "Pet Friendly" : "No Pets"}
                  </span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  <span className="text-lg sm:text-xl">🚬</span>
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