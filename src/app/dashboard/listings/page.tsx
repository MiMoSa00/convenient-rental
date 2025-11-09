"use client"
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Edit,
  Eye,
  Trash2,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Home,
  MoreVertical,
  Copy,
  CheckCircle,
  XCircle,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react";

type PropertyListing = {
  id: number;
  title: string;
  description: string;
  price: string;
  location: string;
  propertyType: "apartment" | "house" | "studio" | "shared-room";
  bedrooms: number;
  bathrooms: number;
  status: "active" | "inactive" | "rented";
  views: number;
  inquiries: number;
  datePosted: string;
  images: string[];
  amenities: string[];
  lookingFor: string;
};

type ListingFormValues = {
  title: string;
  description: string;
  rentPerYear: string;
  location: string;
  propertyType: "apartment" | "house" | "studio" | "shared-room";
  bedrooms: string;
  bathrooms: string;
  status: "active" | "inactive" | "rented";
  images: string[];
  amenities: string;
  lookingFor: string;
};

const defaultFormValues: ListingFormValues = {
  title: "",
  description: "",
  rentPerYear: "",
  location: "",
  propertyType: "apartment",
  bedrooms: "1",
  bathrooms: "1",
  status: "active",
  images: [],
  amenities: "",
  lookingFor: "",
};

const formatNaira = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  })
    .format(n)
    .replace("NGN", "₦");

const parseListInput = (val: string): string[] => {
  if (!val) return [];
  return val
    .split(/[\n,]/g)
    .map((s) => s.trim())
    .filter(Boolean);
};

const getStatusBadgeClass = (status: PropertyListing["status"]) => {
  switch (status) {
    case "active":
      return "bg-accent/10 text-accent border border-accent/20";
    case "inactive":
      return "bg-muted text-muted-foreground border border-border";
    case "rented":
      return "bg-primary/10 text-primary border border-primary/20";
    default:
      return "bg-muted text-muted-foreground border border-border";
  }
};

const PropertyTypeIcon: React.FC<{ type: PropertyListing["propertyType"]; className?: string }> = ({
  type,
  className = "h-4 w-4",
}) => {
  if (type === "shared-room") return <Users className={className} />;
  return <Home className={className} />;
};

const useOnClickOutside = (ref: React.RefObject<HTMLElement | null>, handler: () => void) => {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      handler();
    };
    window.addEventListener("mousedown", listener);
    return () => window.removeEventListener("mousedown", listener);
  }, [ref, handler]);
};

const useBodyScrollLock = (isLocked: boolean) => {
  useEffect(() => {
    if (isLocked) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isLocked]);
};

// localStorage key for storing listings
const STORAGE_KEY = "property_listings";

// Helper functions for localStorage
const saveListingsToStorage = (listings: PropertyListing[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
  } catch (error) {
    console.error("Failed to save listings to localStorage:", error);
  }
};

const loadListingsFromStorage = (): PropertyListing[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load listings from localStorage:", error);
  }
  return [];
};

const Listings: React.FC = () => {
  // Load listings from localStorage on initial mount
  const [listings, setListings] = useState<PropertyListing[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingListing, setEditingListing] = useState<PropertyListing | null>(null);
  const [viewingListing, setViewingListing] = useState<PropertyListing | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PropertyListing | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const loadedListings = loadListingsFromStorage();
    setListings(loadedListings);
    setIsInitialized(true);
  }, []);

  // Save to localStorage whenever listings change (but skip initial load)
  useEffect(() => {
    if (isInitialized) {
      saveListingsToStorage(listings);
    }
  }, [listings, isInitialized]);

  const isAnyModalOpen = showCreateModal || !!editingListing || !!viewingListing || !!deleteTarget;
  useBodyScrollLock(isAnyModalOpen);

  const totalViews = useMemo(() => listings.reduce((sum, l) => sum + l.views, 0), [listings]);
  const totalInquiries = useMemo(() => listings.reduce((sum, l) => sum + l.inquiries, 0), [listings]);

  const handleCreate = (vals: ListingFormValues) => {
    const rent = Number(vals.rentPerYear.toString().replace(/[^0-9.]/g, ""));
    const newListing: PropertyListing = {
      id: Date.now(),
      title: vals.title.trim(),
      description: vals.description.trim(),
      price: `${formatNaira(isNaN(rent) ? 0 : rent)}/year`,
      location: vals.location.trim(),
      propertyType: vals.propertyType,
      bedrooms: Number(vals.bedrooms) || 0,
      bathrooms: Number(vals.bathrooms) || 0,
      status: vals.status,
      views: 0,
      inquiries: 0,
      datePosted: new Date().toISOString(),
      images: vals.images,
      amenities: parseListInput(vals.amenities),
      lookingFor: vals.lookingFor.trim(),
    };
    setListings((prev) => [newListing, ...prev]);
    setShowCreateModal(false);
  };

  const handleUpdate = (id: number, vals: ListingFormValues) => {
    const rent = Number(vals.rentPerYear.toString().replace(/[^0-9.]/g, ""));
    setListings((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              title: vals.title.trim(),
              description: vals.description.trim(),
              price: `${formatNaira(isNaN(rent) ? 0 : rent)}/year`,
              location: vals.location.trim(),
              propertyType: vals.propertyType,
              bedrooms: Number(vals.bedrooms) || 0,
              bathrooms: Number(vals.bathrooms) || 0,
              status: vals.status,
              images: vals.images,
              amenities: parseListInput(vals.amenities),
              lookingFor: vals.lookingFor.trim(),
            }
          : l
      )
    );
    setEditingListing(null);
  };

  const handleDeleteListing = (listingId: number) => {
    setListings((prev) => prev.filter((l) => l.id !== listingId));
    setDeleteTarget(null);
  };

  const handleView = (listing: PropertyListing) => {
    setListings((prev) =>
      prev.map((l) => (l.id === listing.id ? { ...l, views: l.views + 1 } : l))
    );
    const updated = { ...listing, views: listing.views + 1 };
    setViewingListing(updated);
  };

  const handleDuplicate = (listing: PropertyListing) => {
    const clone: PropertyListing = {
      ...listing,
      id: Date.now(),
      title: `${listing.title} (Copy)`,
      datePosted: new Date().toISOString(),
      views: 0,
      inquiries: 0,
    };
    setListings((prev) => [clone, ...prev]);
    setMenuOpenId(null);
  };

  const handleStatusChange = (listingId: number, status: PropertyListing["status"]) => {
    setListings((prev) => prev.map((l) => (l.id === listingId ? { ...l, status } : l)));
    setMenuOpenId(null);
  };

  const copyLink = async (listing: PropertyListing) => {
    try {
      const url = typeof window !== "undefined" ? window.location.href : "";
      await navigator.clipboard.writeText(`${url}#listing-${listing.id}`);
      setMenuOpenId(null);
      alert("Link copied to clipboard");
    } catch {
      alert("Failed to copy link");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="min-h-full flex flex-col bg-card rounded-lg shadow-sm">
          <style>{`
            @keyframes fade-in-down {
              from { opacity: 0; transform: translateY(-20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes fade-in-up {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes fade-in {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes scale-in {
              from { transform: scale(0.95); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
            @keyframes slide-in {
              from { transform: translateX(-10px); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
            .animate-fade-in-down {
              animation: fade-in-down 0.5s ease-out;
            }
            .animate-fade-in-up {
              animation: fade-in-up 0.5s ease-out;
            }
            .animate-fade-in {
              animation: fade-in 0.4s ease-out;
            }
            .animate-scale-in {
              animation: scale-in 0.3s ease-out;
            }
            .animate-slide-in {
              animation: slide-in 0.4s ease-out;
            }
          `}</style>

          {/* Header */}
          <div className="p-4 sm:p-6 lg:p-8 border-b border-border animate-fade-in-down">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Listings</h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  Create and manage your property listings
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-1.5 sm:gap-2 shadow-md hover:shadow-lg transform hover:scale-105 text-sm sm:text-base whitespace-nowrap"
                >
                  <Plus className="h-4 w-4 flex-shrink-0" />
                  <span>Add Listing</span>
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          {listings.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
              <div className="text-center py-8 sm:py-12 max-w-md mx-auto animate-fade-in-up">
                <div className="mb-6">
                  <Plus className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto animate-pulse" />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold mb-3 text-foreground">No Listings Yet</h2>
                <p className="text-sm sm:text-base text-muted-foreground mb-6 leading-relaxed">
                  Create your first property listing to start attracting potential roommates or tenants
                </p>
                <div className="bg-primary/10 rounded-lg p-4 mb-6 text-left border border-primary/20">
                  <h3 className="font-medium text-foreground mb-2">You can list:</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Entire apartments/houses for rent</li>
                    <li>• Rooms in your current place</li>
                    <li>• Shared accommodations</li>
                    <li>• Sublets and temporary stays</li>
                  </ul>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Create First Listing
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 p-4 sm:p-6 lg:p-8">
              {/* Stats Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Total Listings", value: listings.length, icon: Home, color: "primary" },
                  { label: "Active", value: listings.filter((l) => l.status === "active").length, icon: CheckCircle, color: "accent" },
                  { label: "Total Views", value: totalViews, icon: Eye, color: "info" },
                  { label: "Inquiries", value: totalInquiries, icon: DollarSign, color: "warning" },
                ].map((stat, index) => (
                  <div 
                    key={stat.label} 
                    className="bg-card border border-border p-4 rounded-lg animate-fade-in-up hover:shadow-md transition-shadow duration-300"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-xl font-bold text-foreground">{stat.value}</p>
                      </div>
                      <stat.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Listings */}
              <div className="space-y-4">
                {listings.map((listing, index) => (
                  <div
                    key={listing.id}
                    id={`listing-${listing.id}`}
                    className="bg-card border border-border rounded-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-slide-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      {/* Image */}
                      <div className="w-full lg:w-48 h-32 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {listing.images && listing.images[0] ? (
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <Home className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-foreground truncate">
                              {listing.title}
                            </h3>
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                              <span className="truncate">{listing.location}</span>
                            </div>
                          </div>
                          <div className="relative">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusBadgeClass(
                                  listing.status
                                )}`}
                              >
                                {listing.status}
                              </span>
                              <button
                                onClick={() =>
                                  setMenuOpenId((prev) => (prev === listing.id ? null : listing.id))
                                }
                                className="p-1 hover:bg-muted rounded transition-colors"
                                aria-label="Open actions"
                              >
                                <MoreVertical className="h-4 w-4 text-muted-foreground" />
                              </button>
                            </div>
                            {menuOpenId === listing.id && (
                              <CardMenu
                                onClose={() => setMenuOpenId(null)}
                                onView={() => handleView(listing)}
                                onEdit={() => setEditingListing(listing)}
                                onDuplicate={() => handleDuplicate(listing)}
                                onCopyLink={() => copyLink(listing)}
                                onSetActive={() => handleStatusChange(listing.id, "active")}
                                onSetInactive={() => handleStatusChange(listing.id, "inactive")}
                                onSetRented={() => handleStatusChange(listing.id, "rented")}
                              />
                            )}
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{listing.description}</p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center">
                            <PropertyTypeIcon type={listing.propertyType} className="h-4 w-4" />
                            <span className="ml-1 capitalize">
                              {listing.propertyType.replace("-", " ")}
                            </span>
                          </div>
                          <span>
                            {listing.bedrooms} bed • {listing.bathrooms} bath
                          </span>
                          <span className="font-medium text-accent">{listing.price}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {listing.views} views
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {listing.inquiries} inquiries
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(listing.datePosted).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {listing.lookingFor && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded border border-primary/20">
                              Looking for: {listing.lookingFor}
                            </span>
                          )}
                          {listing.amenities.slice(0, 5).map((a, i) => (
                            <span key={`${a}-${i}`} className="text-xs bg-muted text-foreground px-2 py-1 rounded">
                              {a}
                            </span>
                          ))}
                          {listing.amenities.length > 5 && (
                            <span className="text-xs text-muted-foreground">+{listing.amenities.length - 5} more</span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleView(listing)}
                            className="flex items-center px-3 py-1.5 text-sm border border-border rounded hover:bg-muted transition-colors text-foreground"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </button>
                          <button
                            onClick={() => setEditingListing(listing)}
                            className="flex items-center px-3 py-1.5 text-sm border border-border rounded hover:bg-muted transition-colors text-foreground"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteTarget(listing)}
                            className="flex items-center px-3 py-1.5 text-sm border border-destructive/50 text-destructive rounded hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modals */}
          {showCreateModal && (
            <ListingFormModal
              title="Create New Listing"
              initialValues={defaultFormValues}
              onCancel={() => setShowCreateModal(false)}
              onSubmit={handleCreate}
              submitLabel="Create Listing"
            />
          )}

          {editingListing && (
            <ListingFormModal
              title="Edit Listing"
              initialValues={{
                title: editingListing.title,
                description: editingListing.description,
                rentPerYear: editingListing.price.replace(/[^\d]/g, ""),
                location: editingListing.location,
                propertyType: editingListing.propertyType,
                bedrooms: String(editingListing.bedrooms),
                bathrooms: String(editingListing.bathrooms),
                status: editingListing.status,
                images: editingListing.images,
                amenities: editingListing.amenities.join(", "),
                lookingFor: editingListing.lookingFor,
              }}
              onCancel={() => setEditingListing(null)}
              onSubmit={(vals) => handleUpdate(editingListing.id, vals)}
              submitLabel="Save Changes"
            />
          )}

          {viewingListing && (
            <ViewModal
              listing={viewingListing}
              onClose={() => setViewingListing(null)}
              onEdit={() => {
                setEditingListing(viewingListing);
                setViewingListing(null);
              }}
            />
          )}

          {deleteTarget && (
            <ConfirmDialog
              title="Delete Listing"
              message={`Are you sure you want to delete "${deleteTarget.title}"? This action cannot be undone.`}
              confirmLabel="Delete"
              cancelLabel="Cancel"
              onCancel={() => setDeleteTarget(null)}
              onConfirm={() => handleDeleteListing(deleteTarget.id)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const ImageUploader: React.FC<{
  images: string[];
  onChange: (images: string[]) => void;
}> = ({ images, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            onChange([...images, event.target.result as string]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-2">Property Images</label>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
        {images.map((img, index) => (
          <div key={index} className="relative group">
            <img
              src={img}
              alt={`Upload ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg border-2 border-border"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
            {index === 0 && (
              <span className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                Cover
              </span>
            )}
          </div>
        ))}
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center hover:border-primary hover:bg-primary/10 transition-colors group"
        >
          <Upload className="h-8 w-8 text-muted-foreground group-hover:text-primary mb-2" />
          <span className="text-sm text-muted-foreground group-hover:text-primary">Upload Image</span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <p className="text-xs text-muted-foreground">
        Click to upload images from your device. First image will be used as cover.
      </p>
    </div>
  );
};

const CardMenu: React.FC<{
  onClose: () => void;
  onView: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onCopyLink: () => void;
  onSetActive: () => void;
  onSetInactive: () => void;
  onSetRented: () => void;
}> = ({ onClose, onView, onEdit, onDuplicate, onCopyLink, onSetActive, onSetInactive, onSetRented }) => {
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, onClose);
  return (
    <div
      ref={ref}
      className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg z-10 animate-scale-in"
    >
      <button
        onClick={onView}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-foreground transition-colors"
      >
        <Eye className="h-4 w-4 text-muted-foreground" />
        View
      </button>
      <button
        onClick={onEdit}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-foreground transition-colors"
      >
        <Edit className="h-4 w-4 text-muted-foreground" />
        Edit
      </button>
      <button
        onClick={onDuplicate}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-foreground transition-colors"
      >
        <Copy className="h-4 w-4 text-muted-foreground" />
        Duplicate
      </button>
      <button
        onClick={onCopyLink}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-foreground transition-colors"
      >
        <Copy className="h-4 w-4 text-muted-foreground" />
        Copy link
      </button>
      <div className="h-px bg-border my-1" />
      <button
        onClick={onSetActive}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-foreground transition-colors"
      >
        <CheckCircle className="h-4 w-4 text-accent" />
        Mark Active
      </button>
      <button
        onClick={onSetInactive}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-foreground transition-colors"
      >
        <XCircle className="h-4 w-4 text-muted-foreground" />
        Mark Inactive
      </button>
      <button
        onClick={onSetRented}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-foreground transition-colors"
      >
        <Users className="h-4 w-4 text-primary" />
        Mark as Rented
      </button>
    </div>
  );
};

const ListingFormModal: React.FC<{
  title: string;
  initialValues: ListingFormValues;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (vals: ListingFormValues) => void;
}> = ({ title, initialValues, submitLabel, onCancel, onSubmit }) => {
  const [vals, setVals] = useState<ListingFormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setVals(initialValues);
    setErrors({});
  }, [initialValues]);

  const setField = <K extends keyof ListingFormValues>(key: K, value: ListingFormValues[K]) => {
    setVals((prev) => ({ ...prev, [key]: value }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!vals.title.trim()) e.title = "Title is required";
    if (!vals.location.trim()) e.location = "Location is required";
    if (!vals.rentPerYear || isNaN(Number(vals.rentPerYear))) e.rentPerYear = "Enter a valid yearly rent";
    if (Number(vals.bedrooms) < 0) e.bedrooms = "Bedrooms cannot be negative";
    if (Number(vals.bathrooms) < 0) e.bathrooms = "Bathrooms cannot be negative";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(vals);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto animate-fade-in">
      <div className="min-h-full flex items-start justify-center p-4">
        <div className="bg-card rounded-lg w-full max-w-2xl shadow-xl my-8 animate-scale-in">
          <div className="border-b border-border p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">Rent is per year. Please fill in all required fields.</p>
          </div>
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-foreground">Title</label>
                <input
                  type="text"
                  value={vals.title}
                  onChange={(e) => setField("title", e.target.value)}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.title ? "border-destructive" : "border-input"
                  } px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring`}
                  placeholder="e.g., Modern 2BR Apartment in Lekki"
                />
                {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Location</label>
                <input
                  type="text"
                  value={vals.location}
                  onChange={(e) => setField("location", e.target.value)}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.location ? "border-destructive" : "border-input"
                  } px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring`}
                  placeholder="e.g., Lekki Phase 1, Lagos"
                />
                {errors.location && <p className="text-xs text-destructive mt-1">{errors.location}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Yearly Rent (₦)</label>
                <input
                  type="number"
                  min={0}
                  value={vals.rentPerYear}
                  onChange={(e) => setField("rentPerYear", e.target.value)}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.rentPerYear ? "border-destructive" : "border-input"
                  } px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring`}
                  placeholder="e.g., 450000"
                />
                {errors.rentPerYear && <p className="text-xs text-destructive mt-1">{errors.rentPerYear}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Property Type</label>
                <select
                  value={vals.propertyType}
                  onChange={(e) => setField("propertyType", e.target.value as ListingFormValues["propertyType"])}
                  className="mt-1 block w-full rounded-md border border-input px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="studio">Studio</option>
                  <option value="shared-room">Shared room</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Bedrooms</label>
                <input
                  type="number"
                  min={0}
                  value={vals.bedrooms}
                  onChange={(e) => setField("bedrooms", e.target.value)}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.bedrooms ? "border-destructive" : "border-input"
                  } px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring`}
                />
                {errors.bedrooms && <p className="text-xs text-destructive mt-1">{errors.bedrooms}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Bathrooms</label>
                <input
                  type="number"
                  min={0}
                  value={vals.bathrooms}
                  onChange={(e) => setField("bathrooms", e.target.value)}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.bathrooms ? "border-destructive" : "border-input"
                  } px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring`}
                />
                {errors.bathrooms && <p className="text-xs text-destructive mt-1">{errors.bathrooms}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-foreground">Description</label>
                <textarea
                  value={vals.description}
                  onChange={(e) => setField("description", e.target.value)}
                  className="mt-1 block w-full rounded-md border border-input px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Describe the property, neighborhood, rules, etc."
                  rows={4}
                />
              </div>

              <div className="sm:col-span-2">
                <ImageUploader
                  images={vals.images}
                  onChange={(images) => setField("images", images)}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-foreground">Amenities</label>
                <textarea
                  value={vals.amenities}
                  onChange={(e) => setField("amenities", e.target.value)}
                  className="mt-1 block w-full rounded-md border border-input px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="e.g., WiFi, Parking, Security, Generator"
                  rows={2}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-foreground">Looking For</label>
                <input
                  type="text"
                  value={vals.lookingFor}
                  onChange={(e) => setField("lookingFor", e.target.value)}
                  className="mt-1 block w-full rounded-md border border-input px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="e.g., 1 female roommate (age 22-30)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Status</label>
                <select
                  value={vals.status}
                  onChange={(e) => setField("status", e.target.value as ListingFormValues["status"])}
                  className="mt-1 block w-full rounded-md border border-input px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="rented">Rented</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border mt-6">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-input rounded hover:bg-muted text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
              >
                {submitLabel}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const ViewModal: React.FC<{
  listing: PropertyListing;
  onClose: () => void;
  onEdit: () => void;
}> = ({ listing, onClose, onEdit }) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto animate-fade-in">
      <div className="min-h-full flex items-start justify-center p-4">
        <div className="bg-card rounded-lg w-full max-w-3xl shadow-xl my-8 animate-scale-in">
          <div className="flex items-center justify-between border-b border-border p-4 sm:p-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">{listing.title}</h3>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                {listing.location}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusBadgeClass(listing.status)}`}>
                {listing.status}
              </span>
              <button onClick={onClose} className="px-3 py-1.5 border border-input rounded hover:bg-muted text-foreground transition-colors">
                Close
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            {listing.images && listing.images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {listing.images.slice(0, 6).map((src, i) => (
                  <div key={i} className="w-full h-32 bg-muted rounded overflow-hidden">
                    <img src={src} alt={`Image ${i + 1}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full h-40 bg-muted rounded flex items-center justify-center">
                <Home className="h-8 w-8 text-muted-foreground" />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <PropertyTypeIcon type={listing.propertyType} className="h-4 w-4" />
                <span className="ml-1 capitalize">{listing.propertyType.replace("-", " ")}</span>
              </div>
              <span>
                {listing.bedrooms} bed • {listing.bathrooms} bath
              </span>
              <span className="font-medium text-accent">{listing.price}</span>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(listing.datePosted).toLocaleDateString()}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-1">Description</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{listing.description}</p>
            </div>

            {listing.lookingFor && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">Looking for</h4>
                <p className="text-sm text-muted-foreground">{listing.lookingFor}</p>
              </div>
            )}

            {listing.amenities && listing.amenities.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {listing.amenities.map((a, i) => (
                    <span key={`${a}-${i}`} className="text-xs bg-muted text-foreground px-2 py-1 rounded">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button onClick={onEdit} className="px-4 py-2 border border-input rounded hover:bg-muted text-foreground transition-colors">
                Edit
              </button>
              <button onClick={onClose} className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ConfirmDialog: React.FC<{
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ title, message, confirmLabel = "Confirm", cancelLabel = "Cancel", onConfirm, onCancel }) => {
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, onCancel);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div ref={ref} className="bg-card rounded-lg w-full max-w-md shadow-xl p-6 animate-scale-in">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mt-2">{message}</p>
        <div className="flex items-center justify-end gap-2 mt-6">
          <button onClick={onCancel} className="px-4 py-2 border border-input rounded hover:bg-muted text-foreground transition-colors">
            {cancelLabel}
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 transition-colors">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Listings