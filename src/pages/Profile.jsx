import { useState } from 'react';

export default function Profile() {
  // Admin account structure matching your setup
  const [adminData, setAdminData] = useState({
    name: "Kevalon Technology Admin",
    email: "sales@kevalontechnology.in, hr@kevalontechnology.in",
    sector: "Information Technology (IT)",
    role: "Administrator",
    status: "Active",
    joinedDate: "November 2023",
    location: "Ahmedabad, Gujarat",
    phone: ["+91 9081012218", "+91 9104012218"]
  })

  const [saving, setSaving] = useState(false);

  const handleUpdate = (e) => {
    e.preventDefault();
    setSaving(true);
    
    // Simulate updating backend states
    setTimeout(() => {
      setSaving(false);
      alert("Admin account configurations saved successfully.");
    }, 600);
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header Panel */}
      <div className="border-b border-gray-300 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Profile</h1>
        <p className="mt-1 text-sm text-gray-500">Update your admin account profile, system parameters, and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Segment: Visual Meta Badge Card */}
        <div className="border border-gray-300 bg-gray-50 p-5 flex flex-col items-center text-center justify-center">
          <div className="w-16 h-16 bg-gray-800 text-white flex items-center justify-center font-bold text-xl border border-gray-700">
            AD
          </div>
          
          <h3 className="text-base font-semibold text-gray-800 mt-3">{adminData.name}</h3>
          <p className="text-xs text-indigo-600 font-semibold mt-0.5">{adminData.role}</p>
          
          <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
            <span className="inline-flex items-center bg-gray-800 text-white px-2.5 py-0.5 text-xs font-medium border border-gray-700">
              {adminData.sector}
            </span>
            <span className="inline-flex items-center bg-emerald-50 text-emerald-700 border border-emerald-300 px-2.5 py-0.5 text-xs font-medium">
              {adminData.status}
            </span>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-300 w-full text-xs text-gray-500 space-y-2 text-left">
            <p>📍 Location: <span className="text-gray-800 font-medium">{adminData.location}</span></p>
            <p>📞 Phone: <span className="text-gray-800 font-medium">
              {adminData.phone && adminData.phone.map((p, i) => (
                <span key={p}>
                  <a href={`tel:${p.replace(/\s+/g, '')}`} className="text-gray-800 underline">{p}</a>{i < adminData.phone.length - 1 ? ', ' : ''}
                </span>
              ))}
            </span></p>
          </div>
        </div>

        {/* Right Segment: Editable Parameter Inputs */}
        <div className="lg:col-span-2 bg-gray-50/20 border border-gray-300 p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Account Configurations</h2>
          
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Display Name</label>
                <input 
                  type="text"
                  value={adminData.name}
                  onChange={(e) => setAdminData({ ...adminData, name: e.target.value })}
                  className="w-full bg-white border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Registered Email</label>
                <input 
                  type="email"
                  value={adminData.email}
                  onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                  className="w-full bg-white border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Operating Sector</label>
                <input 
                  type="text"
                  disabled
                  value={adminData.sector}
                  className="w-full bg-gray-100 border border-gray-300 px-3.5 py-2.5 text-sm text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Office Location Override</label>
                <input 
                  type="text"
                  value={adminData.location}
                  onChange={(e) => setAdminData({ ...adminData, location: e.target.value })}
                  className="w-full bg-white border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-gray-300">
              <button
                type="submit"
                disabled={saving}
                className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white font-medium text-sm px-5 py-2.5 border border-gray-700"
              >
                {saving ? 'Saving Records...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}