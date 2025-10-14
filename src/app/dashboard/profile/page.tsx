"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion, Variants } from "framer-motion";
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
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [session?.user?.id]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/profile`);
      const data = await response.json();
      setProfile(data);
      setEditedProfile(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editedProfile) return;
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedProfile),
      });
      if (response.ok) {
        setProfile(editedProfile);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const { url } = await response.json();
        setEditedProfile((prev) => (prev ? { ...prev, profileImage: url } : null));
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const sectionVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <motion.div
      className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl overflow-hidden">
          {/* Profile Header */}
          <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
            <div className="absolute -bottom-16 left-8">
              <div className="relative">
                <img
                  src={editedProfile?.profileImage || "/default-avatar.png"}
                  alt={profile.name}
                  className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover"
                />
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
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
                    value={editedProfile?.name}
                    onChange={(e) =>
                      setEditedProfile((prev) =>
                        prev ? { ...prev, name: e.target.value } : null
                      )
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
                      value={editedProfile?.age}
                      onChange={(e) =>
                        setEditedProfile((prev) =>
                          prev ? { ...prev, age: parseInt(e.target.value) } : null
                        )
                      }
                      className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg w-20"
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
                      value={editedProfile?.occupation}
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
                      value={editedProfile?.location}
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                About Me
              </h3>
              {isEditing ? (
                <textarea
                  value={editedProfile?.bio}
                  onChange={(e) =>
                    setEditedProfile((prev) =>
                      prev ? { ...prev, bio: e.target.value } : null
                    )
                  }
                  className="w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-gray-900 dark:text-white"
                />
              ) : (
                <p className="text-gray-600 dark:text-gray-300">{profile.bio}</p>
              )}
            </motion.div>
            {/* Interests */}
            <motion.div variants={sectionVariants} className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, index) => (
                  <span
                    key={index}
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
                      style={{ width: `${(profile.preferences.cleanliness / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <label className="text-gray-600 dark:text-gray-300">Quietness</label>
                  <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(profile.preferences.quietness / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <label className="text-gray-600 dark:text-gray-300">Socialness</label>
                  <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(profile.preferences.socialness / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <label className="text-gray-600 dark:text-gray-300">Max Rent</label>
                  <div className="mt-2">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      ${profile.preferences.maxRent}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400"> / month</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex space-x-6">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Heart
                    className={`w-5 h-5 ${profile.preferences.pets ? "text-red-500" : "text-gray-400"}`}
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