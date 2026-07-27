import { useState, useEffect } from "react";
import { Pencil, Trash2, X, Plus, Briefcase, MapPin, Clock, Users, Tag, List } from "lucide-react";

export default function Positions() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const initialFormState = {
    title: "",
    type: "Full-time",
    category: "",
    desc: "",
    exp: "",
    location: "",
    skills: "",
    responsibilities: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      setLoading(true);
      const res = await fetch("https://kt-backend-1.onrender.com/api/position");
      const data = await res.json();
      setPositions(data.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      const url = editId
        ? `https://kt-backend-1.onrender.com/api/position/${editId}`
        : `https://kt-backend-1.onrender.com/api/position/add`;

      const method = editId ? "PUT" : "POST";

      const payload = {
        ...formData,
        skills: formData.skills
          ? formData.skills.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        responsibilities: formData.responsibilities
          ? formData.responsibilities.split(",").map((r) => r.trim()).filter(Boolean)
          : [],
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        setShowModal(false);
        setEditId(null);
        setFormData(initialFormState);
        fetchPositions();
        alert(editId ? "Position updated successfully!" : "Position created successfully!");
      } else {
        alert(result.message || "Something went wrong!");
      }
    } catch (error) {
      console.log(error);
      alert("Error saving position!");
    }
  };

  const handleEdit = (pos) => {
    setEditId(pos._id);
    setFormData({
      title: pos.title || "",
      type: pos.type || "",
      category: pos.category || "",
      desc: pos.desc || "",
      exp: pos.exp || "",
      location: pos.location || "",
      skills: Array.isArray(pos.skills) ? pos.skills.join(", ") : "",
      responsibilities: Array.isArray(pos.responsibilities) ? pos.responsibilities.join(", ") : "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this position?")) {
      try {
        const response = await fetch(`https://kt-backend-1.onrender.com/api/position/${id}`, {
          method: "DELETE",
        });
        const result = await response.json();
        if (result.success) {
          fetchPositions();
          alert("Position deleted successfully!");
        } else {
          alert(result.message || "Failed to delete position!");
        }
      } catch (error) {
        console.log(error);
        alert("Error deleting position!");
      }
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "full-time":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "part-time":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "intern":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "contract":
        return "bg-orange-50 text-orange-700 border-orange-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Positions
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage all job positions and openings
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="px-4 py-2 bg-white border border-gray-200 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Total: </span>
                <span className="font-semibold text-gray-900">{positions.length}</span>
              </div>
              <button
                onClick={() => {
                  setEditId(null);
                  setFormData(initialFormState);
                  setShowModal(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Position
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white border border-gray-200 overflow-hidden p-4 sm:p-6">
          {loading ? (
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3, 4].map((skeleton) => (
                <div key={skeleton} className="animate-pulse border border-gray-200 p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="h-6 w-1/3 rounded bg-gray-200" />
                      <div className="h-4 w-1/4 rounded bg-gray-200" />
                    </div>
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded bg-gray-200" />
                      <div className="h-8 w-8 rounded bg-gray-200" />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <div className="h-6 w-20 rounded-full bg-gray-200" />
                    <div className="h-6 w-24 rounded-full bg-gray-200" />
                    <div className="h-6 w-20 rounded-full bg-gray-200" />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <div className="h-5 w-16 rounded bg-gray-200" />
                    <div className="h-5 w-20 rounded bg-gray-200" />
                    <div className="h-5 w-14 rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : positions.length === 0 ? (
            <div className="text-center py-16">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-50 p-4 border border-blue-200">
                  <Briefcase className="h-8 w-8 text-blue-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No Positions Available</h3>
              <p className="mt-1 text-sm text-gray-500">Create your first position to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {positions.map((pos) => (
                <div
                  key={pos._id}
                  className="group border border-gray-200 p-5 hover:shadow-md transition-all duration-200 hover:border-gray-300"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-lg font-bold text-gray-900">
                          {pos.title}
                        </h2>
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-medium border ${getTypeColor(pos.type)}`}>
                          {pos.type || "Full-time"}
                        </span>
                      </div>
                      
                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600">
                        {pos.category && (
                          <span className="flex items-center gap-1.5">
                            <Briefcase className="h-4 w-4 text-gray-400" />
                            {pos.category}
                          </span>
                        )}
                        {pos.location && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            {pos.location}
                          </span>
                        )}
                        {pos.exp && (
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-gray-400" />
                            {pos.exp}
                          </span>
                        )}
                      </div>

                      {/* Skills */}
                      {pos.skills && pos.skills.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          <Tag className="h-4 w-4 text-gray-400 mt-0.5" />
                          {pos.skills.map((skill, index) => (
                            <span key={index} className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 border border-blue-100">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Description */}
                      {pos.desc && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {pos.desc}
                        </p>
                      )}

                      {/* Responsibilities */}
                      {pos.responsibilities && pos.responsibilities.length > 0 && (
                        <div className="mt-2">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                            <List className="h-3.5 w-3.5" />
                            <span>Responsibilities:</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {pos.responsibilities.map((resp, index) => (
                              <span key={index} className="bg-gray-50 text-gray-700 text-xs px-2.5 py-1 border border-gray-200">
                                {resp}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 lg:mt-0 mt-3">
                      <button
                        onClick={() => handleEdit(pos)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        aria-label="Edit position"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(pos._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        aria-label="Delete position"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setShowModal(false)} 
          />
          <div className="relative w-full max-w-2xl bg-white border border-gray-200 shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[95vh] sm:max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-4 sm:px-6 py-4 flex-shrink-0">
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {editId ? "Edit Position" : "Create Position"}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  {editId ? "Update the position details" : "Add a new job position"}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors ml-2 flex-shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1">
              <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position Title *
                  </label>
                  <input
                    name="title"
                    placeholder="e.g. Senior Software Engineer"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    name="category"
                    placeholder="e.g. Engineering"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      name="location"
                      placeholder="e.g. Remote, NYC"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Experience
                    </label>
                    <input
                      name="exp"
                      placeholder="e.g. 3-5 years"
                      value={formData.exp}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Intern">Intern</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Skills (Comma separated)
                  </label>
                  <input
                    name="skills"
                    placeholder="HTML, CSS, JavaScript, React"
                    value={formData.skills}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                  <p className="mt-1 text-xs text-gray-400">Enter skills separated by commas</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Responsibilities (Comma separated)
                  </label>
                  <textarea
                    name="responsibilities"
                    placeholder="Develop responsive UI, Integrate APIs, Fix bugs"
                    value={formData.responsibilities}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-400">Enter responsibilities separated by commas</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="desc"
                    placeholder="Describe the position responsibilities..."
                    value={formData.desc}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-4 sm:px-6 py-4 flex gap-3 flex-shrink-0 bg-white">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                {editId ? "Update Position" : "Create Position"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}