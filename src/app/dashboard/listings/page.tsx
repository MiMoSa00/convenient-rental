"use client";
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
  CheckCircle2,
  XCircle,
  Archive,
} from "lucide-react";

type PropertyListing = {
  id: number;
  title: string;
  description: string;
  price: string; // Store formatted NGN per year (e.g., "₦450,000/year")
  location: string;
  propertyType: "apartment" | "house" | "studio" | "shared-room";
  bedrooms: number;
  bathrooms: number;
  status: "active" | "inactive" | "rented";
  views: number;
  inquiries: number;
  datePosted: string; // ISO string
  images: string[];
  amenities: string[];
  lookingFor: string;
};

type ListingFormValues = {
  title: string;
  description: string;
  rentPerYear: string; // numeric string input; converted to NGN/year on save
  location: string;
  propertyType: "apartment" | "house" | "studio" | "shared-room";
  bedrooms: string; // numeric string input
  bathrooms: string; // numeric string input
  status: "active" | "inactive" | "rented";
  images: string; // comma or newline separated
  amenities: string; // comma or newline separated
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
  images: "",
  amenities: "",
  lookingFor: "",
};

const LOCAL_STORAGE_KEY = "myListings";

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
      return "bg-green-100 text-green-800";
    case "inactive":
      return "bg-gray-100 text-gray-800";
    case "rented":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
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

// Hook to lock body scroll when modal is open
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

const Listings: React.FC = () => {
  const [listings, setListings] = useState<PropertyListing[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingListing, setEditingListing] = useState<PropertyListing | null>(null);
  const [viewingListing, setViewingListing] = useState<PropertyListing | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PropertyListing | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);

  // Lock body scroll when any modal is open - Fixed TypeScript error
  const isAnyModalOpen = showCreateModal || !!editingListing || !!viewingListing || !!deleteTarget;
  useBodyScrollLock(isAnyModalOpen);

  // persistence
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PropertyListing[];
        setListings(parsed);
      }
    } catch {
      // ignore parsing errors
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(listings));
  }, [listings]);

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
      images: parseListInput(vals.images),
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
              images: parseListInput(vals.images),
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
    // increment views then open modal
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

  const getPropertyTypeIcon = (type: PropertyListing["propertyType"]) => {
    return <PropertyTypeIcon type={type} className="h-4 w-4" />;
  };

  return (
    <div className="min-h-full flex flex-col bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Listings</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Create and manage your property listings
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 shadow-md hover:shadow-lg"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Listing</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {listings.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="text-center py-8 sm:py-12 max-w-md mx-auto">
            <div className="mb-6">
              <Plus className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto animate-pulse" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-900">No Listings Yet</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">
              Create your first property listing to start attracting potential roommates or tenants
            </p>
            <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-medium text-blue-900 mb-2">You can list:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Entire apartments/houses for rent</li>
                <li>• Rooms in your current place</li>
                <li>• Shared accommodations</li>
                <li>• Sublets and temporary stays</li>
              </ul>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Create First Listing
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Listings</p>
                  <p className="text-xl font-bold">{listings.length}</p>
                </div>
                <Home className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-xl font-bold">
                    {listings.filter((l) => l.status === "active").length}
                  </p>
                </div>
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Views</p>
                  <p className="text-xl font-bold">{totalViews}</p>
                </div>
                <Eye className="h-6 w-6 text-purple-500" />
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Inquiries</p>
                  <p className="text-xl font-bold">{totalInquiries}</p>
                </div>
                <DollarSign className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Listings */}
          <div className="space-y-4">
            {listings.map((listing) => (
              <div
                key={listing.id}
                id={`listing-${listing.id}`}
                className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Image */}
                  <div className="w-full lg:w-48 h-32 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {listing.images && listing.images[0] ? (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Home className="h-8 w-8 text-gray-400" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {listing.title}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
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
                            className="p-1 hover:bg-gray-100 rounded"
                            aria-label="Open actions"
                          >
                            <MoreVertical className="h-4 w-4 text-gray-500" />
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

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{listing.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        {getPropertyTypeIcon(listing.propertyType)}
                        <span className="ml-1 capitalize">
                          {listing.propertyType.replace("-", " ")}
                        </span>
                      </div>
                      <span>
                        {listing.bedrooms} bed • {listing.bathrooms} bath
                      </span>
                      <span className="font-medium text-green-700">{listing.price}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
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
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Looking for: {listing.lookingFor}
                        </span>
                      )}
                      {listing.amenities.slice(0, 5).map((a, i) => (
                        <span key={`${a}-${i}`} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {a}
                        </span>
                      ))}
                      {listing.amenities.length > 5 && (
                        <span className="text-xs text-gray-500">+{listing.amenities.length - 5} more</span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleView(listing)}
                        className="flex items-center px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => setEditingListing(listing)}
                        className="flex items-center px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(listing)}
                        className="flex items-center px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors"
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

      {/* Create Listing Modal */}
      {showCreateModal && (
        <ListingFormModal
          title="Create New Listing"
          initialValues={defaultFormValues}
          onCancel={() => setShowCreateModal(false)}
          onSubmit={handleCreate}
          submitLabel="Create Listing"
        />
      )}

      {/* Edit Listing Modal */}
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
            images: editingListing.images.join(", "),
            amenities: editingListing.amenities.join(", "),
            lookingFor: editingListing.lookingFor,
          }}
          onCancel={() => setEditingListing(null)}
          onSubmit={(vals) => handleUpdate(editingListing.id, vals)}
          submitLabel="Save Changes"
        />
      )}

      {/* View Modal */}
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

      {/* Delete Confirm */}
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
      className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10"
    >
      <button
        onClick={onView}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
      >
        <Eye className="h-4 w-4 text-gray-500" />
        View
      </button>
      <button
        onClick={onEdit}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
      >
        <Edit className="h-4 w-4 text-gray-500" />
        Edit
      </button>
      <button
        onClick={onDuplicate}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
      >
        <Archive className="h-4 w-4 text-gray-500" />
        Duplicate
      </button>
      <button
        onClick={onCopyLink}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
      >
        <Copy className="h-4 w-4 text-gray-500" />
        Copy link
      </button>
      <div className="h-px bg-gray-100 my-1" />
      <button
        onClick={onSetActive}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
      >
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        Mark Active
      </button>
      <button
        onClick={onSetInactive}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
      >
        <XCircle className="h-4 w-4 text-gray-600" />
        Mark Inactive
      </button>
      <button
        onClick={onSetRented}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
      >
        <Users className="h-4 w-4 text-blue-600" />
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
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50 overflow-y-auto">
      <div className="min-h-full flex items-start justify-center p-4">
        <div className="bg-white rounded-lg w-full max-w-2xl shadow-xl my-8">
          <div className="border-b border-gray-200 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">Rent is per year. Please fill in all required fields.</p>
          </div>
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={vals.title}
                  onChange={(e) => setField("title", e.target.value)}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.title ? "border-red-300" : "border-gray-300"
                  } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="e.g., Modern 2BR Apartment in Lekki"
                />
                {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  value={vals.location}
                  onChange={(e) => setField("location", e.target.value)}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.location ? "border-red-300" : "border-gray-300"
                  } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="e.g., Lekki Phase 1, Lagos"
                />
                {errors.location && <p className="text-xs text-red-600 mt-1">{errors.location}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Yearly Rent (₦)</label>
                <input
                  type="number"
                  min={0}
                  value={vals.rentPerYear}
                  onChange={(e) => setField("rentPerYear", e.target.value)}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.rentPerYear ? "border-red-300" : "border-gray-300"
                  } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="e.g., 450000"
                />
                {errors.rentPerYear && <p className="text-xs text-red-600 mt-1">{errors.rentPerYear}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Property Type</label>
                <select
                  value={vals.propertyType}
                  onChange={(e) => setField("propertyType", e.target.value as ListingFormValues["propertyType"])}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="studio">Studio</option>
                  <option value="shared-room">Shared room</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
                <input
                  type="number"
                  min={0}
                  value={vals.bedrooms}
                  onChange={(e) => setField("bedrooms", e.target.value)}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.bedrooms ? "border-red-300" : "border-gray-300"
                  } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.bedrooms && <p className="text-xs text-red-600 mt-1">{errors.bedrooms}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
                <input
                  type="number"
                  min={0}
                  value={vals.bathrooms}
                  onChange={(e) => setField("bathrooms", e.target.value)}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.bathrooms ? "border-red-300" : "border-gray-300"
                  } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.bathrooms && <p className="text-xs text-red-600 mt-1">{errors.bathrooms}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={vals.description}
                  onChange={(e) => setField("description", e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the property, neighborhood, rules, etc."
                  rows={4}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Images (URLs)</label>
                <textarea
                  value={vals.images}
                  onChange={(e) => setField("images", e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Paste image URLs separated by commas or new lines"
                  rows={2}
                />
                <p className="text-xs text-gray-500 mt-1">First image will be used as the cover.</p>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Amenities</label>
                <textarea
                  value={vals.amenities}
                  onChange={(e) => setField("amenities", e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., WiFi, Parking, Security, Generator"
                  rows={2}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Looking For</label>
                <input
                  type="text"
                  value={vals.lookingFor}
                  onChange={(e) => setField("lookingFor", e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 1 female roommate (age 22-30)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={vals.status}
                  onChange={(e) => setField("status", e.target.value as ListingFormValues["status"])}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="rented">Rented</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200 mt-6">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50 overflow-y-auto">
      <div className="min-h-full flex items-start justify-center p-4">
        <div className="bg-white rounded-lg w-full max-w-3xl shadow-xl my-8">
          <div className="flex items-center justify-between border-b border-gray-200 p-4 sm:p-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{listing.title}</h3>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                {listing.location}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusBadgeClass(listing.status)}`}>
                {listing.status}
              </span>
              <button onClick={onClose} className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50">
                Close
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            {/* Images preview */}
            {listing.images && listing.images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {listing.images.slice(0, 6).map((src, i) => (
                  <div key={i} className="w-full h-32 bg-gray-100 rounded overflow-hidden">
                    <img src={src} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full h-40 bg-gray-100 rounded flex items-center justify-center">
                <Home className="h-8 w-8 text-gray-400" />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <PropertyTypeIcon type={listing.propertyType} className="h-4 w-4" />
                <span className="ml-1 capitalize">{listing.propertyType.replace("-", " ")}</span>
              </div>
              <span>
                {listing.bedrooms} bed • {listing.bathrooms} bath
              </span>
              <span className="font-medium text-green-700">{listing.price}</span>
              <div className="flex items-center text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(listing.datePosted).toLocaleDateString()}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">Description</h4>
              <p className="text-sm text-gray-700 whitespace-pre-line">{listing.description}</p>
            </div>

            {listing.lookingFor && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">Looking for</h4>
                <p className="text-sm text-gray-700">{listing.lookingFor}</p>
              </div>
            )}

            {listing.amenities && listing.amenities.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {listing.amenities.map((a, i) => (
                    <span key={`${a}-${i}`} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
              <button onClick={onEdit} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
                Edit
              </button>
              <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
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
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4">
      <div ref={ref} className="bg-white rounded-lg w-full max-w-md shadow-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-700 mt-2">{message}</p>
        <div className="flex items-center justify-end gap-2 mt-6">
          <button onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
            {cancelLabel}
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Listings;